// T-Finance · Main entry — design canvas assembly + tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "default",
  "lang": "ru",
  "accent": "forest"
}/*EDITMODE-END*/;

// Apply accent palette as CSS vars on body
const ACCENT_PALETTES = {
  forest: { brand: 'oklch(36% 0.08 155)', brand2: 'oklch(46% 0.10 155)', tint: 'oklch(94% 0.025 155)', ink: 'oklch(20% 0.05 155)', darkBrand: 'oklch(68% 0.12 155)' },
  ink:    { brand: 'oklch(22% 0.018 250)', brand2: 'oklch(30% 0.02 250)', tint: 'oklch(94% 0.005 250)', ink: 'oklch(20% 0.012 250)', darkBrand: 'oklch(78% 0.014 250)' },
  cobalt: { brand: 'oklch(38% 0.12 250)', brand2: 'oklch(48% 0.14 250)', tint: 'oklch(94% 0.03 250)', ink: 'oklch(22% 0.06 250)', darkBrand: 'oklch(72% 0.13 250)' },
  rust:   { brand: 'oklch(46% 0.13 40)', brand2: 'oklch(54% 0.14 40)', tint: 'oklch(94% 0.04 40)', ink: 'oklch(26% 0.08 40)', darkBrand: 'oklch(72% 0.13 40)' },
};

function applyAccent(name, isDark) {
  const p = ACCENT_PALETTES[name] || ACCENT_PALETTES.forest;
  const root = document.documentElement;
  root.style.setProperty('--brand', isDark ? p.darkBrand : p.brand);
  root.style.setProperty('--brand-2', p.brand2);
  root.style.setProperty('--brand-tint', isDark ? 'color-mix(in oklch, ' + p.brand + ' 22%, transparent)' : p.tint);
  root.style.setProperty('--brand-ink', p.ink);
}

