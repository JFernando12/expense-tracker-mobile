import { getLocales } from 'expo-localization';
import { useEffect, useState } from 'react';
import { languageStorage } from '../storage/languageStorage';
import i18n from './index';
import { TranslationKey } from './types';

export const useTranslation = () => {
  const [locale, setLocale] = useState(i18n.locale);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const storedLanguage = await languageStorage.getLanguage();
        if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'es')) {
          i18n.locale = storedLanguage;
          setLocale(storedLanguage);
        } else {
          // Set device locale as default
          const deviceLocale = getLocales()[0]?.languageCode || 'en';
          const defaultLocale = deviceLocale === 'es' ? 'es' : 'en';
          i18n.locale = defaultLocale;
          setLocale(defaultLocale);
          await languageStorage.setLanguage(defaultLocale);
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        i18n.locale = 'en';
        setLocale('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const t = (key: TranslationKey, options?: any): string => {
    return i18n.t(key, options);
  };

  const changeLanguage = async (languageCode: 'en' | 'es') => {
    try {
      i18n.locale = languageCode;
      setLocale(languageCode);
      await languageStorage.setLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getAvailableLanguages = () => [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  ];

  return {
    t,
    locale,
    changeLanguage,
    getAvailableLanguages,
    isLoading,
  };
};
