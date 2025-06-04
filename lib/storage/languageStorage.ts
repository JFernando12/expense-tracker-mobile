import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_STORAGE_KEY = '@expense_tracker_language';

export const languageStorage = {
  async getLanguage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting language from storage:', error);
      return null;
    }
  },

  async setLanguage(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Error setting language in storage:', error);
    }
  },

  async removeLanguage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing language from storage:', error);
    }
  },
};
