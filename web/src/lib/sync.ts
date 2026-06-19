"use client";

const SUPABASE_URL  = "https://vimxepexjtstnfugbptx.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXhlcGV4anRzdG5mdWdicHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODE5MjMsImV4cCI6MjA5NzQ1NzkyM30.EzCoKGn55Dxi44dGra5uBcn8o3zzDl14u0rXK0m-j9U";

const FIXED_SYNC_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const SYNC_ID_KEY = "tf_sync_id";
const SYNC_TS_KEY = "tf_sync_ts";
const DATA_KEYS = [
  "tf_user", "tf_accounts", "tf_transactions", "tf_cards",
  "tf_credits", "tf_goals", "tf_watchlist", "tf_portfolio", "tf_seeded_v1",
];

function getSyncId(): string {
  return FIXED_SYNC_ID;
}

function collect(): Record<string, string> {
  const d: Record<string, string> = {};
  DATA_KEYS.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v != null) d[k] = v;
  });
  return d;
}

async function supabase(path: string, opts?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...opts,
    headers: {
      "apikey": SUPABASE_ANON,
      "Authorization": `Bearer ${SUPABASE_ANON}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
      ...(opts?.headers || {}),
    },
  });
}

async function push() {
  const ts = new Date().toISOString();
  try {
    await supabase("/sync_data", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({ sync_id: getSyncId(), data: collect(), updated_at: ts }),
    });
    localStorage.setItem(SYNC_TS_KEY, ts);
  } catch (e) {
    console.warn("[TFSync] push error", e);
  }
}

async function pull(): Promise<boolean> {
  try {
    const res = await supabase(`/sync_data?sync_id=eq.${getSyncId()}&select=data,updated_at`);
    if (!res.ok) return false;
    const rows = await res.json() as { data: Record<string, string>; updated_at: string }[];
    if (!rows.length) return false;

    const remoteTs = rows[0].updated_at;
    const localTs  = localStorage.getItem(SYNC_TS_KEY) || "0";
    if (localTs >= remoteTs) return false;

    Object.entries(rows[0].data).forEach(([k, v]) => localStorage.setItem(k, v));
    localStorage.setItem(SYNC_TS_KEY, remoteTs);
    return true;
  } catch (e) {
    console.warn("[TFSync] pull error", e);
    return false;
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(push, 3000);
}

export function initSync() {
  if (typeof window === "undefined") return;

  // intercept localStorage writes
  const origSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key: string, value: string) {
    origSet.call(this, key, value);
    if (this === localStorage && DATA_KEYS.includes(key)) {
      schedulePush();
    }
  };

  // pull on first load
  if (!sessionStorage.getItem("tf_synced")) {
    sessionStorage.setItem("tf_synced", "1");
    pull().then((updated) => { if (updated) window.location.reload(); });
  }

  // pull when tab gets focus
  window.addEventListener("focus", () => pull());
}
