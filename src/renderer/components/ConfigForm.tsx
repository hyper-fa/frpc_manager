import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';

interface ConfigFormProps {
  onSave: (name: string, config: any) => Promise<void>;
  initialConfig?: any;
  initialName?: string;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onSave, initialConfig, initialName }) => {
  // 确保初始配置有完整的结构
  const getDefaultConfig = () => ({
    serverAddr: '120.46.90.102',
    serverPort: 18997,
    auth: { method: 'token', token: '' },
    webServer: { addr: '0.0.0.0', port: 7401, user: '', password: '' },
    visitors: []
  });

  const [config, setConfig] = useState(() => {
    if (initialConfig) {
      return {
        ...getDefaultConfig(),
        ...initialConfig,
        visitors: initialConfig.visitors || []
      };
    }
    return getDefaultConfig();
  });
  const [configName, setConfigName] = useState(initialName || '');

  const addVisitor = () => {
    setConfig(prev => ({
      ...prev,
      visitors: [...(prev.visitors || []), {
        name: '',
        type: 'xtcp',
        serverName: '',
        bindPort: 0,
        secretKey: ''
      }]
    }));
  };

  const updateVisitor = (index: number, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      visitors: (prev.visitors || []).map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const removeVisitor = (index: number) => {
    setConfig(prev => ({
      ...prev,
      visitors: (prev.visitors || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!configName.trim()) {
      alert('请输入配置名称');
      return;
    }

    try {
      await onSave(configName.trim(), config);
      // 保存成功后重置表单
      setConfigName('');
      setConfig(getDefaultConfig());
    } catch (error) {
      // 错误已经在上层处理了，这里不需要额外处理
      console.error('保存配置时出错:', error);
    }
  };

  const handleLoadConfig = async () => {
    try {
      const filePath = await window.electronAPI.config.selectFile();
      if (!filePath) return;

      const result = await window.electronAPI.config.loadFile(filePath);

      // 确保加载的配置有完整的结构
      const loadedConfig = {
        ...getDefaultConfig(),
        ...result.config,
        visitors: result.config.visitors || []
      };

      setConfig(loadedConfig);
      setConfigName(result.name);
      alert(`配置文件 "${result.name}" 加载成功！`);
    } catch (error) {
      console.error('加载配置文件失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`加载配置文件失败: ${errorMessage}`);
    }
  };

  const isEditMode = !!initialConfig;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h3 className="text-lg font-medium">
            {isEditMode ? 'Edit Configuration / 编辑配置' : 'New Configuration / 新建配置'}
          </h3>
        </div>
        <h4 className="text-md font-medium mb-4">Basic Configuration / 基础配置</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Server Address / 服务器地址</label>
            <input
              type="text"
              value={config.serverAddr}
              onChange={(e) => setConfig(prev => ({ ...prev, serverAddr: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Server Port / 服务器端口</label>
            <input
              type="number"
              value={config.serverPort}
              onChange={(e) => setConfig(prev => ({ ...prev, serverPort: parseInt(e.target.value) }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Auth Token / 认证令牌</label>
            <input
              type="text"
              value={config.auth.token}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                auth: { ...prev.auth, token: e.target.value }
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Visitor Configuration / 访问者配置</h3>
          <button
            onClick={addVisitor}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Visitor / 添加访问者
          </button>
        </div>
        
        {(config.visitors || []).map((visitor, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Visitor / 访问者 {index + 1}</h4>
              <button
                onClick={() => removeVisitor(index)}
                className="text-red-600 hover:text-red-800"
              >
                Delete / 删除
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="名称"
                value={visitor.name}
                onChange={(e) => updateVisitor(index, 'name', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                placeholder="服务器名称"
                value={visitor.serverName}
                onChange={(e) => updateVisitor(index, 'serverName', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="number"
                placeholder="绑定端口"
                value={visitor.bindPort}
                onChange={(e) => updateVisitor(index, 'bindPort', parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                placeholder="密钥"
                value={visitor.secretKey}
                onChange={(e) => updateVisitor(index, 'secretKey', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="配置名称"
          value={configName}
          onChange={(e) => setConfigName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
        />
        <button
          onClick={handleLoadConfig}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          加载配置
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {isEditMode ? '更新配置' : '保存配置'}
        </button>
      </div>
    </div>
  );
};