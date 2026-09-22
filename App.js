import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/users';
import { StoreProvider } from './src/data/StoreContext';
import { ToastProvider } from './src/layouts/components/Feedback';
import RoleRouter from './src/navigation/RoleRouter';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StoreProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <RoleRouter />
          </ToastProvider>
        </StoreProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
