import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const BASE = (Constants.expoConfig?.extra as any)?.apiUrl || "http://localhost:8000";

export async function getToken() {
  return AsyncStorage.getItem("tf_access");
}

export async function setTokens(access: string, refresh: string) {
  await AsyncStorage.setItem("tf_access", access);
  await AsyncStorage.setItem("tf_refresh", refresh);
}

export async function clearTokens() {
  await AsyncStorage.removeItem("tf_access");
  await AsyncStorage.removeItem("tf_refresh");
}

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) { super("api"); }
}

export async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = await getToken();
  const res = await fetch(BASE + path, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export function fmtMoney(minor: number, cur = "₽", sign = false): string {
  const major = minor / 100;
  const abs = Math.abs(major);
  const s = abs.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  const prefix = major < 0 ? "−" : sign && major > 0 ? "+" : "";
  return `${prefix}${s} ${cur}`;
}
