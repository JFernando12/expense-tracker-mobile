import { AppwriteException, ID } from "react-native-appwrite";
import { account } from "./client";

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
    if (error instanceof AppwriteException) {
      console.error("Response:", error.response);
      if (error.type.includes("user_session_already_exists")) {
        try {
          const user = await account.get();
          if (!user.$id) return null;
          return user.$id;
        } catch (fetchError) {
          console.error(
            "Error fetching user data after session creation:",
            fetchError
          );
          return null;
        }
      }
    } else {
      console.error("Unexpected error during login:", error);
    }
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
    console.error("Error during registration:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await account.deleteSession("current");
    // Clear local storage on logout
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
};

export const deleteAccount = async ({
  userId,
}: {
  userId: string;
}): Promise<boolean> => {
  try {
    await account.deleteSession("current");
    const endpoint = `${process.env.EXPO_PUBLIC_API}/user/${userId}`;
    await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization:
          `Bearer ${process.env.EXPO_PUBLIC_STATIC_AUTH_TOKEN}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting account:", error);
    return false;
  }
};
