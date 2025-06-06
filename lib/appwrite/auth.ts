import { ID } from 'react-native-appwrite';
import { account } from './client';

export const login = async (
  email: string,
  password: string
): Promise<string | null> => {
  try {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    if (!user.$id) return null;

    return user.$id;
  } catch (error) {
    console.error('Error during login:', error);
    return null;
  }
};

export const register = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}): Promise<string | null> => {
  try {
    await account.create(ID.unique(), email, password, name);
    await login(email, password);
    const user = await account.get();
    if (!user.$id) return null;

    return user.$id;
  } catch (error) {
    console.error('Error during registration:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    await account.deleteSession('current');
    // Clear local storage on logout
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};
