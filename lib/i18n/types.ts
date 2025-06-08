export interface Translations {
  home: {
    greeting: string;
    guestUser: string;
    totalBalance: string;
    income: string;
    expenses: string;
    recent: string;
  };
  profile: {
    localUser: string;
    editProfile: string;
    login: string;
    syncData: string;
    syncing: string;
    privacyPolicy: string;
    deleteData: string;
    logout: string;
    logoutFailed: string;
    logoutSuccess: string;
    syncConfirmTitle: string;
    syncConfirmMessage: string;
    syncDataLoginPrompt: string;
    autoSyncEnabled: string;
    autoSyncDisabled: string;
  };
  statistics: {
    title: string;
    sevenDays: string;
    thirtyDays: string;
    total: string;
    expensesByCategory: string;
  };
  wallet: {
    title: string;
    totalBalance: string;
    allAccounts: string;
    create: string;
  };
  transactions: {
    expense: string;
    income: string;
  };
  fields: {
    selectDate: string;
    selectOption: string;
  };
  offline: {
    message: string;
  };
  categories: {
    loadingData: string;
    noDataAvailable: string;
    food: string;
    transport: string;
    entertainment: string;
    shopping: string;
    health: string;
    utilities: string;
    travel: string;
    education: string;
    other_expense: string;
    salary: string;
    bonus: string;
    investment: string;
    gift: string;
    other_income: string;
  };
  periods: {
    last7Days: string;
    last30Days: string;
    totalAccumulated: string;
    thisPeriod: string;
  };
  forms: {
    name: string;
    description: string;
    amount: string;
    initialBalance: string;
    enterName: string;
    enterEmail: string;
    enterPassword: string;
    forgotPassword: string;
    saving: string;
    deleting: string;
    editProfile: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    signUp: string;
    signIn: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    add: string;
    success: string;
    failed: string;
    continue: string;
    language: string;
  };
}

export type TranslationKey =
  // Home translations
  | 'home.greeting'
  | 'home.guestUser'
  | 'home.totalBalance'
  | 'home.income'
  | 'home.expenses'
  | 'home.recent' // Profile translations
  | 'profile.localUser'
  | 'profile.editProfile'
  | 'profile.login'
  | 'profile.syncData'
  | 'profile.syncing'
  | 'profile.privacyPolicy'
  | 'profile.deleteData'
  | 'profile.logout'
  | 'profile.logoutFailed'
  | 'profile.logoutSuccess'
  | 'profile.syncConfirmTitle'
  | 'profile.syncConfirmMessage'
  | 'profile.syncDataLoginPrompt'
  | 'profile.autoSyncEnabled'
  | 'profile.autoSyncDisabled'
  // Statistics translations
  | 'statistics.title'
  | 'statistics.sevenDays'
  | 'statistics.thirtyDays'
  | 'statistics.total'
  | 'statistics.expensesByCategory'
  // Wallet translations
  | 'wallet.title'
  | 'wallet.totalBalance'
  | 'wallet.allAccounts'
  | 'wallet.create'
  // Transaction translations
  | 'transactions.expense'
  | 'transactions.income'
  // Field translations
  | 'fields.selectDate'
  | 'fields.selectOption'
  // Offline translations
  | 'offline.message' // Category translations
  | 'categories.loadingData'
  | 'categories.noDataAvailable'
  | 'categories.food'
  | 'categories.transport'
  | 'categories.entertainment'
  | 'categories.shopping'
  | 'categories.shoping'
  | 'categories.health'
  | 'categories.utilities'
  | 'categories.travel'
  | 'categories.education'
  | 'categories.other_expense'
  | 'categories.salary'
  | 'categories.bonus'
  | 'categories.investment'
  | 'categories.gift'
  | 'categories.other_income' // Period translations
  | 'periods.last7Days'
  | 'periods.last30Days'
  | 'periods.totalAccumulated'
  | 'periods.thisPeriod'
  // Form translations
  | 'forms.name'
  | 'forms.description'
  | 'forms.amount'
  | 'forms.initialBalance'
  | 'forms.enterName'
  | 'forms.enterEmail'
  | 'forms.enterPassword'
  | 'forms.forgotPassword'
  | 'forms.saving'
  | 'forms.deleting'
  | 'forms.editProfile'
  | 'forms.createAccount'
  | 'forms.alreadyHaveAccount'
  | 'forms.dontHaveAccount'
  | 'forms.signUp'
  | 'forms.signIn'
  // Common translations
  | 'common.loading'
  | 'common.error'
  | 'common.retry'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.add'
  | 'common.success'
  | 'common.failed'
  | 'common.continue'
  | 'common.language';
