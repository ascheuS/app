import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext'; // Importa el hook useAuth
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import LoadingScreen from '../screens/LoadingScreen'; // Aunque AuthProvider ya lo usa
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { userToken, isLoading } = useAuth(); // Obtiene el estado del contexto

  // Podrías mostrar un Loading aquí también si isLoading es true,
  // aunque AuthProvider ya lo hace, doble seguridad no está mal.
  if (isLoading) {
     return <LoadingScreen />;
  }


  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken == null ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Reportes SIGRA' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;