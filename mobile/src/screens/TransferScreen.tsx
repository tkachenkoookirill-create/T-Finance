import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, fmtMoney } from "@/api/client";
import { tokens, radii } from "@/theme/tokens";

const c = tokens.light;

type Account = { id: number; label: string; currency: string; balance_minor: number };

export default function TransferScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    api<Account[]>("/accounts").then((a) => {
      setAccounts(a);
      if (a[0]) setFrom(a[0].id);
      if (a[1]) setTo(a[1].id);
    });
  }, []);

  async function pay() {
    if (!from || !to || !amount) return;
    try {
      await api("/transfers", {
        method: "POST",
        body: { from_account_id: from, to_account_id: to, amount_minor: Math.round(parseFloat(amount) * 100) },
      });
      setStatus("Готово");
      setAmount("");
    } catch (e: any) {
      setStatus(e?.body?.detail || "Ошибка");
    }
  }

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={s.eyebrow}>Деньги</Text>
        <Text style={s.h1}>Перевод</Text>

        <Text style={s.label}>ОТКУДА</Text>
        <View style={s.card}>
          {accounts.map((a) => (
            <Pressable key={a.id} onPress={() => setFrom(a.id)}
              style={[s.row, from === a.id && { backgroundColor: c.brandTint, borderRadius: radii.sm }]}>
              <Text style={s.acc}>{a.label}</Text>
              <Text style={s.bal}>{fmtMoney(a.balance_minor)}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.label}>КУДА</Text>
        <View style={s.card}>
          {accounts.map((a) => (
            <Pressable key={a.id} onPress={() => setTo(a.id)}
              style={[s.row, to === a.id && { backgroundColor: c.brandTint, borderRadius: radii.sm }]}>
              <Text style={s.acc}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.label}>СУММА, ₽</Text>
        <View style={s.card}>
          <Text style={s.amountInput}>{amount || "0"}</Text>
        </View>
        <View style={s.keypad}>
          {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map((k) => (
            <Pressable key={k} style={s.key} onPress={() => {
              if (k === "⌫") setAmount((a) => a.slice(0, -1));
              else setAmount((a) => (a + k).replace(/^0+(\d)/, "$1"));
            }}>
              <Text style={s.keyText}>{k}</Text>
            </Pressable>
          ))}
        </View>

        {status && <Text style={{ color: status === "Готово" ? c.pos : c.neg }}>{status}</Text>}
        <Pressable style={s.cta} onPress={pay}><Text style={s.ctaText}>Перевести</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bgSunken },
  eyebrow: { fontSize: 10, color: c.ink3, letterSpacing: 1.4, fontWeight: "700" },
  h1: { fontSize: 32, color: c.ink, letterSpacing: -0.6 },
  label: { fontSize: 10, color: c.ink3, letterSpacing: 1.4, fontWeight: "700", marginTop: 4 },
  card: { backgroundColor: c.bgElev, borderRadius: radii.md, padding: 12, borderWidth: 1, borderColor: c.line, gap: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 6 },
  acc: { color: c.ink, fontSize: 14 },
  bal: { color: c.ink2, fontSize: 13 },
  amountInput: { fontSize: 40, color: c.ink, fontWeight: "700", letterSpacing: -1, padding: 8 },
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  key: { width: "31%", height: 56, backgroundColor: c.bgElev, borderRadius: radii.sm, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.line },
  keyText: { fontSize: 22, color: c.ink },
  cta: { height: 52, backgroundColor: c.brand, borderRadius: radii.sm, alignItems: "center", justifyContent: "center", marginTop: 8 },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
