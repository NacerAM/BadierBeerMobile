import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeUserScreen from "../screens/user/HomeUserScreen";

export type UserTabsParamList = {
  HomeUser: undefined;
};

const Tab = createBottomTabNavigator<UserTabsParamList>();

export default function UserTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeUser"
        component={HomeUserScreen}
        options={{ title: "Accueil" }}
      />
    </Tab.Navigator>
  );
}
