import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeVisitorScreen from "../screens/visitor/HomeVisitorScreen";

export type VisitorStackParamList = {
  HomeVisitor: undefined;
};

const Stack = createNativeStackNavigator<VisitorStackParamList>();

export default function VisitorStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeVisitor"
        component={HomeVisitorScreen}
        options={{ title: "Badier Beer" }}
      />
    </Stack.Navigator>
  );
}