function App() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => {
    applyAccent(t.accent, t.theme === 'dark');
  }, [t.accent, t.theme]);

  // Wrap every artboard child so theme+density+lang propagate
  const Wrap = ({ children, density }) => (
    <div data-theme={t.theme}
         data-density={density || t.density}
         lang={t.lang}
         style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
  const L = t.lang;
  const i = window.TFI18n[L];

  return (
    <>
      <DesignCanvas defaultZoom={0.5}>
        <DCSection id="brand" title={L === 'ru' ? 'Бренд и система' : 'Brand & System'}
          subtitle={L === 'ru' ? 'Цвет, типографика, базовые компоненты' : 'Color, type, primitives'}>
          <DCArtboard id="brand-1" label={L === 'ru' ? 'Дизайн-система' : 'Design System'} width={1280} height={1180}>
            <Wrap><BrandShowcase /></Wrap>
          </DCArtboard>
        </DCSection>

        <DCSection id="onboarding" title={L === 'ru' ? 'Онбординг' : 'Onboarding'}
          subtitle={L === 'ru' ? '3 экрана первого запуска' : '3 first-run screens'}>
          <DCArtboard id="ob-1" label={L === 'ru' ? '1 · Приветствие' : '1 · Welcome'} width={402} height={874}>
            <Wrap><MobileFrame label="Onboarding · Welcome"><OnboardingA lang={L} /></MobileFrame></Wrap>
          </DCArtboard>
          <DCArtboard id="ob-2" label={L === 'ru' ? '2 · Подключение счетов' : '2 · Connect'} width={402} height={874}>
            <Wrap><MobileFrame label="Onboarding · Connect"><OnboardingB lang={L} /></MobileFrame></Wrap>
          </DCArtboard>
          <DCArtboard id="ob-3" label={L === 'ru' ? '3 · Цели' : '3 · Goals'} width={402} height={874}>
            <Wrap><MobileFrame label="Onboarding · Goals"><OnboardingC lang={L} /></MobileFrame></Wrap>
          </DCArtboard>
        </DCSection>

        <DCSection id="dashboards" title={L === 'ru' ? 'Главный экран · 4 варианта' : 'Dashboard · 4 variants'}
          subtitle={L === 'ru' ? 'Разные характеры одной системы' : 'Same system, different temperaments'}>
          <DCArtboard id="dash-v1" label={L === 'ru' ? 'V1 · Классика' : 'V1 · Classic'} width={1280} height={840}>
            <Wrap><DashboardV1 lang={L} /></Wrap>
          </DCArtboard>
          <DCArtboard id="dash-v2" label={L === 'ru' ? 'V2 · Терминал' : 'V2 · Terminal'} width={1280} height={840}>
            <Wrap density="compact"><DashboardV2 lang={L} /></Wrap>
          </DCArtboard>
          <DCArtboard id="dash-v3" label={L === 'ru' ? 'V3 · Редакторский' : 'V3 · Editorial'} width={1280} height={840}>
            <Wrap density="comfortable"><DashboardV3 lang={L} /></Wrap>
          </DCArtboard>
          <DCArtboard id="dash-v4" label={L === 'ru' ? 'V4 · Карточный' : 'V4 · Story'} width={1280} height={840}>
            <Wrap><DashboardV4 lang={L} /></Wrap>
          </DCArtboard>
        </DCSection>

        <DCSection id="web-screens" title={L === 'ru' ? 'Веб-экраны' : 'Web screens'}
          subtitle={L === 'ru' ? 'Счета, переводы, аналитика, инвестиции, история, кредиты, профиль' : 'Accounts, transfers, analytics, investments, history, credit, profile'}>
          <DCArtboard id="accounts" label={L === 'ru' ? 'Счета и карты' : 'Accounts & cards'} width={1280} height={840}>
            <Wrap><ScreenAccounts lang={L} /></Wrap>
          </DCArtboard>
          <DCArtboard id="transfer" label={L === 'ru' ? 'Перевод' : 'Transfer'} width={1280} height={840}>
            <Wrap><ScreenTransfer lang={L} /></Wrap>
          </DCArtboard>
          <DCArtboard id="analytics" label={L === 'ru' ? 'Аналитика расходов' : 'Analytics'} width={1280} height={920}>
            <Wrap><ScreenAnalytics lang={L} /></Wrap>
          </DCArtboard>
          <DCArtboard id="invest" label={L === 'ru' ? 'Инвестиции' : 'Investments'} width={1280} height={840}>
            <Wrap><ScreenInvest lang={L} /></Wrap>
          </DCArtboard>
          <DCArtboard id="asset" label={L === 'ru' ? 'Актив · SBER' : 'Asset · SBER'} width={1280} height={960}>
            <Wrap><ScreenAsset lang={L} /></Wrap>
          </DCArtboard>
          <DCArtboard id="history" label={L === 'ru' ? 'История' : 'History'} width={1280} height={920}>
            <Wrap><ScreenHistory lang={L} /></Wrap>
          </DCArtboard>
          <DCArtboard id="credit" label={L === 'ru' ? 'Кредиты и вклады' : 'Credit & deposits'} width={1280} height={840}>
            <Wrap><ScreenCredit lang={L} /></Wrap>
          </DCArtboard>
          <DCArtboard id="profile" label={L === 'ru' ? 'Профиль' : 'Profile'} width={1280} height={840}>
            <Wrap><ScreenProfile lang={L} /></Wrap>
          </DCArtboard>
        </DCSection>

        <DCSection id="mobile" title={L === 'ru' ? 'Мобильное приложение' : 'Mobile app'}
          subtitle={L === 'ru' ? 'iOS-экраны (та же система, перенесённая на узкий формат)' : 'iOS screens (same system, narrow format)'}>
          <DCArtboard id="m-home" label={L === 'ru' ? 'Главная' : 'Home'} width={402} height={874}>
            <Wrap><MobileFrame label="Mobile · Home"><MobileHome lang={L} /></MobileFrame></Wrap>
          </DCArtboard>
          <DCArtboard id="m-transfer" label={L === 'ru' ? 'Перевод' : 'Transfer'} width={402} height={874}>
            <Wrap><MobileFrame label="Mobile · Transfer"><MobileTransfer lang={L} /></MobileFrame></Wrap>
          </DCArtboard>
          <DCArtboard id="m-asset" label={L === 'ru' ? 'Актив' : 'Asset'} width={402} height={874}>
            <Wrap><MobileFrame label="Mobile · Asset"><MobileAsset lang={L} /></MobileFrame></Wrap>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks · T-Finance">
        <TweakSection title={L === 'ru' ? 'Внешний вид' : 'Appearance'}>
          <TweakRadio
            label={L === 'ru' ? 'Тема' : 'Theme'}
            value={t.theme}
            onChange={(v) => setT('theme', v)}
            options={[
              { value: 'light', label: L === 'ru' ? 'Светлая' : 'Light' },
              { value: 'dark', label: L === 'ru' ? 'Тёмная' : 'Dark' },
            ]} />
          <TweakRadio
            label={L === 'ru' ? 'Плотность' : 'Density'}
            value={t.density}
            onChange={(v) => setT('density', v)}
            options={[
              { value: 'compact', label: L === 'ru' ? 'Компакт.' : 'Compact' },
              { value: 'default', label: L === 'ru' ? 'Обычная' : 'Default' },
              { value: 'comfortable', label: L === 'ru' ? 'Свободно' : 'Comfy' },
            ]} />
          <TweakSelect
            label={L === 'ru' ? 'Акцент бренда' : 'Brand accent'}
            value={t.accent}
            onChange={(v) => setT('accent', v)}
            options={[
              { value: 'forest', label: L === 'ru' ? 'Лесной зелёный (T-Finance)' : 'Forest green (T-Finance)' },
              { value: 'ink', label: L === 'ru' ? 'Чернильный · моно' : 'Ink · mono' },
              { value: 'cobalt', label: L === 'ru' ? 'Кобальт · фин-тех' : 'Cobalt · fintech' },
              { value: 'rust', label: L === 'ru' ? 'Ржавчина · премиум' : 'Rust · premium' },
            ]} />
        </TweakSection>

        <TweakSection title={L === 'ru' ? 'Локаль' : 'Locale'}>
          <TweakRadio
            label={L === 'ru' ? 'Язык' : 'Language'}
            value={t.lang}
            onChange={(v) => setT('lang', v)}
            options={[
              { value: 'ru', label: 'Русский' },
              { value: 'en', label: 'English' },
            ]} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
