import React, { useEffect, useState } from "react";

import { View, ActivityIndicator } from "react-native";

import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useFonts } from "expo-font";

import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./src/services/firebase";

import LandingScreen from "./src/screens/LandingScreen";

import LoginScreen from "./src/screens/LoginScreen";

import RegisterScreen from "./src/screens/RegisterScreen";

import DashboardScreen from "./src/screens/DashboardScreen";

import colors from "./src/constants/colors";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [guestMode, setGuestMode] = useState(false);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",

          alignItems: "center",

          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user && !guestMode ? (
          <>
            <Stack.Screen name="Landing">
              {(props) => (
                <LandingScreen {...props} onGuest={() => setGuestMode(true)} />
              )}
            </Stack.Screen>

            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} />}
            </Stack.Screen>

            <Stack.Screen name="Register">
              {(props) => <RegisterScreen {...props} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Dashboard">
            {(props) => (
              <DashboardScreen
                {...props}
                isGuest={guestMode}
                onLogout={() => {
                  setGuestMode(false);
                }}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
