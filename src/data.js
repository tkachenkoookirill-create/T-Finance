// T-Finance · Mock data — RU/EN bilingual.

const t = {
  ru: {
    nav: { overview: 'Главная', accounts: 'Счета и карты', transfer: 'Переводы', analytics: 'Аналитика', invest: 'Инвестиции', history: 'История', credit: 'Кредиты и вклады', profile: 'Профиль' },
    section: { money: 'ДЕНЬГИ', tools: 'ИНСТРУМЕНТЫ', account: 'ПРОФИЛЬ' },
    greeting: 'Добрый день, Алексей',
    netWorth: 'Общий капитал',
    incomeMo: 'Доход · ноябрь',
    spendMo: 'Расход · ноябрь',
    saved: 'Накоплено',
    invested: 'Инвестировано',
    cashflow: 'Денежный поток',
    cashflowSub: 'Куда уходят деньги — последние 30 дней',
    categories: 'Категории расходов',
    upcoming: 'Предстоящие платежи',
    recent: 'Недавние операции',
    portfolio: 'Портфель',
    watch: 'Наблюдение',
    goals: 'Цели',
    spendByMo: 'Расходы по месяцам',
    actions: { send: 'Перевести', request: 'Запросить', topup: 'Пополнить', pay: 'Оплатить', exchange: 'Обмен', invest: 'Инвестировать' },
    months: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
    week: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
    cur: '₽',
    inflow: 'Поступления',
    outflow: 'Списания',
    saving: 'Накопления',
    rent: 'Аренда',
    food: 'Продукты',
    transport: 'Транспорт',
    entertainment: 'Развлечения',
    services: 'Сервисы',
    healthcare: 'Здоровье',
    other: 'Прочее',
    salary: 'Зарплата',
    freelance: 'Фриланс',
    dividends: 'Дивиденды',
    seeAll: 'Все →',
    today: 'Сегодня',
    yesterday: 'Вчера',
    days7: '7 дней',
    days30: '30 дней',
    days90: '90 дней',
    year1: '1 год',
    everything: 'Всё',
    addAccount: '＋ Новый счёт',
  },
  en: {
    nav: { overview: 'Overview', accounts: 'Accounts & cards', transfer: 'Transfers', analytics: 'Analytics', invest: 'Investments', history: 'Activity', credit: 'Credit & savings', profile: 'Profile' },
    section: { money: 'MONEY', tools: 'TOOLS', account: 'ACCOUNT' },
    greeting: 'Good afternoon, Alex',
    netWorth: 'Net worth',
    incomeMo: 'Income · November',
    spendMo: 'Spend · November',
    saved: 'Saved',
    invested: 'Invested',
    cashflow: 'Cash flow',
    cashflowSub: 'Where the money goes — last 30 days',
    categories: 'Spending categories',
    upcoming: 'Upcoming payments',
    recent: 'Recent transactions',
    portfolio: 'Portfolio',
    watch: 'Watchlist',
    goals: 'Goals',
    spendByMo: 'Spending by month',
    actions: { send: 'Send', request: 'Request', topup: 'Top up', pay: 'Pay', exchange: 'Exchange', invest: 'Invest' },
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    week: ['Mo','Tu','We','Th','Fr','Sa','Su'],
    cur: '$',
    inflow: 'Inflow',
    outflow: 'Outflow',
    saving: 'Savings',
    rent: 'Rent',
    food: 'Groceries',
    transport: 'Transport',
    entertainment: 'Entertainment',
    services: 'Subscriptions',
    healthcare: 'Healthcare',
    other: 'Other',
    salary: 'Salary',
    freelance: 'Freelance',
    dividends: 'Dividends',
    seeAll: 'All →',
    today: 'Today',
    yesterday: 'Yesterday',
    days7: '7 days',
    days30: '30 days',
    days90: '90 days',
    year1: '1 year',
    everything: 'All',
    addAccount: '＋ New account',
  },
};

// Synthetic time series — 90 days of balance
function genBalance() {
  const out = [];
  let v = 480000;
  for (let i = 0; i < 90; i++) {
    v += (Math.sin(i / 7) + Math.random() - 0.4) * 4500;
    if (i % 30 === 5) v += 320000;
    if (i % 4 === 0) v -= 8000 + Math.random() * 5000;
    out.push(Math.round(v));
  }
  return out;
}

