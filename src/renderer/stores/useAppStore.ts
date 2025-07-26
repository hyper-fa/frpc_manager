import { create } from 'zustand';
import { Language, getSystemLanguage } from '../i18n';

interface FrpcConfig {
  serverAddr: string;
  serverPort: number;
  auth: {
    method: string;
    token: string;
  };
  webServer: {
    addr: string;
    port: number;
    user: string;
    password: string;
  };
  visitors: Array<{
    name: string;
    type: string;
    serverName: string;
    bindPort: number;
    secretKey: string;
  }>;
}

interface ConfigRecord {
  id: string;
  name: string;
  filePath: string;
  config: FrpcConfig;
  isRunning: boolean;
}

interface AppState {
  isAuthenticated: boolean;
  configs: ConfigRecord[];
  currentConfig: FrpcConfig | null;
  logs: string[];
  frpcPath: string | null;
  language: Language;

  // Actions
  login: (credentials: any) => Promise<boolean>;
  initConfigs: () => Promise<void>;
  saveConfigs: () => Promise<void>;
  addConfig: (name: string, config: FrpcConfig) => Promise<void>;
  updateConfig: (id: string, config: FrpcConfig) => Promise<void>;
  deleteConfig: (id: string) => Promise<void>;
  setCurrentConfig: (config: FrpcConfig) => void;
  setConfigRunning: (id: string, isRunning: boolean) => Promise<void>;
  addLog: (log: string) => void;
  clearLogs: () => void;
  setFrpcPath: (path: string | null) => Promise<void>;
  selectFrpcPath: () => Promise<void>;
  setLanguage: (language: Language) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  configs: [],
  currentConfig: null,
  logs: [],
  frpcPath: null,
  language: (() => {
    // Try to get saved language preference, fallback to system language
    // 尝试获取保存的语言偏好，回退到系统语言
    const savedLanguage = localStorage.getItem('frpc-manager-language') as Language;
    return savedLanguage || getSystemLanguage();
  })(),

  // 初始化时加载配置
  initConfigs: async () => {
    try {
      console.log('开始加载配置...');
      const savedConfigs = await window.electronAPI.config.loadConfigs();
      console.log('加载的配置:', savedConfigs);

      // 验证配置数据并确保每个配置都有完整的结构
      const validConfigs = Array.isArray(savedConfigs) ? savedConfigs.map(config => ({
        ...config,
        config: {
          ...config.config,
          visitors: config.config?.visitors || []
        }
      })) : [];
      set({ configs: validConfigs });

      // 加载保存的 frpc 路径
      const savedFrpcPath = await window.electronAPI.config.getFrpcPath();
      console.log('加载的 frpc 路径:', savedFrpcPath);
      set({ frpcPath: savedFrpcPath });

      console.log('配置加载完成');
    } catch (error) {
      console.error('Failed to load configs:', error);
      // 确保即使加载失败也有默认状态
      set({ configs: [], frpcPath: null });
    }
  },

  // 保存配置到文件
  saveConfigs: async () => {
    try {
      const { configs } = get();
      await window.electronAPI.config.saveConfigs(configs);
    } catch (error) {
      console.error('Failed to save configs:', error);
    }
  },

  login: async (credentials) => {
    const success = await window.electronAPI.auth.login(credentials);
    set({ isAuthenticated: success });
    return success;
  },

  addConfig: async (name, config) => {
    try {
      // 验证输入参数
      if (!name || !name.trim()) {
        throw new Error('配置名称不能为空');
      }

      if (!config) {
        throw new Error('配置内容不能为空');
      }

      // 检查是否已存在同名配置
      const { configs } = get();
      const existingConfig = configs.find(c => c.name === name.trim());
      if (existingConfig) {
        throw new Error(`配置名称 "${name}" 已存在，请使用其他名称`);
      }

      const newConfig: ConfigRecord = {
        id: Date.now().toString(),
        name: name.trim(),
        filePath: `${name.trim()}.toml`,
        config,
        isRunning: false
      };

      // 先更新状态
      set(state => ({ configs: [...state.configs, newConfig] }));

      // 然后保存到文件
      await get().saveConfigs();

      console.log('配置添加成功:', newConfig.name);
    } catch (error) {
      console.error('添加配置失败:', error);
      // 如果保存失败，回滚状态更改
      const { configs } = get();
      const filteredConfigs = configs.filter(c => c.name !== name.trim());
      set({ configs: filteredConfigs });
      throw error;
    }
  },

  updateConfig: async (id, updatedData) => {
    set(state => ({
      configs: state.configs.map(c =>
        c.id === id ? {
          ...c,
          name: (updatedData as any).name || c.name,
          config: (updatedData as any).config || updatedData
        } : c
      )
    }));
    await get().saveConfigs();
  },

  deleteConfig: async (id) => {
    set(state => ({
      configs: state.configs.filter(c => c.id !== id)
    }));
    await get().saveConfigs();
  },

  setConfigRunning: async (id, isRunning) => {
    set(state => ({
      configs: state.configs.map(c =>
        c.id === id ? { ...c, isRunning } : c
      )
    }));
    await get().saveConfigs();
  },

  setCurrentConfig: (config) => {
    set({ currentConfig: config });
  },

  addLog: (log) => {
    set(state => ({ logs: [...state.logs, log] }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  setFrpcPath: async (path) => {
    set({ frpcPath: path });
    try {
      await window.electronAPI.config.setFrpcPath(path);
    } catch (error) {
      console.error('Failed to save frpc path:', error);
    }
  },

  selectFrpcPath: async () => {
    try {
      const path = await window.electronAPI.config.selectFrpcPath();
      if (path) {
        await get().setFrpcPath(path);
      }
    } catch (error) {
      console.error('Failed to select frpc path:', error);
      throw error;
    }
  },

  // Language management / 语言管理
  setLanguage: (language: Language) => {
    set({ language });
    // Save language preference to localStorage / 保存语言偏好到本地存储
    localStorage.setItem('frpc-manager-language', language);
  }
}));