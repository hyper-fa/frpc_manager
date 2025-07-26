import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../stores/useAppStore';

export const LogViewer: React.FC = () => {
  const { logs, addLog, clearLogs } = useAppStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('设置日志监听器...');

    const handleLog = (log: string) => {
      console.log('收到日志:', log);
      addLog(log);
    };

    // 设置日志监听器
    window.electronAPI.frpc.onLog(handleLog);

    // 添加一条测试日志
    addLog('日志系统已初始化');

    // 清理函数（如果需要的话）
    return () => {
      console.log('清理日志监听器');
    };
  }, [addLog]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium">Runtime Logs / 运行日志</h3>
        <button
          onClick={clearLogs}
          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
        >
          Clear Logs / 清空日志
        </button>
      </div>
      <div className="p-4">
        <div className="bg-black text-green-400 font-mono text-sm p-4 rounded h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};