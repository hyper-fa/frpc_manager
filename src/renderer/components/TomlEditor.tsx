import React, { useState, useEffect } from 'react';
import * as toml from '@iarna/toml';

interface TomlEditorProps {
  config: any;
  onSave: (name: string, config: any) => Promise<void>;
  initialName: string;
  configId: string;
}

export const TomlEditor: React.FC<TomlEditorProps> = ({ 
  config, 
  onSave, 
  initialName, 
  configId 
}) => {
  const [configName, setConfigName] = useState(initialName);
  const [tomlContent, setTomlContent] = useState('');
  const [originalTomlContent, setOriginalTomlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 加载当前的 TOML 文件内容
  useEffect(() => {
    loadTomlFile();
  }, [configId]);

  const loadTomlFile = async () => {
    try {
      setIsLoading(true);
      const filePath = `frp/${initialName}.toml`;
      const content = await window.electronAPI.config.readTomlFile(filePath);
      setTomlContent(content);
      setOriginalTomlContent(content);
      setHasChanges(false);
    } catch (error) {
      console.error('加载 TOML 文件失败:', error);
      // 如果文件不存在，使用当前配置生成 TOML
      try {
        // 清理配置，移除应用内部字段
        const cleanConfig = { ...config };
        delete cleanConfig.id;
        delete cleanConfig.name;
        delete cleanConfig.filePath;
        delete cleanConfig.isRunning;

        const generatedToml = toml.stringify(cleanConfig, {
          integer: Number.MAX_SAFE_INTEGER // 防止大数字被分割
        });
        setTomlContent(generatedToml);
        setOriginalTomlContent(generatedToml);
        setHasChanges(false);
      } catch (genError) {
        console.error('生成 TOML 失败:', genError);
        setTomlContent('# 配置文件加载失败，请手动输入配置');
        setOriginalTomlContent('');
        setHasChanges(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTomlChange = (value: string) => {
    setTomlContent(value);
    setHasChanges(value !== originalTomlContent);
    setTestResult(null);
  };

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      // 验证 TOML 语法
      let parsedConfig;
      try {
        parsedConfig = toml.parse(tomlContent);
      } catch (parseError) {
        setTestResult({
          success: false,
          message: `TOML 语法错误: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        });
        return;
      }

      // 验证必要字段
      const requiredFields = ['serverAddr', 'serverPort'];
      for (const field of requiredFields) {
        if (!parsedConfig[field]) {
          setTestResult({
            success: false,
            message: `缺少必要字段: ${field}`
          });
          return;
        }
      }

      // 验证端口号
      if (typeof parsedConfig.serverPort !== 'number' || parsedConfig.serverPort <= 0 || parsedConfig.serverPort > 65535) {
        setTestResult({
          success: false,
          message: '服务器端口号必须是 1-65535 之间的数字'
        });
        return;
      }

      // 验证 visitors 和 proxies
      if (parsedConfig.visitors && Array.isArray(parsedConfig.visitors)) {
        for (let i = 0; i < parsedConfig.visitors.length; i++) {
          const visitor = parsedConfig.visitors[i];
          if (!visitor.name || !visitor.type) {
            setTestResult({
              success: false,
              message: `Visitor ${i + 1}: 缺少 name 或 type 字段`
            });
            return;
          }
        }
      }

      if (parsedConfig.proxies && Array.isArray(parsedConfig.proxies)) {
        for (let i = 0; i < parsedConfig.proxies.length; i++) {
          const proxy = parsedConfig.proxies[i];
          if (!proxy.name || !proxy.type) {
            setTestResult({
              success: false,
              message: `Proxy ${i + 1}: 缺少 name 或 type 字段`
            });
            return;
          }
        }
      }

      setTestResult({
        success: true,
        message: '配置验证通过！可以安全保存。'
      });

    } catch (error) {
      setTestResult({
        success: false,
        message: `测试失败: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      // 先测试配置
      if (!testResult || !testResult.success) {
        alert('请先测试配置并确保通过验证');
        return;
      }

      if (!configName.trim()) {
        alert('请输入配置名称');
        return;
      }

      // 解析 TOML 内容
      const parsedConfig = toml.parse(tomlContent);

      // 保存 TOML 文件
      const tomlFilePath = `frp/${configName.trim()}.toml`;
      await window.electronAPI.config.saveTomlFile(tomlFilePath, tomlContent);

      // 保存配置到应用状态
      await onSave(configName.trim(), parsedConfig);

      // 更新原始内容
      setOriginalTomlContent(tomlContent);
      setHasChanges(false);

      alert('配置保存成功！TOML 文件和应用配置都已更新。');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('保存失败: ' + errorMessage);
    }
  };

  const handleReset = () => {
    if (hasChanges && !confirm('确定要重置所有更改吗？')) {
      return;
    }
    setTomlContent(originalTomlContent);
    setHasChanges(false);
    setTestResult(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">正在加载配置文件...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">TOML Configuration Editor / TOML 配置编辑器</h3>
        <p className="text-sm text-gray-500 mt-1">
          Direct TOML file editing with syntax validation and testing / 直接编辑 TOML 配置文件，支持语法验证和测试
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* 配置名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Configuration Name / 配置名称
          </label>
          <input
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Enter configuration name / 输入配置名称"
          />
        </div>

        {/* TOML 编辑器 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              TOML Configuration Content / TOML 配置内容
            </label>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  有未保存的更改
                </span>
              )}
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="text-xs px-2 py-1 bg-gray-500 text-white rounded disabled:bg-gray-300"
              >
                重置
              </button>
            </div>
          </div>
          <textarea
            value={tomlContent}
            onChange={(e) => handleTomlChange(e.target.value)}
            className="w-full h-96 border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
            placeholder="输入 TOML 配置内容..."
          />
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div className={`p-3 rounded-md ${
            testResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`text-sm ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.message}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={loadTomlFile}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            重新加载
          </button>
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isTesting ? '测试中...' : '测试配置'}
          </button>
          <button
            onClick={handleSave}
            disabled={!testResult?.success || !hasChanges}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};
