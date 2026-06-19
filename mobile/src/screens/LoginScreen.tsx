import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, setTokens, ApiError } from "@/api/client";
import { tokens, radii } from "@/theme/tokens";

const c = tokens.light;

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("demo@tfinance.local");
  const [password, setPassword] = useState("demo1234");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const data = await api<{ access_token: string; refresh_token: string }>("/auth/login", {
        method: "POST", body: { email, password },
      });
      await setTokens(data.access_token, data.refresh_token);
      navigation.replace("Main");
    } catch (e) {
      Alert.alert("Ошибка", e instanceof ApiError && e.status === 401 ? "Неверные данные" : "Сервер недоступен");
    } finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.brand}>
        <View style={s.logoMark} />
        <Text style={s.brandWord}>T—Finance</Text>
      </View>
      <Text style={s.h1}>Вход</Text>
      <Text style={s.hint}>Демо: demo@tfinance.local / demo1234</Text>

      <View style={s.field}>
        <Text style={s.label}>EMAIL</Text>
        <TextInput style={s.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      </View>
      <View style={s.field}>
        <Text style={s.label}>ПАРОЛЬ</Text>
        <TextInput style={s.input} secureTextEntry value={password} onChangeText={setPassword} />
      </View>

      <Pressable onPress={submit} disabled={busy} style={s.btn}>
        <Text style={s.btnText}>{busy ? "..." : "Продолжить"}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg, padding: 24, gap: 14 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  logoMark: { width: 24, height: 24, backgroundColor: c.brand, borderRadius: 6 },
  brandWord: { fontSize: 18, color: c.ink, fontWeight: "600" },
  h1: { fontSize: 36, color: c.ink, marginTop: 16, letterSpacing: -1 },
  hint: { color: c.ink3, fontSize: 12 },
  field: { gap: 6, marginTop: 8 },
  label: { fontSize: 10, color: c.ink3, letterSpacing: 1.2, fontWeight: "700" },
  input: { height: 48, borderColor: c.line, borderWidth: 1, borderRadius: radii.sm, paddingHorizontal: 14, backgroundColor: c.bgElev, color: c.ink },
  btn: { height: 48, backgroundColor: c.brand, borderRadius: radii.sm, alignItems: "center", justifyContent: "center", marginTop: 12 },
  btnText: { color: "#fff", fontWeight: "700" },
});
