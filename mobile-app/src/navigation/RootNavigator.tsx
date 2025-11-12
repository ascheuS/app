import React, { useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext'; // Importa el hook useAuth
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

  // Set up global navigation reference
  React.useEffect(() => {
    global.navigation = navigationRef.current;
    return () => {
      global.navigation = null;
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }


  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {userToken == null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            {/* Permitir acceso a ChangePassword también desde la pantalla de Login (primer inicio) */}
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
          </>
        ) : (
          // Mostrar stacks separados según el cargo del usuario
          userCargo === 1 ? (
            <>
              <Stack.Screen
                name="AdminHome"
                component={AdminHome}
                options={{
                  title: 'Admin',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#000' },
                  headerTintColor: '#fff', // flecha y texto blancos
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
                  headerTintColor: '#fff', // flecha y texto blancos
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
              <Stack.Screen name="AddUser" component={AddUserScreen} options={{
                title: 'Agregar Usuario', headerShown: true,
                headerStyle: { backgroundColor: '#000' },
                headerTintColor: '#fff', // flecha y texto blancos
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
                  headerTintColor: '#fff', // flecha y texto blancos
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
              <Stack.Screen name="AdminReportDetails" component={AdminReportDetailsScreen} options={{ title: 'Detalles de Reportes' }} />
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
                  headerTintColor: '#fff', // flecha y texto blancos
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
                  headerTintColor: '#fff', // flecha y texto blancos
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