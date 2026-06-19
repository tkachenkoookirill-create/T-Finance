import React from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import BootScreen from "@/screens/BootScreen";
import LoginScreen from "@/screens/LoginScreen";
import HomeScreen from "@/screens/HomeScreen";
import TransferScreen from "@/screens/TransferScreen";
import { tokens } from "@/theme/tokens";

const c = tokens.light;
const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: focused ? c.brand : c.ink4, marginBottom: 2 }} />
      <Text style={{ fontSize: 10, color: focused ? c.ink : c.ink3 }}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: { backgroundColor: c.bgElev, borderTopColor: c.line, height: 64, paddingTop: 8 },
    }}>
      <Tabs.Screen name="Главная"  component={HomeScreen}     options={{ tabBarIcon: ({ focused }) => <TabIcon label="Главная" focused={focused} /> }} />
      <Tabs.Screen name="Перевод"  component={TransferScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Перевод" focused={focused} /> }} />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Boot"  component={BootScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main"  component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
