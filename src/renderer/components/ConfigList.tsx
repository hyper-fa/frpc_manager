import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useI18n } from '../i18n';

export const ConfigList: React.FC = () => {
  const { configs, deleteConfig, setConfigRunning, frpcPath, selectFrpcPath, language } = useAppStore();
  const { t } = useI18n(language);

  // 确保 configs 是数组
  const safeConfigs = Array.isArray(configs) ? configs : [];

  const handleStart = async (config: any) => {
    try {
      // 检查是否已选择 frpc.exe
      if (!frpcPath) {
        alert('请先选择 frpc.exe 文件！');
        return;
      }

      const filePath = `frp/${config.filePath}`;
      await window.electronAPI.config.save({
        filePath: filePath,
        config: config.config
      });
      await window.electronAPI.frpc.start(filePath);
      await setConfigRunning(config.id, true);
      alert('启动成功！');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('启动失败: ' + errorMessage);
    }
  };

  const handleStop = async (config?: any) => {
    try {
      if (config) {
        // 停止特定配置
        await window.electronAPI.frpc.stopConfig(config.filePath);
        await setConfigRunning(config.id, false);
        alert(`${t.stopSuccess} "${config.name}"`);
      } else {
        // 停止所有配置
        await window.electronAPI.frpc.stop();
        // 停止所有配置的运行状态
        safeConfigs.forEach(async (config) => {
          if (config.isRunning) {
            await setConfigRunning(config.id, false);
          }
        });
        alert(t.stopAllSuccess);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(t.stopFailed + ': ' + errorMessage);
    }
  };

  const handleViewLogs = (config: any) => {
    // 触发切换到日志页面的事件
    window.dispatchEvent(new CustomEvent('switchToLogs', { detail: config }));
  };

  const handleEditConfig = (config: any) => {
    // 触发切换到编辑页面的事件
    window.dispatchEvent(new CustomEvent('editConfig', { detail: config }));
  };

  const handleSelectFrpc = async () => {
    try {
      await selectFrpcPath();
      alert('frpc.exe 选择成功！');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('选择失败: ' + errorMessage);
    }
  };

  const handleOpenDownloadPage = async () => {
    try {
      await window.electronAPI.shell.openExternal('https://github.com/fatedier/frp/releases');
    } catch (error) {
      alert('无法打开浏览器，请手动访问: https://github.com/fatedier/frp/releases');
    }
  };

  // 获取配置的端口信息
  const getPortInfo = (config: any) => {
    const ports: string[] = [];

    // 从 visitors 中获取 bindPort
    if (config.config?.visitors && Array.isArray(config.config.visitors)) {
      config.config.visitors.forEach((visitor: any) => {
        if (visitor.bindPort && typeof visitor.bindPort === 'number') {
          ports.push(`${visitor.bindPort} (${visitor.name || 'visitor'})`);
        }
      });
    }

    // 从 proxies 中获取 localPort
    if (config.config?.proxies && Array.isArray(config.config.proxies)) {
      config.config.proxies.forEach((proxy: any) => {
        if (proxy.localPort && typeof proxy.localPort === 'number') {
          ports.push(`${proxy.localPort} (${proxy.name || 'proxy'})`);
        }
      });
    }

    return ports.length > 0 ? ports.join(', ') : t.noPortsConfigured;
  };

  return (
    <div className="space-y-6">
      {/* frpc.exe 选择区域 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">FRP 客户端设置</h3>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">frpc.exe 路径:</span>
                {frpcPath ? (
                  <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                    {frpcPath}
                  </span>
                ) : (
                  <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                    未选择
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                请选择 frpc.exe 文件以启动 FRP 客户端服务
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSelectFrpc}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                选择 frpc.exe
              </button>
              <button
                onClick={handleOpenDownloadPage}
                className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                下载 FRP
              </button>
            </div>
          </div>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  重要提示
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>• 下载地址: <a href="https://github.com/fatedier/frp/releases" className="underline">https://github.com/fatedier/frp/releases</a></p>
                  <p>• 建议将 frpc.exe 存放在专门的目录中</p>
                  <p>• 请将存放目录添加到 Windows Defender 排除列表，避免被误杀</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 配置列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">{t.configurationList}</h3>
          <button
            onClick={() => handleStop()}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            {t.stopAll}
          </button>
        </div>
      <div className="divide-y divide-gray-200">
        {safeConfigs.map((config) => (
          <div key={config.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium">{config.name}</h4>
              <p className="text-sm text-gray-500">
                {t.server}: {config.config.serverAddr}:{config.config.serverPort}
              </p>
              <p className="text-sm text-blue-600">
                {t.localPorts}: {getPortInfo(config)}
              </p>
              {config.isRunning && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                  {t.running}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <div className="relative group">
                <button
                  onClick={() => handleEditConfig(config)}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  {t.edit}
                </button>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  {t.tomlAdvancedEditor}
                </div>
              </div>
              <button
                onClick={() => handleStart(config)}
                disabled={config.isRunning}
                className={`px-3 py-1 rounded text-sm ${
                  config.isRunning
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {t.start}
              </button>
              <button
                onClick={() => handleStop(config)}
                disabled={!config.isRunning}
                className={`px-3 py-1 rounded text-sm ${
                  config.isRunning
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                {t.stop}
              </button>
              <button
                onClick={() => handleViewLogs(config)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                {t.logs}
              </button>
              <button
                onClick={() => deleteConfig(config.id)}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                {t.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};