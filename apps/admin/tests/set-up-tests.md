# Playwright E2E Test Setup & Common Patterns

This guide explains how to use the common functions and constants in this codebase for writing Playwright end-to-end (E2E) tests. It also covers how to select options from dropdowns and other frequent UI actions.

---

## 1. Common Functions in `base.page.ts`

All page objects should extend `BasePage` to access these helpers.

### **a. Navigation**

```ts
await this.goto('/some-path')
```

Navigates to a path using the root domain from config.

### **b. Selecting Options in a Dropdown**

```ts
await this.selectOption({ text: 'Option Text' })
// or
await this.selectOption({ value: 'option-value' })
```

Finds and clicks an option in a dropdown by visible text or value.

### **c. Reload and Validate**

```ts
await this.reloadAndValidate(selector, expectedValue, isInput)
```

- `selector`: Playwright Locator
- `expectedValue`: string or array of strings to check for
- `isInput`: true for input value, false for text content

### **d. Delay After Action**

```ts
await this.delayAfterAction(3000) // waits for 3 seconds and network idle
```

Use after actions that trigger navigation or async UI updates.

### **e. Reading CSV**

```ts
const data = await this.readCsv<MyType>('path/to/file.csv')
```

Reads a CSV file and returns its contents as an array of objects.

---

## 2. Constants in `const.tsx`

This file provides test data and utility values for your tests.

- `rootDomain`: The base URL for your tests.
- `testAccount`, `testTeacherUser`: Predefined user credentials.
- `locationRoomNames`, `updatedLocationRoomName`: Useful for location room tests.
- `delayTimeout`: Default delay for waiting.
- `fieldNames`, `fieldValues`, `formName`: For form-related tests.
- `PlaywrightFieldTypes`: Enum for field types.
- `playwrightDefaultFieldNames`: Array of default field names/types for dynamic test generation.

**Usage Example:**

```ts
import { locationRoomNames, testAccount } from '../const'
```

---

## 3. Selecting Options from a Dropdown

### **a. By Visible Text**

```ts
await page.getByRole('option', { name: 'Option Text' }).click()
// or using the helper:
await this.selectOption({ text: 'Option Text' })
```

### **b. By Value**

```ts
await this.selectOption({ value: 'option-value' })
```

### **c. With Custom Locators**

If your dropdown is not a native <select>, you may need to:

```ts
await page.locator('selector-for-dropdown').click()
await page.getByText('Option Text').click()
```

---

## 4. Other Useful Patterns

### **a. Asserting Text or Input Value**

The `reloadAndValidate` method in `BasePage` can check if a selector contains any value from an array:

```ts
await this.reloadAndValidate(
  page.locator('selector'),
  ['Expected Value 1', 'Expected Value 2'],
  true // for input, false for text
)
```

### **b. Using Test Data**

Use constants from `const.tsx` to keep your tests DRY and consistent.

---

## 5. How to Structure Your Page Objects

Extend `BasePage` for all your page classes:

```ts
import { BasePage } from './base.page'
class MyPage extends BasePage {
  // custom methods here
}
```

---

## 6. Example: Selecting and Validating a Dropdown Option

```ts
// Open the dropdown
await page.locator('#my-dropdown').click()
// Select by visible text
await page.getByRole('option', { name: 'My Option' }).click()
// Or use the helper if available
await this.selectOption({ text: 'My Option' })
// Validate selection
await expect(page.locator('#my-dropdown')).toHaveText('My Option')
```

---

## 7. Summary Table

| Action                        | How to Do It                                                      |
| ----------------------------- | ----------------------------------------------------------------- |
| Go to a page                  | `await this.goto('/path')`                                        |
| Select dropdown by text/value | `await this.selectOption({ text: 'Text' })` or `{ value: 'val' }` |
| Wait for UI update            | `await this.delayAfterAction()`                                   |
| Assert input/text value       | `await this.reloadAndValidate(selector, expected, isInput)`       |
| Use test data                 | `import { locationRoomNames } from '../const'`                    |

---

If you need more examples or have a specific UI pattern you want to automate, ask the team or check the existing page objects for reference.

test
