// tests/onboarding/complete-flow.spec.ts
import { test, expect } from '@playwright/test'
import { OnboardingPage } from './pages/onboarding.page'
import path from 'path'

test.describe('Onboarding Setup Flow', () => {
  // Test for completing the entire onboarding process
  test('should complete the entire setup process', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page)
    await onboardingPage.navigateToSetup()

    // Step 0: Initial welcome screen
    await onboardingPage.page.getByText('Yes, set up now').click()

    // Step 1: School basic information
    await onboardingPage.fillSchoolInfo(
      'Test School',
      'testschool',
      '0912345678',
      'Hong Kong SAR'
    )
    await onboardingPage.nextButton.click()

    // Step 2: School details (logo, theme color, description)
    const logoPath = path.join(process.cwd(), 'tests/fixtures/logo.png')
    await onboardingPage.uploadLogo(logoPath)
    await onboardingPage.selectThemeColor()
    await onboardingPage.fillSchoolDescription(
      'This is a great school with excellent teachers'
    )
    await onboardingPage.nextButton.click()

    // Step 3: Course information
    await onboardingPage.fillCourseInfo(
      'Introduction to Programming',
      'intro-programming',
      path.join(process.cwd(), 'tests/fixtures/logo.png'),
      'This is a great course with excellent teachers'
    )
    await onboardingPage.nextButton.click()

    // Step 4: Class setup
    await onboardingPage.createClass({
      i: 1,
      type: 'regular',
    })
    await onboardingPage.nextButton.click()

    // Step 5: Payment method setup
    await onboardingPage.createPaymentMethod()
    await onboardingPage.nextButton.click()

    // Step 6: Application form setup
    await onboardingPage.setupCompleteApplicationForm()
    await onboardingPage.nextButton.click()

    // // Step 7: Student import (we'll skip this step for the test)
    await onboardingPage.manuallyCreateStudentButton.click()

    // Verify successful completion
    await onboardingPage.waitForSuccess()

    // Additional verification that we've been redirected to the dashboard
    await page.waitForURL(/\/dashboard(?:\?|$)/, { timeout: 5000 })
  })

  // Test for skipping the onboarding flow
  test('should allow skipping the onboarding flow', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page)
    await onboardingPage.navigateToSetup()

    // Step 0: Initial welcome screen
    await onboardingPage.setUpNowButton.click()

    // Step 1: School basic information
    await onboardingPage.fillSchoolInfo(
      'Test School',
      'testschool',
      '0912345678',
      'Hong Kong SAR'
    )
    await onboardingPage.nextButton.click()
    // Step 2: School details (logo, theme color, description)
    const logoPath = path.join(process.cwd(), 'tests/fixtures/logo.png')
    await onboardingPage.uploadLogo(logoPath)
    await onboardingPage.selectThemeColor()
    await onboardingPage.fillSchoolDescription(
      'This is a great school with excellent teachers'
    )
    await onboardingPage.nextButton.click()
    // Skip the rest of the onboarding process
    await onboardingPage.skipCurrentStep()

    // Verify we're redirected to the dashboard
    await page.waitForURL(/\/dashboard(?:\?|$)/, { timeout: 5000 })
    await expect(
      page.getByText("Your site is ready! Let's get started.")
    ).toBeVisible()
    // Verify there's a 'Resume Onboarding' button available
    await expect(onboardingPage.resumeOnboardingButton).toBeVisible()
    await onboardingPage.resumeOnboardingButton.click()
    await page.waitForURL('**/welcome/set-up**', { timeout: 5000 })
  })
})
