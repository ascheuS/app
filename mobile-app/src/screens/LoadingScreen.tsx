import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    // Un View que ocupa toda la pantalla y centra el contenido
    <View style={styles.container}>
      {/* El indicador de carga giratorio */}
      <ActivityIndicator size="large" color="#007AFF" />
      {/* Puedes cambiar 'large' por 'small' */}
      {/* Puedes cambiar el color si quieres */}
    </View>
  );
};

// Estilos para centrar el indicador
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa toda la pantalla
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center', // Centra horizontalmente
    backgroundColor: '#f5f5f5', // Un color de fondo suave (opcional)
  },
});

export default LoadingScreen;