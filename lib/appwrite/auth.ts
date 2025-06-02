import { ID } from 'react-native-appwrite';
import { account, avatar } from './client';

export const login = async (email: string, password: string) => {
  try {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    if (!user.$id) return false;
    return true;
  } catch (error) {
    console.error('Error during login:', error);
    return false;
  }
};

export const register = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    await account.create(ID.unique(), email, password, name);
    await login(email, password);
    const user = await account.get();
    if (!user.$id) return false;
    return true;
  } catch (error) {
    console.error('Error during registration:', error);
    return false;
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

export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    if (!user.$id) return null;

    const userAvatar = avatar.getInitials(user.name);
    return {
      ...user,
      avatar: userAvatar.toString(),
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const updateUser = async ({ name }: { name: string }) => {
  try {
    const user = await account.updateName(name);
    if (!user.$id) return null;
    const userAvatar = avatar.getInitials(user.name);
    return {
      ...user,
      avatar: userAvatar.toString(),
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};
