// src/context/AuthContext.tsx
// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import LoadingScreen from '../screens/LoadingScreen';
// BORRAMOS 'api' de aquí, ya no lo necesitamos para esto
import { sincronizarCatalogos } from '../services/syncService';
import { initDatabase } from '../db/database';
import { jwtDecode } from 'jwt-decode'; // <-- 1. IMPORTA LA LIBRERÍA

// Define el tipo de dato de tu payload
interface JwtPayload {
  rut: number;
  cargo: number;
  exp: number;
  // ... otros campos si los tienes
}

type AuthContextType = {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  userCargo?: number | null;
  userRUT?: number | null; // <-- Lo mantenemos
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [userCargo, setUserCargo] = useState<number | null>(null);
  const [userRUT, setUserRUT] = useState<number | null>(null); // <-- Lo mantenemos

useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      
      // --- INICIA EL TRY EXTERNO ---
      // (Para 'initDatabase' y 'SecureStore.getItemAsync')
      try { 
        await initDatabase();
        token = await SecureStore.getItemAsync('userToken');
        
        if (token) {
          if (token === 'primer_inicio') {
            // Lógica de primer inicio (está bien)
            await SecureStore.deleteItemAsync('userToken');
            token = null;
          } else {
            // --- INICIA EL TRY INTERNO ---
            // (Para 'jwtDecode' y 'sincronizarCatalogos')
            try { 
              const decodedToken = jwtDecode<JwtPayload>(token);
              setUserCargo(decodedToken.cargo);
              setUserRUT(decodedToken.rut);
              
              // Sincroniza catálogos (esto puede fallar offline)
              await sincronizarCatalogos(); 
              console.log("✅ Catálogos sincronizados al iniciar app.");

            } catch (err:any) { // --- CATCH INTERNO ---
              // Esta es la lógica que te di. ¡Está correcta!
              // Solo desloguea si el error es 401
              if (err.response && err.response.status === 401) { 
                console.warn('Token inválido/expirado (401), deslogueando:', err);
                await SecureStore.deleteItemAsync('userToken');
                token = null;
              } else {
                // Si es un 404 o error de red, solo avisa pero NO desloguea
                console.error('Error en bootstrapAsync (pero no es 401):', err.message);
              }
            } // <-- CIERRA EL CATCH INTERNO
          } // <-- CIERRA EL 'else'
        } // <-- CIERRA EL 'if (token)'

      } catch (e) { // <-- CATCH EXTERNO
        console.error('Error restaurando token o iniciando DB:', e);
      }
      // --- FIN DEL TRY/CATCH EXTERNO ---

      setUserToken(token);
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  const authContextValue = React.useMemo(
    () => ({
      userToken,
      isLoading,
      userCargo,
      userRUT, // <-- Lo pasas al contexto
      signIn: async (token: string) => {
        try {
          await SecureStore.setItemAsync('userToken', token);
          setUserToken(token);
          
          try {
            if (token === 'primer_inicio') {
              // ... (tu lógica está bien)
              await SecureStore.deleteItemAsync('userToken');
              setUserToken(null);
              setUserCargo(null);
              setUserRUT(null);
              return;
            }

            // --- 3. DECODIFICA EL NUEVO TOKEN ---
            const decodedToken = jwtDecode<JwtPayload>(token);
            setUserCargo(decodedToken.cargo);
            setUserRUT(decodedToken.rut);
            
            // Sincroniza catálogos
            await sincronizarCatalogos();
            console.log("✅ Catálogos sincronizados post-login.");

          } catch (err) {
            console.warn('No se pudo decodificar token o sincronizar:', err);
          }
        } catch (e) {
          console.error('❌ Error guardando token:', e);
        }
      },
      signOut: async () => {
        try {
          await SecureStore.deleteItemAsync('userToken');
          setUserToken(null);
          setUserCargo(null);
          setUserRUT(null); // <-- Limpia el RUT
        } catch (e) {
          console.error('Error borrando token', e);
        }
      },
    }),
    [userToken, isLoading, userCargo, userRUT] // <-- Añade userRUT
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ... (tu hook useAuth se mantiene igual)

// Hook personalizado para usar el contexto fácilmente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};