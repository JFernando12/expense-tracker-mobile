# Internationalization (i18n) Implementation

This project uses `expo-localization` and `i18n-js` for internationalization support.

## Features

- 🌍 Automatic device language detection
- 💾 Persistent language preference storage
- 💰 Locale-aware currency formatting
- 🏃‍♂️ React hooks for easy integration
- 🔄 Real-time language switching

## Supported Languages

- **English (en)**: Default language with USD currency
- **Spanish (es)**: Spanish language with EUR currency

## Usage

### Using the Translation Hook

```tsx
import { useTranslation } from '@/lib/i18n/useTranslation';

const MyComponent = () => {
  const { t, locale, changeLanguage, formatCurrency } = useTranslation();

  return (
    <View>
      <Text>{t('home.greeting')}</Text>
      <Text>{formatCurrency(100.50)}</Text>
      <Button onPress={() => changeLanguage('es')} title="Switch to Spanish" />
    </View>
  );
};
```

### Language Selector Component

```tsx
import LanguageSelector from '@/components/LanguageSelector';

const SettingsScreen = () => (
  <View>
    <LanguageSelector className="mb-4" />
  </View>
);
```

## File Structure

```
lib/i18n/
├── index.ts              # Main i18n configuration
├── useTranslation.ts     # React hook for translations
├── types.ts              # TypeScript types
├── exports.ts            # Re-exports for easy importing
└── locales/
    ├── en.json           # English translations
    └── es.json           # Spanish translations
```

## Adding New Translations

1. Add the translation key to `types.ts`:
```typescript
export type TranslationKey = 
  | 'existing.keys'
  | 'new.section.key';
```

2. Add translations to both locale files:
```json
// en.json
{
  "new": {
    "section": {
      "key": "English text"
    }
  }
}

// es.json
{
  "new": {
    "section": {
      "key": "Texto en español"
    }
  }
}
```

3. Use in components:
```tsx
const text = t('new.section.key');
```

## Currency Formatting

The `formatCurrency` function automatically formats numbers based on the current locale:

- **English**: USD format ($1,234.56)
- **Spanish**: EUR format (1.234,56 €)

```tsx
const { formatCurrency } = useTranslation();
const price = formatCurrency(1234.56);
```

## Storage

User language preferences are automatically persisted using AsyncStorage and restored when the app loads.

## Components Using i18n

- `app/(root)/(tabs)/index.tsx` - Home screen
- `app/(root)/(tabs)/profile.tsx` - Profile screen  
- `components/LanguageSelector.tsx` - Language selector

## Future Enhancements

- [ ] Add more languages (French, German, etc.)
- [ ] Implement RTL support for Arabic languages
- [ ] Add date/time formatting based on locale
- [ ] Support for pluralization rules
- [ ] Dynamic locale loading for better performance
