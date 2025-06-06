import { loginService } from "./loginService";

export const getLoginStatus = async (): Promise<boolean> => {
  const loginStatus = await loginService.getLoginStatus();
  return loginStatus;
}

export const updateLoginStatus = async (isLoggedIn: boolean): Promise<void> => {
  await loginService.updateLoginStatus(isLoggedIn);
}