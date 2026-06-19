import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, fmtMoney } from "@/api/client";
import { tokens, radii } from "@/theme/tokens";

const c = tokens.light;

type Account = { id: number; label: string; currency: string; balance_minor: number; last4: string };
type Tx = { id: number; merchant: string; amount_minor: number; occurred_at: string };

export default function HomeScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [net, setNet] = useState<number>(0);

  useEffect(() => {
    api<Account[]>("/accounts").then(setAccounts).catch(() => {});
    api<Tx[]>("/transactions?limit=6").then(setTxs).catch(() => {});
    api<{ net_worth_minor: number }>("/analytics/net-worth")
      .then((n) => setNet(n.net_worth_minor)).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={s.header}>
          <Text style={s.eyebrow}>Главная</Text>
          <Text style={s.greet}>Добрый день,{"\n"}Алексей</Text>
        </View>

        <View style={[s.card, { backgroundColor: c.ink }]}>
          <Text style={[s.eyebrow, { color: "rgba(255,255,255,0.5)" }]}>ОБЩИЙ КАПИТАЛ</Text>
          <Text style={[s.bignum, { color: "#fff" }]}>{fmtMoney(net)}</Text>
        </View>

        <Text style={s.section}>СЧЕТА</Text>
        {accounts.map((a) => (
          <View key={a.id} style={s.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={s.label}>{a.label}</Text>
                <Text style={s.mono}>··{a.last4}</Text>
              </View>
              <Text style={s.bal}>{fmtMoney(a.balance_minor, a.currency === "USD" ? "$" : "₽")}</Text>
            </View>
          </View>
        ))}

        <Text style={s.section}>НЕДАВНИЕ ОПЕРАЦИИ</Text>
        <View style={s.card}>
          {txs.map((t, i) => (
            <View key={t.id} style={[s.row, i < txs.length - 1 && { borderBottomWidth: 1, borderColor: c.line2 }]}>
              <Text style={s.merchant}>{t.merchant || "—"}</Text>
              <Text style={[s.amt, t.amount_minor > 0 && { color: c.pos }]}>
                {fmtMoney(t.amount_minor, "₽", true)}
              </Text>
            </View>
          ))}
          {txs.length === 0 && <Text style={{ color: c.ink3, fontSize: 12 }}>Пусто</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bgSunken },
  header: { paddingHorizontal: 4 },
  eyebrow: { fontSize: 10, color: c.ink3, letterSpacing: 1.4, fontWeight: "700" },
  greet: { fontSize: 32, color: c.ink, marginTop: 4, letterSpacing: -0.6 },
  card: { backgroundColor: c.bgElev, borderRadius: radii.md, padding: 16, borderWidth: 1, borderColor: c.line, gap: 8 },
  bignum: { fontSize: 38, fontWeight: "700", letterSpacing: -1, marginTop: 4 },
  section: { fontSize: 11, color: c.ink2, letterSpacing: 1.2, fontWeight: "700", marginTop: 4, marginLeft: 4 },
  label: { color: c.ink, fontSize: 14, fontWeight: "600" },
  mono: { color: c.ink3, fontSize: 11, marginTop: 2 },
  bal: { color: c.ink, fontSize: 18, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
  merchant: { color: c.ink, fontSize: 14 },
  amt: { color: c.ink, fontSize: 14, fontWeight: "600" },
});
