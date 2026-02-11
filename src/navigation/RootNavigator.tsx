import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VisitorStack from "./VisitorStack";
import UserTabs from "./UserTabs";

// ⚠️ Pour l’instant on simule l’état connecté / non connecté
const isLoggedIn = false;

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="User" component={UserTabs} />
        ) : (
          <Stack.Screen name="Visitor" component={VisitorStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
