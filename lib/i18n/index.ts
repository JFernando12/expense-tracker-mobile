import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { languageStorage } from '../storage/languageStorage';
import en from './locales/en.json';
import es from './locales/es.json';

const i18n = new I18n({
  en,
  es,
});

// Initialize locale
const initializeLocale = async () => {
  try {
    const storedLanguage = await languageStorage.getLanguage();
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'es')) {
      i18n.locale = storedLanguage;
    } else {
      // Fall back to device locale
      const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
      i18n.locale = deviceLocale === 'es' ? 'es' : 'en';
    }
  } catch (error) {
    console.error('Error initializing locale:', error);
    i18n.locale = 'en';
  }
};

// Initialize on module load
initializeLocale();

// When a value is missing from a language it'll fall back to another language with the key present.
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
