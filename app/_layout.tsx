import GlobalProvider from '@/lib/global-provider';
import { Stack } from 'expo-router';
import './global.css';

export default function RootLayout() {
  return (
    <GlobalProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </GlobalProvider>
  );
}
