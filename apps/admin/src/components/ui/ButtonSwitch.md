# ButtonSwitch Component

## ✅ **Komponen Berhasil Dibuat**

Saya telah membuat komponen `ButtonSwitch` yang merupakan boolean switch (true/false) dengan desain modern dan aksesibilitas yang baik.

### 🔄 **Fitur Komponen:**

1. **Boolean Switch Design** - Toggle switch dengan dua state (true/false)
2. **Size Variations** - Tersedia 3 ukuran (sm, md, lg)
3. **Customizable Labels** - Dapat menyesuaikan label untuk true/false state
4. **Accessible** - Mendukung ARIA attributes dan keyboard navigation
5. **Disabled State** - Mendukung disabled state
6. **Smooth Animations** - Transisi yang halus dan responsif

### 🚀 **Props Interface:**

```typescript
interface ButtonSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  label?: string
  trueLabel?: string
  falseLabel?: string
}
```

### 📋 **Size Configurations:**

#### **Small (sm):**
```tsx
<ButtonSwitch
  checked={isEnabled}
  onChange={setIsEnabled}
  size="sm"
/>
// Height: 24px, Width: 44px
```

#### **Medium (md) - Default:**
```tsx
<ButtonSwitch
  checked={isEnabled}
  onChange={setIsEnabled}
  size="md"
/>
// Height: 28px, Width: 48px
```

#### **Large (lg):**
```tsx
<ButtonSwitch
  checked={isEnabled}
  onChange={setIsEnabled}
  size="lg"
/>
// Height: 32px, Width: 56px
```

### 🎯 **Cara Penggunaan:**

#### **Basic Usage:**
```tsx
import { useState } from 'react'
import ButtonSwitch from '@/components/ui/ButtonSwitch'

const SettingsForm = () => {
  const [isEnabled, setIsEnabled] = useState(false)

  return (
    <ButtonSwitch
      checked={isEnabled}
      onChange={setIsEnabled}
    />
  )
}
```

#### **With Label:**
```tsx
<ButtonSwitch
  checked={isDarkMode}
  onChange={setIsDarkMode}
  label="Dark Mode"
/>
```

#### **Custom Labels:**
```tsx
<ButtonSwitch
  checked={isNotifications}
  onChange={setIsNotifications}
  label="Notifications"
  trueLabel="Enabled"
  falseLabel="Disabled"
/>
```

#### **Disabled State:**
```tsx
<ButtonSwitch
  checked={isAutoSave}
  onChange={setIsAutoSave}
  label="Auto Save"
  disabled={true}
/>
```

### 🎨 **Styling:**

#### **Switch Container:**
```css
.relative {
  position: relative;
}

.inline-flex {
  display: inline-flex;
}

.items-center {
  align-items: center;
}

.rounded-full {
  border-radius: 9999px;
}

.border-2 {
  border-width: 2px;
}

.border-transparent {
  border-color: transparent;
}

.transition-colors {
  transition-property: color, background-color, border-color;
}

.duration-200 {
  transition-duration: 200ms;
}

.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### **Checked State:**
```css
.bg-blue-600 {
  background-color: rgb(37 99 235);
}
```

#### **Unchecked State:**
```css
.bg-gray-200 {
  background-color: rgb(229 231 235);
}
```

#### **Thumb (Toggle Circle):**
```css
.inline-block {
  display: inline-block;
}

.rounded-full {
  border-radius: 9999px;
}

.bg-white {
  background-color: white;
}

.shadow {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.transition-transform {
  transition-property: transform;
}
```

### 🔧 **Fitur yang Diimplementasikan:**

- **Boolean Switch Design** - Toggle switch dengan dua state
- **Size Variations** - 3 ukuran berbeda (sm, md, lg)
- **Customizable Labels** - Label untuk true/false state
- **Accessible** - ARIA attributes dan keyboard navigation
- **Disabled State** - Mendukung disabled state
- **Smooth Animations** - Transisi yang halus
- **Focus States** - Ring biru untuk accessibility

### ⚡ **Keuntungan:**

- **Intuitive** - Desain toggle switch yang familiar
- **Accessible** - Mendukung screen readers dan keyboard navigation
- **Flexible** - Dapat dikustomisasi label dan styling
- **Consistent** - Styling yang konsisten dengan design system
- **Responsive** - Animasi yang smooth dan responsif

### 🎯 **Use Cases:**

- **Settings Toggles** - Dark mode, notifications, auto-save
- **Feature Flags** - Enable/disable features
- **Form Controls** - Boolean form fields
- **Preferences** - User preference settings
- **Status Toggles** - Active/inactive states
- **Permission Controls** - Grant/revoke permissions

### 📝 **Contoh Implementasi:**

```tsx
// Settings Form
const SettingsForm = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isNotifications, setIsNotifications] = useState(true)
  const [isAutoSave, setIsAutoSave] = useState(false)

  return (
    <div className="space-y-4">
      <ButtonSwitch
        checked={isDarkMode}
        onChange={setIsDarkMode}
        label="Dark Mode"
        trueLabel="Dark"
        falseLabel="Light"
      />
      
      <ButtonSwitch
        checked={isNotifications}
        onChange={setIsNotifications}
        label="Push Notifications"
        trueLabel="ON"
        falseLabel="OFF"
      />
      
      <ButtonSwitch
        checked={isAutoSave}
        onChange={setIsAutoSave}
        label="Auto Save"
        trueLabel="Enabled"
        falseLabel="Disabled"
      />
    </div>
  )
}

// Feature Toggle
const FeatureToggle = () => {
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false)

  return (
    <ButtonSwitch
      checked={isFeatureEnabled}
      onChange={setIsFeatureEnabled}
      label="New Feature"
      disabled={!userHasPermission}
    />
  )
}
```

### 🎨 **Visual Design:**

Komponen ini menggunakan desain toggle switch modern dengan:
- **Switch Track** - Background abu-abu (unchecked) atau biru (checked)
- **Toggle Thumb** - Lingkaran putih yang bergerak
- **Smooth Animation** - Transisi 200ms ease-in-out
- **Focus Ring** - Ring biru untuk accessibility
- **Label Support** - Label di sebelah kiri switch
- **Status Text** - Text yang menunjukkan state saat ini

Komponen ButtonSwitch sekarang siap digunakan untuk berbagai keperluan toggle! 🎉
