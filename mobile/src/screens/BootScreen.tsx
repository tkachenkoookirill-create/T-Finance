import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { getToken } from "@/api/client";
import { tokens } from "@/theme/tokens";

const c = tokens.light;

export default function BootScreen({ navigation }: any) {
  useEffect(() => {
    getToken().then((tok) => {
      navigation.replace(tok ? "Main" : "Login");
    });
  }, [navigation]);

  return (
    <View style={s.root}>
      <ActivityIndicator color={c.brand} />
      <Text style={s.t}>T-Finance</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center", gap: 14 },
  t: { color: c.ink3, fontSize: 12, letterSpacing: 2 },
});
