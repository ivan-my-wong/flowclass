import { BasePage } from "./base.page";

class CouponPage extends BasePage {
    async goToCouponPage() {
        await this.goto('/promotion')
        await this.page.waitForSelector('[data-testid="coupon-card"]', { state: 'attached' })
    }

    async deleteOldCoupon() {
        const coupons = await this.page.getByTestId('coupon-card').count()
        for (let i = 0; i < coupons; i++) {
            const coupon = this.page.getByTestId('coupon-card').first()
            const dropdown = coupon
                .getByTestId('toggle-dropdown')
                .getByRole('img')
                .first()
            if (await dropdown.isVisible()) {
                await dropdown.click()
                // delete old data test coupon
                await this.page
                    .getByRole('menuitem', { name: 'Delete Coupon' })
                    .first()
                    .click()
                await this.page.getByTestId('confirm-btn').first().click()
                await this.page.waitForLoadState('networkidle')
            }
        }
    }
}

export default CouponPage