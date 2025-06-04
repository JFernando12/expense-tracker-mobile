import { useTranslation } from '@/lib/i18n/useTranslation';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { locale, changeLanguage, getAvailableLanguages, isLoading, t } = useTranslation();
  const languages = getAvailableLanguages();

  if (isLoading) {
    return (
      <View className={`${className} items-center py-4`}>
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  }

  return (
    <View className={`${className}`}>
      <Text className="text-white text-lg font-semibold mb-3">
        {t('common.language')} / Language
      </Text>
      <View className="flex-row space-x-3">
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => changeLanguage(language.code as 'en' | 'es')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 flex-row items-center justify-center space-x-2 ${
              locale === language.code
                ? 'bg-accent-200 border-accent-200'
                : 'bg-transparent border-primary-300'
            }`}
          >
            <Text className="text-2xl">{language.flag}</Text>
            <Text
              className={`text-center font-medium ${
                locale === language.code ? 'text-primary-100' : 'text-white'
              }`}
            >
              {language.nativeName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
