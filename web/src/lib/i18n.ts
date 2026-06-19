export type Lang = "ru" | "en";

export const I18N = {
  ru: {
    nav: {
      overview: "Главная", accounts: "Счета и карты", transfer: "Переводы",
      analytics: "Аналитика", invest: "Инвестиции", history: "История",
      credit: "Кредиты и вклады", profile: "Профиль",
    },
    section: { money: "ДЕНЬГИ", tools: "ИНСТРУМЕНТЫ", account: "ПРОФИЛЬ" },
    login: "Вход", register: "Регистрация",
    email: "Email", password: "Пароль", fullName: "Имя",
    submit: "Продолжить", noAccount: "Нет аккаунта?", haveAccount: "Уже есть аккаунт?",
    netWorth: "Общий капитал", recent: "Недавние операции",
    seeAll: "Все →", addAccount: "＋ Новый счёт",
  },
  en: {
    nav: {
      overview: "Overview", accounts: "Accounts & cards", transfer: "Transfers",
      analytics: "Analytics", invest: "Investments", history: "Activity",
      credit: "Credit & deposits", profile: "Profile",
    },
    section: { money: "MONEY", tools: "TOOLS", account: "ACCOUNT" },
    login: "Sign in", register: "Sign up",
    email: "Email", password: "Password", fullName: "Full name",
    submit: "Continue", noAccount: "No account?", haveAccount: "Have an account?",
    netWorth: "Net worth", recent: "Recent transactions",
    seeAll: "All →", addAccount: "＋ New account",
  },
} as const;
