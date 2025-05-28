import { Account, Avatars, Client, ID } from 'react-native-appwrite';

export const config = {
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  // databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
};

export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
// export const databases = new Databases(client);

export const login = async (email: string, password: string) => {
  try {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    if (!user.$id) return false;
    return true;
  } catch (error) {
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
    return false;
  }
};

export const logout = async () => {
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
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
    return null;
  }
}
