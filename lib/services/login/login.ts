import { loginLocalStorage } from "@/lib/storage/loginLocalStorage";

export const getLoginStatus = async (): Promise<boolean> => {
  const loginStatus = await loginLocalStorage.getLoginStatus();
  return loginStatus;
}

export const updateLoginStatus = async (isLoggedIn: boolean): Promise<void> => {
  await loginLocalStorage.updateLoginStatus(isLoggedIn);
}