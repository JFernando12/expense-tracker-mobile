import { Redirect, Slot } from 'expo-router';
import React from 'react';

const RootLayout = () => {
  const isLogin = true;

  if (!isLogin) {
    return <Redirect href="/login" />
  }

  return (
    <Slot />
  )
}

export default RootLayout