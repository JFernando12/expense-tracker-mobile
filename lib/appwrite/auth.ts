import { ID } from "react-native-appwrite";
import { User } from "../global-provider";
import { account } from "./client";
import { createUser, getUser } from "./user";

export const loginServer = async (email: string, password: string) => {
  try {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    if (!user.$id) return false;

    return true;
  } catch (error) {
    console.error("Error during login:", error);
    return false;
  }
};

export const registerServer = async ({
  email,
  password,
  name,
  appMode = "free", // Default to free mode
  subscriptionType = "monthly", // Default to monthly subscription
}: {
  email: string;
  password: string;
  name: string;
  appMode?: "free" | "premium"; // Optional, defaults to 'free'
  subscriptionType?: "monthly" | "yearly"; // Optional, defaults to 'monthly'
}): Promise<string | null> => {
  try {
    await account.create(ID.unique(), email, password, name);
    await loginServer(email, password);
    const user = await account.get();
    if (!user.$id) return null;

    await createUser({
      userId: user.$id,
      name: user.name,
      email: user.email,
      appMode,
      subscriptionType,
    });

    return user.$id;
  } catch (error) {
    console.error("Error during registration:", error);
    return null;
  }
};

export const logoutServer = async () => {
  try {
    await account.deleteSession("current");
    // Clear local storage on logout
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await account.get();
    if (!user.$id) return null;

    const userDB = await getUser(user.$id)
    if (!userDB) return null;

    return {
      id: user.$id,
      name: userDB.name,
      email: userDB.email,
      appMode: userDB.appMode,
      subscriptionType: userDB.subscriptionType,
      subscriptionExpiration: userDB.subscriptionExpiration,
    }
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};
