import React, { useState, useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { LoginForm } from './components/LoginForm';
import { ConfigForm } from './components/ConfigForm';
import { ConfigList } from './components/ConfigList';
import { LogViewer } from './components/LogViewer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TomlEditor } from './components/TomlEditor';
import { useI18n } from './i18n';

export const App: React.FC = () => {
  const { isAuthenticated, addConfig, updateConfig, initConfigs, language } = useAppStore();
  const { t } = useI18n(language);
  const [activeTab, setActiveTab] = useState<'configs' | 'new' | 'logs' | 'edit' | 'toml-edit'>('configs');
  const [editingConfig, setEditingConfig] = useState<any>(null);

  // 在应用启动时加载保存的配置
  useEffect(() => {
    if (isAuthenticated) {
      initConfigs();
    }
  }, [isAuthenticated, initConfigs]);

  // 监听日志跳转事件和编辑配置事件
  useEffect(() => {
    const handleSwitchToLogs = (event: any) => {
      setActiveTab('logs');
    };

    const handleEditConfig = (event: any) => {
      setEditingConfig(event.detail);
      setActiveTab('toml-edit');
    };

    window.addEventListener('switchToLogs', handleSwitchToLogs);
    window.addEventListener('editConfig', handleEditConfig);

    return () => {
      window.removeEventListener('switchToLogs', handleSwitchToLogs);
      window.removeEventListener('editConfig', handleEditConfig);
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleSaveConfig = async (name: string, config: any) => {
    try {
      await addConfig(name, config);
      alert(t.configSaveSuccess);
      // 保存成功后切换到配置管理页面
      setActiveTab('configs');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(t.configSaveFailed + ': ' + errorMessage);
    }
  };

  const handleUpdateConfig = async (name: string, config: any) => {
    try {
      if (editingConfig) {
        // 只传递需要更新的数据，不包含应用内部字段
        await updateConfig(editingConfig.id, { name, config });
        alert(t.configUpdateSuccess);
        setEditingConfig(null);
        setActiveTab('configs');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(t.configUpdateFailed + ': ' + errorMessage);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {t.appTitle}
              </h1>
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('configs')}
                  className={`${activeTab === 'configs' ? 'text-indigo-600' : 'text-gray-500'} hover:text-gray-700`}
                >
                  {t.configManagement}
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`${activeTab === 'new' ? 'text-indigo-600' : 'text-gray-500'} hover:text-gray-700`}
                >
                  {t.newConfig}
                </button>
                {(activeTab === 'edit' || activeTab === 'toml-edit') && (
                  <button
                    onClick={() => setActiveTab(activeTab)}
                    className="text-indigo-600"
                  >
                    {t.editConfig}
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`${activeTab === 'logs' ? 'text-indigo-600' : 'text-gray-500'} hover:text-gray-700`}
                >
                  {t.runtimeLogs}
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>
            {activeTab === 'configs' && <ConfigList />}
            {activeTab === 'new' && <ConfigForm onSave={handleSaveConfig} />}
            {activeTab === 'edit' && editingConfig && (
              <ConfigForm
                onSave={handleUpdateConfig}
                initialConfig={editingConfig.config}
                initialName={editingConfig.name}
              />
            )}
            {activeTab === 'toml-edit' && editingConfig && (
              <TomlEditor
                config={editingConfig.config}
                onSave={handleUpdateConfig}
                initialName={editingConfig.name}
                configId={editingConfig.id}
              />
            )}
            {activeTab === 'logs' && <LogViewer />}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};