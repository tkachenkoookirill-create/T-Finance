// T-Finance · Brand showcase artboard (design system overview)

function BrandShowcase() {
  return (
    <div className="tf-app" style={{ overflowY: 'auto' }} data-screen-label="Design System">
      <div style={{ padding: '40px 56px', display: 'flex', flexDirection: 'column', gap: 36 }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'end' }}>
          <div>
            <div className="tf-h-eyebrow">{'DESIGN SYSTEM · 2025'}</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 76, lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: '8px 0 0' }}>T—Finance</h1>
            <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 14, maxWidth: 480, lineHeight: 1.5 }}>
              Серьёзный банковский интерфейс с минималистичным характером и data-heavy душой.
              Спроектирован для массового розничного пользователя — спокойный, точный, легко читается.
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <TFLogo size={120} mark />
          </div>
        </div>

        <div className="tf-divider" />

        {/* Color */}
        <div>
          <div className="tf-h-eyebrow" style={{ marginBottom: 16 }}>ЦВЕТ</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            {[
              { name: 'Brand · forest', v: 'var(--brand)', code: 'oklch(36% 0.08 155)' },
              { name: 'Ink', v: 'var(--ink)', code: 'oklch(20% 0.012 250)' },
              { name: 'BG · warm white', v: 'var(--bg)', code: 'oklch(98.5% 0.004 80)', border: true },
              { name: 'Positive', v: 'var(--pos)', code: 'oklch(58% 0.15 150)' },
              { name: 'Negative', v: 'var(--neg)', code: 'oklch(60% 0.18 25)' },
            ].map((c) => (
              <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ height: 92, borderRadius: 12, background: c.v, border: c.border ? '1px solid var(--line)' : 'none' }} />
                <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                <div className="tf-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{c.code}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginTop: 14 }}>
            {['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)','var(--c7)'].map((v, idx) => (
              <div key={v} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ height: 44, borderRadius: 8, background: v }} />
                <div className="tf-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>category-{idx + 1}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="tf-divider" />

        {/* Type */}
        <div>
          <div className="tf-h-eyebrow" style={{ marginBottom: 16 }}>ТИПОГРАФИКА</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 36 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 56, lineHeight: 1, letterSpacing: '-0.03em' }}>Деньги без шума.</div>
                <div className="tf-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>Instrument Serif · 56 / 400 · −3% letter-spacing</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, lineHeight: 1.2, fontWeight: 600, letterSpacing: '-0.02em' }}>Куда уходят деньги — последние 30 дней</div>
                <div className="tf-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>Plus Jakarta Sans · 28 / 600</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>Стандартный body. Используется для описаний, подсказок и UI-копи. Шрифт легко читается на маленьких размерах.</div>
                <div className="tf-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>Plus Jakarta Sans · 14 / 400</div>
              </div>
              <div>
                <div className="tf-mono" style={{ fontSize: 22, fontWeight: 600 }}>2 349 740 ₽</div>
                <div className="tf-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>JetBrains Mono · 22 / 600 · tabular nums</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="tf-h-eyebrow">ШРИФТЫ</div>
              <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26 }}>Instrument Serif</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Заголовки, hero-числа</div>
              </div>
              <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 600 }}>Plus Jakarta Sans</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>UI, текст, кнопки</div>
              </div>
              <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}>JetBrains Mono</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Цифры, тикеры, данные</div>
              </div>
            </div>
          </div>
        </div>

        <div className="tf-divider" />

        {/* Components */}
        <div>
          <div className="tf-h-eyebrow" style={{ marginBottom: 16 }}>КОМПОНЕНТЫ</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {/* Pills */}
            <div className="tf-card">
              <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>PILLS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span className="tf-pill">Default</span>
                <span className="tf-pill tf-pill--brand">Brand</span>
                <span className="tf-pill tf-pill--pos">+4.2%</span>
                <span className="tf-pill tf-pill--neg">−1.8%</span>
                <span className="tf-pill tf-pill--ink">Active</span>
              </div>
            </div>

            <div className="tf-card">
              <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>BUTTONS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <button className="tf-btn">Primary</button>
                <button className="tf-btn tf-btn--brand">Brand</button>
                <button className="tf-btn tf-btn--ghost">Ghost</button>
              </div>
            </div>

            <div className="tf-card">
              <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>SPARKLINE</div>
              <Sparkline values={[100,98,105,102,110,108,118,115,124,128,135,140]} width={220} height={50} color="var(--brand)" />
            </div>

            <div className="tf-card">
              <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>DONUT</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Donut size={120} thick={16}
                  data={[
                    { value: 65, color: 'var(--c1)' },
                    { value: 28, color: 'var(--c2)' },
                    { value: 14, color: 'var(--c4)' },
                    { value: 10, color: 'var(--c5)' },
                  ]} />
              </div>
            </div>

            <div className="tf-card">
              <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>BARS</div>
              <BarChart data={[12,18,9,22,14,11,16]} labels={['Пн','Вт','Ср','Чт','Пт','Сб','Вс']} width={260} height={120} color="var(--brand)" />
            </div>

            <div className="tf-card">
              <div className="tf-h-eyebrow" style={{ fontSize: 10 }}>HEATMAP</div>
              <Heatmap weeks={14} days={7}
                values={Array.from({ length: 98 }, () => Math.random())}
                labels={['Пн','Ср','Пт']} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BrandShowcase });
