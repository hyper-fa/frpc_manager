export interface ElectronAPI {
  auth: {
    login: (credentials: { username: string; password: string }) => Promise<boolean>;
  };
  config: {
    read: (filePath: string) => Promise<any>;
    save: (data: { filePath: string; config: any }) => Promise<boolean>;
    selectFile: () => Promise<string | null>;
    loadFile: (filePath: string) => Promise<{ name: string; filePath: string; config: any }>;
    saveConfigs: (configs: any[]) => Promise<boolean>;
    loadConfigs: () => Promise<any[]>;
    getFrpcPath: () => Promise<string | null>;
    setFrpcPath: (path: string | null) => Promise<boolean>;
    selectFrpcPath: () => Promise<string | null>;
    readTomlFile: (filePath: string) => Promise<string>;
    saveTomlFile: (filePath: string, content: string) => Promise<boolean>;
  };
  frpc: {
    start: (configPath: string) => Promise<boolean>;
    stop: () => Promise<boolean>;
    stopConfig: (configPath: string) => Promise<boolean>;
    onLog: (callback: (log: string) => void) => void;
  };
  shell: {
    openExternal: (url: string) => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
