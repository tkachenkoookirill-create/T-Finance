// T-Finance · app shell + router
const { useState: useStateM, useEffect: useEffectM } = React;

const NAV = [
  { key: "dashboard", label: "Главная",   icon: "home",     sec: null },
  { key: "accounts",  label: "Счета",      icon: "wallet",   sec: "ДЕНЬГИ" },
  { key: "add",       label: "Добавить",   icon: "plus",     sec: null },
  { key: "history",   label: "История",    icon: "list",     sec: null },
  { key: "analytics", label: "Аналитика",  icon: "chart",    sec: "АНАЛИЗ" },
  { key: "goals",     label: "Цели",       icon: "target",   sec: null },
  { key: "settings",  label: "Профиль и бэкап", icon: "settings", sec: "ПРОФИЛЬ" },
];
const TABS = ["dashboard", "history", "add", "analytics", "settings"];

function useTheme() {
  const [theme, setTheme] = useStateM(
    (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme")) || "light"
  );
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("tf_theme", next); } catch (e) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#11211a" : "#1b3b2c");
    setTheme(next);
  };
  return [theme, toggle];
}

function App() {
  const [route, setRoute] = useStateM(localStorage.getItem("tf_route") || "dashboard");
  const [theme, toggleTheme] = useTheme();
  const [nonce, setNonce] = useStateM(0);
  const [toast, setToast] = useStateM(null);
  const refresh = () => setNonce((n) => n + 1);
  const go = (r) => { setRoute(r); localStorage.setItem("tf_route", r); window.scrollTo(0, 0); };

  useEffectM(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const onDone = (msg) => { refresh(); if (msg === "saved") setToast("Операция записана"); };

  function screen() {
    switch (route) {
      case "dashboard": return <Dashboard go={go} version={nonce} />;
      case "accounts":  return <Accounts refresh={refresh} />;
      case "add":       return <AddTransaction go={go} onDone={onDone} />;
      case "history":   return <History refresh={refresh} go={go} />;
      case "analytics": return <Analytics go={go} />;
      case "goals":     return <Goals refresh={refresh} />;
      case "settings":  return <Settings refresh={refresh} />;
      default:          return <Dashboard go={go} />;
    }
  }

  // group nav into sections
  const sections = [];
  NAV.forEach((item) => {
    if (item.sec || sections.length === 0) sections.push({ title: item.sec, items: [] });
    sections[sections.length - 1].items.push(item);
  });

  return (
    <div className="app" key={nonce}>
      <aside className="sidebar">
        <div style={{ padding: "2px 8px 14px" }}><Logo size={22} /></div>
        {sections.map((s, i) => (
          <React.Fragment key={i}>
            {s.title && <div className="navsec">{s.title}</div>}
            {s.items.map((item) => (
              <button key={item.key} className={"navitem" + (route === item.key ? " active" : "")} onClick={() => go(item.key)}>
                <Icon name={item.icon} size={17} className="ic" /> {item.label}
              </button>
            ))}
          </React.Fragment>
        ))}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          <button className="navitem" onClick={toggleTheme}>
            <Icon name={theme === "dark" ? "sun" : "moon"} size={17} className="ic" />
            {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          </button>
          <div style={{ padding: "10px 8px 0", fontSize: 11, color: "var(--ink-4)", lineHeight: 1.5 }}>
            Данные хранятся в этом браузере.<br />Не забывай делать бэкап.
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="mobile-topbar" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <Logo size={20} />
          <div className="row" style={{ gap: 8 }}>
            <button className="btn sm" onClick={toggleTheme} style={{ width: 34, padding: 0 }} aria-label="Тема"><Icon name={theme === "dark" ? "sun" : "moon"} size={16} /></button>
            <button className="btn sm" onClick={() => go("settings")}><Icon name="download" size={15} /> Бэкап</button>
          </div>
        </div>
        {screen()}
      </main>

      <nav className="mobile-tabbar">
        {TABS.map((k) => {
          const item = NAV.find((n) => n.key === k);
          const isAdd = k === "add";
          return (
            <button key={k} className={route === k ? "active" : ""} onClick={() => go(k)}>
              {isAdd
                ? <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--brand)", color: "var(--on-brand)", display: "grid", placeItems: "center", marginTop: -14, boxShadow: "var(--shadow-2)" }}><Icon name="plus" size={22} /></span>
                : <Icon name={item.icon} size={20} />}
              {!isAdd && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "var(--bg)", padding: "11px 18px", borderRadius: 99, fontSize: 13.5, fontWeight: 600, boxShadow: "var(--shadow-3)", zIndex: 60, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="check" size={15} /> {toast}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
