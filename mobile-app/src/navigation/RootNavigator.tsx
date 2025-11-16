import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AddUserScreen from '../screens/AddUserScreen';
import DebugScreen from '../screens/DebugScreen';
import OfflineTestScreen from '../screens/OfflineTestScreen';
import CreateReportScreen from '../screens/CreateReportScreen';
import AdminHome from '../screens/AdminHome';
import { RootStackParamList } from './types';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import AdminReportDetailsScreen from '../screens/AdminReportDetailsScreen';

const Stack = createStackNavigator<RootStackParamList>();

declare global {
  var navigation: NavigationContainerRef<any> | null;
}

const RootNavigator = () => {
  const { userToken, isLoading, userCargo } = useAuth() as any;
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // DEBUGGING: Log cada vez que el componente se renderiza
  useEffect(() => {
    console.log('🔄 RootNavigator renderizado');
    console.log('  📊 Estado actual:', {
      userToken: userToken ? 'EXISTS' : 'NULL',
      userCargo,
      isLoading,
    });
  });

  // DEBUGGING: Log cuando cambia el userToken
  useEffect(() => {
    console.log('🔑 userToken cambió:', userToken ? 'EXISTS' : 'NULL');
  }, [userToken]);

  // DEBUGGING: Log cuando cambia el userCargo
  useEffect(() => {
    console.log('👤 userCargo cambió:', userCargo);
  }, [userCargo]);

  // Set up global navigation reference
  useEffect(() => {
    global.navigation = navigationRef.current;
    return () => {
      global.navigation = null;
    };
  }, []);

  if (isLoading) {
    console.log('⏳ Mostrando LoadingScreen');
    return <LoadingScreen />;
  }

  console.log('🎯 Decisión de navegación:', {
    userToken: userToken ? 'EXISTS' : 'NULL',
    userCargo,
    stack: userToken == null ? 'Login/ChangePassword' : userCargo === 1 ? 'Admin' : 'User',
  });

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {userToken == null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
          </>
        ) : (
          userCargo === 1 ? (
            <>
              <Stack.Screen
                name="AdminHome"
                component={AdminHome}
                options={{
                  title: 'Admin',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#000' },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
              <Stack.Screen
                name="AdminUsers"
                component={AdminUsersScreen}
                options={{
                  title: 'Gestión de Usuarios',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#000' },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
              <Stack.Screen 
                name="AddUser" 
                component={AddUserScreen} 
                options={{
                  title: 'Agregar Usuario',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#000' },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
              <Stack.Screen
                name="AdminPanel"
                component={AdminPanelScreen}
                options={{
                  title: 'Panel de Reportes',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#000' },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
              <Stack.Screen
                name="AdminReportDetails"
                component={AdminReportDetailsScreen}
                options={{
                  title: 'Detalles de Reportes',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#000' },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: 'Reportes SIGRA',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#000' },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
              <Stack.Screen
                name="CreateReport"
                component={CreateReportScreen}
                options={{
                  title: 'Crear Reporte',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#000' },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Debug" component={DebugScreen} options={{ title: 'Debug' }} />
              <Stack.Screen name="OfflineTest" component={OfflineTestScreen} options={{ title: 'Prueba Offline' }} />
            </>
          )
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;