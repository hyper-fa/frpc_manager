import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Language, useI18n } from '../i18n';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const login = useAppStore(state => state.login);
  const language = useAppStore(state => state.language);
  const setLanguage = useAppStore(state => state.setLanguage);
  const { t } = useI18n(language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(credentials);
      if (!success) {
        alert('用户名或密码错误！\n正确的用户名：admin\n正确的密码：admin');
      }
    } catch (error) {
      alert('登录失败：' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t.loginTitle}
          </h2>

          {/* Language Selector / 语言选择器 */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">{t.language}:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="text"
              placeholder={t.username}
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="relative block w-full px-3 py-2 border border-gray-300 rounded-t-md"
              required
            />
            <input
              type="password"
              placeholder={t.password}
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="relative block w-full px-3 py-2 border border-gray-300 rounded-b-md"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? `${t.login}...` : t.login}
          </button>
        </form>
      </div>
    </div>
  );
};