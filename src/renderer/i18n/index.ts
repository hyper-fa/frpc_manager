/**
 * Internationalization (i18n) configuration
 * 国际化配置
 */

export type Language = 'en' | 'zh';

export interface I18nTexts {
  // App title and navigation
  appTitle: string;
  configManagement: string;
  newConfig: string;
  editConfig: string;
  runtimeLogs: string;

  // Login page
  loginTitle: string;
  username: string;
  password: string;
  login: string;
  language: string;
  selectLanguage: string;

  // Configuration list
  configurationList: string;
  stopAll: string;
  server: string;
  localPorts: string;
  running: string;
  noPortsConfigured: string;
  edit: string;
  start: string;
  stop: string;
  logs: string;
  delete: string;
  tomlAdvancedEditor: string;

  // Configuration form
  newConfiguration: string;
  editConfiguration: string;
  basicConfiguration: string;
  serverAddress: string;
  serverPort: string;
  authToken: string;
  visitorConfiguration: string;
  addVisitor: string;
  visitor: string;
  deleteAction: string;
  configurationName: string;
  enterConfigurationName: string;
  saveConfiguration: string;
  updateConfiguration: string;
  loadFromFile: string;

  // TOML Editor
  tomlConfigurationEditor: string;
  tomlEditorDescription: string;
  tomlConfigurationContent: string;
  hasUnsavedChanges: string;
  reset: string;
  reload: string;
  testConfiguration: string;
  testing: string;

  // Log viewer
  clearLogs: string;

  // Error boundary
  applicationError: string;
  errorDescription: string;
  errorInfo: string;
  stackTrace: string;
  refreshPage: string;
  retry: string;

  // Messages
  configSaveSuccess: string;
  configSaveFailed: string;
  configUpdateSuccess: string;
  configUpdateFailed: string;
  configDeleteSuccess: string;
  configDeleteFailed: string;
  startSuccess: string;
  startFailed: string;
  stopSuccess: string;
  stopFailed: string;
  stopAllSuccess: string;
  testConfigFirst: string;
  enterConfigName: string;
  configValidationPassed: string;
  configSavedSuccessfully: string;
  saveFailed: string;
  resetConfirm: string;
}

