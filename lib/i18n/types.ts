export interface Translations {
  home: {
    greeting: string;
    guestUser: string;
    totalBalance: string;
    income: string;
    expenses: string;
    recent: string;
  };  profile: {
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
  };  statistics: {
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
  | 'home.recent'
  // Profile translations
  | 'profile.localUser'
  | 'profile.editProfile'
  | 'profile.login'
  | 'profile.syncData'
  | 'profile.syncing'
  | 'profile.privacyPolicy'
  | 'profile.deleteData'
  | 'profile.logout'
  | 'profile.logoutFailed'
  | 'profile.logoutSuccess'  | 'profile.syncConfirmTitle'
  | 'profile.syncConfirmMessage'
  | 'profile.syncDataLoginPrompt'
  // Statistics translations
  | 'statistics.title'
  | 'statistics.sevenDays'  | 'statistics.thirtyDays'
  | 'statistics.total'
  | 'statistics.expensesByCategory'
  // Wallet translations
  | 'wallet.title'
  | 'wallet.totalBalance'
  | 'wallet.allAccounts'
  | 'wallet.create'
  // Common translations
  | 'common.loading'
  | 'common.error'
  | 'common.retry'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.add'  | 'common.success'
  | 'common.failed'
  | 'common.continue'
  | 'common.language';