// 30-day spend heatmap (26 weeks × 7 days = ~180 days)
function genHeatmap() {
  const out = [];
  for (let i = 0; i < 26 * 7; i++) {
    const dow = i % 7;
    const base = dow === 5 || dow === 6 ? 0.6 : 0.3;
    out.push(Math.max(0, Math.min(1, base + (Math.random() - 0.5) * 0.7)));
  }
  return out;
}

// Candlestick — 60 sessions
function genCandles(start = 178.4) {
  let p = start;
  const out = [];
  for (let i = 0; i < 60; i++) {
    const o = p;
    const c = o + (Math.random() - 0.48) * 6;
    const h = Math.max(o, c) + Math.random() * 2.4;
    const l = Math.min(o, c) - Math.random() * 2.4;
    p = c;
    out.push({ o, h, l, c });
  }
  return out;
}

const data = {
  balance: genBalance(),
  heatmap: genHeatmap(),
  candles: genCandles(),
  candlesAlt: genCandles(412),
  // monthly spend (12 months)
  spend: [-92000,-104000,-88000,-115000,-99000,-122000,-86000,-94000,-118000,-101000,-87000,-94000],
  income: [180000, 175000, 210000, 180000, 195000, 240000, 180000, 180000, 230000, 200000, 195000, 210000],
  accounts: [
    { id: 'main', label: 'Главный счёт', labelEn: 'Everyday', cur: '₽', amount: 482340, type: 'debit', trend: [1,1.02,1.01,1.04,1.06,1.05,1.08], color: 'var(--brand)', last4: '4421', tier: 'Black' },
    { id: 'savings', label: 'Накопительный', labelEn: 'Savings', cur: '₽', amount: 1240000, type: 'savings', trend: [1,1.01,1.02,1.04,1.05,1.07,1.08], color: 'var(--c2)', last4: '8814', rate: '12.4%' },
    { id: 'usd', label: 'Валютный', labelEn: 'USD account', cur: '$', amount: 4280, type: 'fx', trend: [1.05,1.03,1.02,1.0,0.98,0.99,1.01], color: 'var(--c3)', last4: '7702' },
    { id: 'invest', label: 'Брокерский', labelEn: 'Brokerage', cur: '₽', amount: 612400, type: 'invest', trend: [1,0.98,1.0,1.02,1.04,1.03,1.06], color: 'var(--c5)', last4: '0341' },
  ],
  categories: [
    { key: 'rent', value: 65000, color: 'var(--c1)' },
    { key: 'food', value: 28400, color: 'var(--c2)' },
    { key: 'transport', value: 8200, color: 'var(--c3)' },
    { key: 'entertainment', value: 12400, color: 'var(--c4)' },
    { key: 'services', value: 4800, color: 'var(--c5)' },
    { key: 'healthcare', value: 6200, color: 'var(--c6)' },
    { key: 'other', value: 5800, color: 'var(--c7)' },
  ],
  transactions: [
    { id: 1, label: 'Vkusvill', labelEn: 'Vkusvill', cat: 'food', amount: -1240, day: 'today', t: '14:08', icon: '🥦' },
    { id: 2, label: 'Зарплата · Yandex', labelEn: 'Salary · Yandex', cat: 'salary', amount: 210000, day: 'today', t: '09:00', tag: 'inflow' },
    { id: 3, label: 'Yandex Plus', labelEn: 'Yandex Plus', cat: 'services', amount: -399, day: 'today', t: '08:12', recurring: true },
    { id: 4, label: 'Метро', labelEn: 'Metro', cat: 'transport', amount: -64, day: 'yesterday', t: '19:42' },
    { id: 5, label: 'Кафе Пушкин', labelEn: 'Pushkin Cafe', cat: 'food', amount: -3450, day: 'yesterday', t: '13:18' },
    { id: 6, label: 'Apple.com', labelEn: 'Apple.com', cat: 'entertainment', amount: -1290, day: 'yesterday', t: '11:04' },
    { id: 7, label: 'Перевод от Марины', labelEn: 'Transfer · Marina', cat: 'transfer', amount: 5200, day: 'yesterday', t: '10:30', tag: 'inflow' },
    { id: 8, label: 'Самокат', labelEn: 'Samokat', cat: 'food', amount: -2100, day: '21.11', t: '20:14' },
    { id: 9, label: 'Озон', labelEn: 'Ozon', cat: 'other', amount: -4250, day: '21.11', t: '18:02' },
  ],
  upcoming: [
    { label: 'Аренда квартиры', labelEn: 'Rent', amount: 65000, in: '5 дней', inEn: '5 days', icon: '🏠' },
    { label: 'Yandex Plus', labelEn: 'Yandex Plus', amount: 399, in: 'завтра', inEn: 'tomorrow', icon: '🎧' },
    { label: 'iCloud+', labelEn: 'iCloud+', amount: 299, in: '8 дней', inEn: '8 days', icon: '☁️' },
    { label: 'Спортзал', labelEn: 'Gym', amount: 4500, in: '12 дней', inEn: '12 days', icon: '🏋️' },
  ],
  watchlist: [
    { ticker: 'SBER', name: 'Сбер', nameEn: 'Sberbank', price: 286.42, ch: 1.84, spark: [280,282,281,283,285,284,286] },
    { ticker: 'YNDX', name: 'Яндекс', nameEn: 'Yandex', price: 3142.0, ch: -0.62, spark: [3180,3170,3155,3148,3140,3145,3142] },
    { ticker: 'LKOH', name: 'Лукойл', nameEn: 'Lukoil', price: 7128, ch: 0.42, spark: [7080,7095,7110,7102,7115,7120,7128] },
    { ticker: 'GAZP', name: 'Газпром', nameEn: 'Gazprom', price: 158.4, ch: -1.24, spark: [162,161,160,159,158,158.8,158.4] },
    { ticker: 'AAPL', name: 'Apple', nameEn: 'Apple', price: 189.6, ch: 0.86, spark: [185,186,187,187.5,188,189,189.6] },
  ],
  goals: [
    { label: 'Отпуск · Грузия', labelEn: 'Vacation · Georgia', target: 180000, current: 124000, due: 'мар 2026', dueEn: 'Mar 2026' },
    { label: 'Подушка', labelEn: 'Emergency fund', target: 600000, current: 420000, due: 'дек 2026', dueEn: 'Dec 2026' },
    { label: 'Macbook', labelEn: 'MacBook', target: 220000, current: 86000, due: 'июн 2026', dueEn: 'Jun 2026' },
  ],
  sankey: {
    nodes: [
      { id: 's1', label: 'Зарплата', col: 0, value: 210, color: 'var(--c1)', subLabel: '210k' },
      { id: 's2', label: 'Фриланс', col: 0, value: 48, color: 'var(--c2)', subLabel: '48k' },
      { id: 's3', label: 'Дивиденды', col: 0, value: 18, color: 'var(--c5)', subLabel: '18k' },
      { id: 'm', label: 'T-Finance', col: 1, value: 276, color: 'var(--ink)', subLabel: '276k' },
      { id: 'r', label: 'Аренда', col: 2, value: 65, color: 'var(--c1)', subLabel: '65k' },
      { id: 'f', label: 'Еда', col: 2, value: 36, color: 'var(--c2)', subLabel: '36k' },
      { id: 'l', label: 'Сервисы', col: 2, value: 12, color: 'var(--c5)', subLabel: '12k' },
      { id: 'e', label: 'Развлечения', col: 2, value: 18, color: 'var(--c4)', subLabel: '18k' },
      { id: 'i', label: 'Инвестиции', col: 2, value: 80, color: 'var(--brand)', subLabel: '80k' },
      { id: 'sv', label: 'Накопления', col: 2, value: 65, color: 'var(--c6)', subLabel: '65k' },
    ],
    links: [
      { source: 's1', target: 'm', value: 210 },
      { source: 's2', target: 'm', value: 48 },
      { source: 's3', target: 'm', value: 18 },
      { source: 'm', target: 'r', value: 65 },
      { source: 'm', target: 'f', value: 36 },
      { source: 'm', target: 'l', value: 12 },
      { source: 'm', target: 'e', value: 18 },
      { source: 'm', target: 'i', value: 80 },
      { source: 'm', target: 'sv', value: 65 },
    ],
  },
};

window.TFData = data;
window.TFI18n = t;
