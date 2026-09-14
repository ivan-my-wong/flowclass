import { expect } from "@playwright/test";
import fs from 'fs';
import path from "path";
import { BasePage } from "./base.page";

type StudentDetail = { name: string, email: string, phone: string }
class ClassSchedulePage extends BasePage {
    searchStudent(callback: (studentDetail: StudentDetail) => void) {
        let studentDetail = { name: '', email: '', phone: '' }
        new Promise<void>(resolve => {
            const listener = async response => {
                if (response.url().includes('/students?search=')) {
                    try {
                        const responseBody = await response.json()
                        studentDetail = responseBody.data.content?.[0]
                        await callback(studentDetail)
                        this.page.removeListener('response', listener)
                        resolve()
                    } catch (err) {
                        console.error('Error', err)
                        this.page.removeListener('response', listener)
                        resolve()
                    }
                }
            }
            this.page.on('response', listener)
        })
    }

    async goToCalendarPage() {
        await this.goto('/course-calendar')
        await this.page.waitForLoadState('networkidle')
    }

    async searchStudentInsideStudentLesson() {
        await this.goToCalendarPage()
        this.searchStudent(async (studentDetail) => {
            const event = this.page.locator('a.fc-event').first()
            if (await event.isVisible()) {
                await this.page.locator('a.fc-event').first().click()
                await this.page.waitForTimeout(3000)

                if (studentDetail?.name) {
                    const { email, name, phone } = studentDetail
                    expect(this.page.getByText(email).first()).toBeVisible()

                    await this.page.getByPlaceholder('Search student by typing').fill(name)
                    await this.page.waitForTimeout(3000)
                    expect(this.page.getByText(email).first()).toBeVisible()
                    expect(this.page.getByText(phone).first()).toBeVisible()
                    expect(this.page.getByText(name).first()).toBeVisible()

                    await this.page.getByPlaceholder('Search student by typing').fill(name + '1')
                    await this.page.waitForTimeout(3000)
                    expect(this.page.getByText(name).first()).not.toBeVisible()
                }
            }

            // close detail
            await this.page
                .locator('header')
                .filter({ hasText: 'Lesson Detail' })
                .getByRole('img')
                .click()
        })
    }

    async createDownloadDir() {
        const downloadDir = path.resolve(__dirname, '../downloads')
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir)
        }
        // Register cleanup
        const closeListener = () => {
            try {
                if (fs.existsSync(downloadDir)) {
                    fs.rmSync(downloadDir, { recursive: true, force: true })
                }
                this.page.removeListener('close', closeListener)
            } catch (err) {
                console.error('Error', err)
                this.page.removeListener('close', closeListener)
            }
        }
        this.page.on('close', closeListener)
        return downloadDir
    }

    async exportCSV() {
        const downloadDir = await this.createDownloadDir()
        await this.goToCalendarPage()

        this.searchStudent(async (studentDetail) => {
            await this.page.locator('#classSchedule').click()
            await this.page.waitForTimeout(3000)

            const event = this.page.locator('a.fc-event').first()

            if (await event.isVisible()) {
                await this.page.locator('a.fc-event').first().click()
                await this.page.waitForTimeout(3000)

                if (studentDetail?.name) {
                    const { email, name, phone } = studentDetail

                    await new Promise<void>(resolve => {
                        this.page.on('download', async download => {
                            const filePath = path.join(downloadDir, download.suggestedFilename())
                            await download.saveAs(filePath)

                            expect(fs.existsSync(filePath)).toBeTruthy()

                            const fileContent = fs.readFileSync(filePath, 'utf8')
                            expect(fileContent.includes(name)).toBeTruthy()
                            expect(fileContent.includes(email)).toBeTruthy()
                            expect(fileContent.includes(phone)).toBeTruthy()
                        })
                        resolve()
                    })

                    await this.page.getByTestId('export-csv-btn').click()
                }
            }

            // close detail
            await this.page
                .locator('header')
                .filter({ hasText: 'Lesson Detail' })
                .getByRole('img')
                .click()
        })
    }
}

export default ClassSchedulePage