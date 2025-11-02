import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext'; // Importa el hook useAuth
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AddUserScreen from '../screens/AddUserScreen';
import CreateReportScreen from '../screens/CreateReportScreen';
import AdminHome from '../screens/AdminHome';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { userToken, isLoading, userCargo } = useAuth() as any; // Obtiene el estado del contexto

  // Podrías mostrar un Loading aquí también si isLoading es true,
  // aunque AuthProvider ya lo hace, doble seguridad no está mal.
  if (isLoading) {
     return <LoadingScreen />;
  }


  return (
    <NavigationContainer>
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
              <Stack.Screen name="AdminHome" component={AdminHome} options={{ title: 'Admin' }} />
              <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Gestión de Usuarios' }} />
              <Stack.Screen name="AddUser" component={AddUserScreen} options={{ title: 'Agregar Usuario' }} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
            </>
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Reportes SIGRA' }} />
              <Stack.Screen name="CreateReport" component={CreateReportScreen} options={{ title: 'Crear Reporte' }} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
            </>
          )
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;