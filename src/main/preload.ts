import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  auth: {
    login: (credentials: any) => ipcRenderer.invoke('auth:login', credentials)
  },
  config: {
    read: (filePath: string) => ipcRenderer.invoke('config:read', filePath),
    save: (data: any) => ipcRenderer.invoke('config:save', data),
    selectFile: () => ipcRenderer.invoke('config:selectFile'),
    loadFile: (filePath: string) => ipcRenderer.invoke('config:loadFile', filePath),
    saveConfigs: (configs: any[]) => ipcRenderer.invoke('config:saveConfigs', configs),
    loadConfigs: () => ipcRenderer.invoke('config:loadConfigs'),
    getFrpcPath: () => ipcRenderer.invoke('config:getFrpcPath'),
    setFrpcPath: (path: string | null) => ipcRenderer.invoke('config:setFrpcPath', path),
    selectFrpcPath: () => ipcRenderer.invoke('config:selectFrpcPath'),
    readTomlFile: (filePath: string) => ipcRenderer.invoke('config:readTomlFile', filePath),
    saveTomlFile: (filePath: string, content: string) => ipcRenderer.invoke('config:saveTomlFile', filePath, content)
  },
  frpc: {
    start: (configPath: string) => ipcRenderer.invoke('frpc:start', configPath),
    stop: () => ipcRenderer.invoke('frpc:stop'),
    stopConfig: (configPath: string) => ipcRenderer.invoke('frpc:stopConfig', configPath),
    onLog: (callback: (log: string) => void) => {
      ipcRenderer.on('frpc:log', (_, log) => callback(log));
    }
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url)
  }
});