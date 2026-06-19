"use client";
import { useEffect, useRef, useState } from "react";
import { api, exportData, importData, updateUser, clearTokens, User } from "@/lib/api";
import { Card, Button } from "@/components/ui";

export default function ProfilePage() {
  const [me, setMe] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<User>("/auth/me").then((u) => { setMe(u); setName(u.full_name || ""); });
  }, []);

  function saveName() {
    updateUser({ full_name: name });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  function downloadBackup() {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url; a.download = `t-finance-backup-${stamp}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!confirm("Заменить все данные содержимым файла?")) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { importData(String(reader.result)); }
      catch { alert("Не удалось прочитать файл"); }
    };
    reader.readAsText(f);
  }

  return (
    <div className="flex flex-col gap-5 max-w-[640px]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Профиль</div>
        <h1 className="serif text-[40px] leading-none tracking-tight text-ink mt-1">{name || "Без имени"}</h1>
      </div>

      <Card>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.1em] text-ink-3 font-semibold">Имя</span>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="h-10 px-3 rounded-sm bg-bg border border-line text-ink text-[14px] focus:outline-none focus:border-brand" />
        </label>
        <div className="flex items-center gap-3">
          <Button variant="brand" onClick={saveName}>Сохранить</Button>
          {saved && <span className="text-pos text-[12px]">✓ сохранено</span>}
        </div>
      </Card>

      <Card>
        <div className="text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold">Резервная копия</div>
        <p className="text-ink-3 text-[12px] -mt-1">
          Все данные хранятся в этом браузере. Скачай бэкап перед сменой устройства или очисткой кэша.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={downloadBackup}>↓ Скачать бэкап</Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>↑ Загрузить из файла</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onUpload} />
        </div>
      </Card>

      <Card>
        <div className="text-[13px] uppercase tracking-[0.04em] text-ink-2 font-semibold">Опасная зона</div>
        <p className="text-ink-3 text-[12px] -mt-1">Удалит все счета, операции и настройки с этого устройства.</p>
        <Button variant="ghost" onClick={clearTokens} className="w-fit text-neg border-neg/30">
          Стереть все данные
        </Button>
      </Card>

      <div className="text-ink-3 text-[11px] mono">
        ID: {me?.id ?? "—"} · v0.1 · client-only
      </div>
    </div>
  );
}
