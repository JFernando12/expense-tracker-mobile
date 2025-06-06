import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_KEY = 'user_login';

class LoginLocalStorage {
  async updateLoginStatus(isLoggedIn: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ isLoggedIn }));
    } catch (error) {
      console.error('Failed to update login status:', error);
    }
  }

  async getLoginStatus(): Promise<boolean> {
    try {
      const storedData = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (!storedData) return false;

      const parsedData = JSON.parse(storedData);
      return parsedData.isLoggedIn || false;
    } catch (error) {
      console.error('Failed to get login status:', error);
      return false;
    }
  }

  async clearLoginStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
    } catch (error) {
      console.error('Failed to clear login status:', error);
    }
  }
}

export const loginLocalStorage = new LoginLocalStorage();