export const translations: Record<Language, I18nTexts> = {
  en: {
    // App title and navigation
    appTitle: 'FRP Client Manager',
    configManagement: 'Config Management',
    newConfig: 'New Config',
    editConfig: 'Edit Config',
    runtimeLogs: 'Runtime Logs',

    // Login page
    loginTitle: 'FRP Client Manager',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    language: 'Language',
    selectLanguage: 'Select Language',

    // Configuration list
    configurationList: 'Configuration List',
    stopAll: 'Stop All',
    server: 'Server',
    localPorts: 'Local Ports',
    running: 'Running',
    noPortsConfigured: 'No ports configured',
    edit: 'Edit',
    start: 'Start',
    stop: 'Stop',
    logs: 'Logs',
    delete: 'Delete',
    tomlAdvancedEditor: 'TOML Advanced Editor',

    // Configuration form
    newConfiguration: 'New Configuration',
    editConfiguration: 'Edit Configuration',
    basicConfiguration: 'Basic Configuration',
    serverAddress: 'Server Address',
    serverPort: 'Server Port',
    authToken: 'Auth Token',
    visitorConfiguration: 'Visitor Configuration',
    addVisitor: 'Add Visitor',
    visitor: 'Visitor',
    deleteAction: 'Delete',
    configurationName: 'Configuration Name',
    enterConfigurationName: 'Enter configuration name',
    saveConfiguration: 'Save Configuration',
    updateConfiguration: 'Update Configuration',
    loadFromFile: 'Load from File',

    // TOML Editor
    tomlConfigurationEditor: 'TOML Configuration Editor',
    tomlEditorDescription: 'Direct TOML file editing with syntax validation and testing',
    tomlConfigurationContent: 'TOML Configuration Content',
    hasUnsavedChanges: 'Has unsaved changes',
    reset: 'Reset',
    reload: 'Reload',
    testConfiguration: 'Test Configuration',
    testing: 'Testing...',

    // Log viewer
    clearLogs: 'Clear Logs',

    // Error boundary
    applicationError: 'Application Error',
    errorDescription: 'The application encountered an unexpected error. Please try refreshing the page or restarting the application.',
    errorInfo: 'Error Info:',
    stackTrace: 'Stack Trace:',
    refreshPage: 'Refresh Page',
    retry: 'Retry',

    // Messages
    configSaveSuccess: 'Configuration saved successfully',
    configSaveFailed: 'Failed to save configuration',
    configUpdateSuccess: 'Configuration updated successfully',
    configUpdateFailed: 'Failed to update configuration',
    configDeleteSuccess: 'Configuration deleted successfully',
    configDeleteFailed: 'Failed to delete configuration',
    startSuccess: 'Started successfully!',
    startFailed: 'Failed to start',
    stopSuccess: 'Stopped successfully!',
    stopFailed: 'Failed to stop',
    stopAllSuccess: 'All configurations stopped successfully!',
    testConfigFirst: 'Please test the configuration first and ensure it passes validation',
    enterConfigName: 'Please enter configuration name',
    configValidationPassed: 'Configuration validation passed! Safe to save.',
    configSavedSuccessfully: 'Configuration saved successfully! TOML file and application configuration have been updated.',
    saveFailed: 'Save failed',
    resetConfirm: 'Are you sure you want to reset all changes?'
  },
  zh: {
    // App title and navigation
    appTitle: 'FRP Client Manager',
    configManagement: '配置管理',
    newConfig: '新建配置',
    editConfig: '编辑配置',
    runtimeLogs: '运行日志',

    // Login page
    loginTitle: 'FRP Client Manager',
    username: '用户名',
    password: '密码',
    login: '登录',
    language: '语言',
    selectLanguage: '选择语言',

    // Configuration list
    configurationList: '配置列表',
    stopAll: '停止所有',
    server: '服务器',
    localPorts: '本地端口',
    running: '运行中',
    noPortsConfigured: '无端口配置',
    edit: '编辑',
    start: '启动',
    stop: '停止',
    logs: '日志',
    delete: '删除',
    tomlAdvancedEditor: 'TOML 高级编辑模式',

    // Configuration form
    newConfiguration: '新建配置',
    editConfiguration: '编辑配置',
    basicConfiguration: '基础配置',
    serverAddress: '服务器地址',
    serverPort: '服务器端口',
    authToken: '认证令牌',
    visitorConfiguration: '访问者配置',
    addVisitor: '添加访问者',
    visitor: '访问者',
    deleteAction: '删除',
    configurationName: '配置名称',
    enterConfigurationName: '输入配置名称',
    saveConfiguration: '保存配置',
    updateConfiguration: '更新配置',
    loadFromFile: '从文件加载',

    // TOML Editor
    tomlConfigurationEditor: 'TOML 配置编辑器',
    tomlEditorDescription: '直接编辑 TOML 配置文件，支持语法验证和测试',
    tomlConfigurationContent: 'TOML 配置内容',
    hasUnsavedChanges: '有未保存的更改',
    reset: '重置',
    reload: '重新加载',
    testConfiguration: '测试配置',
    testing: '测试中...',

    // Log viewer
    clearLogs: '清空日志',

    // Error boundary
    applicationError: '应用出现错误',
    errorDescription: '应用遇到了一个意外错误。请尝试刷新页面或重启应用。',
    errorInfo: '错误信息:',
    stackTrace: '堆栈跟踪:',
    refreshPage: '刷新页面',
    retry: '重试',

    // Messages
    configSaveSuccess: '配置保存成功',
    configSaveFailed: '配置保存失败',
    configUpdateSuccess: '配置更新成功',
    configUpdateFailed: '配置更新失败',
    configDeleteSuccess: '配置删除成功',
    configDeleteFailed: '配置删除失败',
    startSuccess: '启动成功！',
    startFailed: '启动失败',
    stopSuccess: '停止成功！',
    stopFailed: '停止失败',
    stopAllSuccess: '所有配置停止成功！',
    testConfigFirst: '请先测试配置并确保通过验证',
    enterConfigName: '请输入配置名称',
    configValidationPassed: '配置验证通过！可以安全保存。',
    configSavedSuccessfully: '配置保存成功！TOML 文件和应用配置都已更新。',
    saveFailed: '保存失败',
    resetConfirm: '确定要重置所有更改吗？'
  }
};

// Get system language / 获取系统语言
export const getSystemLanguage = (): Language => {
  const systemLang = navigator.language.toLowerCase();
  if (systemLang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
};

// Language context and hook
export const useI18n = (language: Language) => {
  const t = translations[language];
  return { t, language };
};
