import { test as baseTest } from '@playwright/test'
import PaymentMethodPage from './pages/payment-method.page'

const test = baseTest.extend<{ paymentMethodPage: PaymentMethodPage }>({
  paymentMethodPage: async ({ page }, use) => {
    await use(new PaymentMethodPage(page))
  },
})

test.use({
  storageState: './tests/auth.json',
})

test.describe('Payment Method', () => {
  test('Should successfully delete an existing payment method', async ({
    paymentMethodPage,
  }) => {
    await paymentMethodPage.deletePaymentMethod()
  })

  // test('Should be able to check payment method', async ({ paymentMethodPage }) => {
  //   await paymentMethodPage.checkPaymentMethod()
  // })

  test('Should successfully create a new payment method with valid details', async ({
    paymentMethodPage,
  }) => {
    await paymentMethodPage.createPaymentMethod()
  })

  test('Should successfully update an existing payment method with new details', async ({
    paymentMethodPage,
  }) => {
    await paymentMethodPage.editPaymentMethod()
  })

  test('Should toggle payment method status between enabled and disabled states', async ({
    paymentMethodPage,
  }) => {
    await paymentMethodPage.enableAndDisablePaymentMethod()
  })
})
