'use client';

import { useState } from 'react';

export default function SimpleTestPage() {
  const [status, setStatus] = useState('准备开始测试');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testLogin = async () => {
    try {
      setStatus('正在测试登录...');
      addLog('开始登录测试');

      // 测试用户登录
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: '13800000002', 
          password: 'user123' 
        }),
      });

      addLog(`登录响应状态: ${response.status}`);
      
      const data = await response.json();
      addLog(`登录响应数据: ${JSON.stringify(data)}`);

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      setStatus('登录成功！准备跳转');
      addLog('登录成功！2秒后跳转到 /user');

      setTimeout(() => {
        addLog('执行跳转: window.location.href = "/user"');
        window.location.href = '/user';
      }, 2000);

    } catch (err) {
      setStatus('测试失败');
      addLog(`错误: ${err}`);
    }
  };

  const testDirectAccess = () => {
    addLog('直接尝试访问 /user');
    window.location.href = '/user';
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">简单登录测试</h1>
      
      <div className="card mb-6">
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="font-medium">当前状态: {status}</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={testLogin}
            className="btn btn-primary w-full"
          >
            测试登录（用户账户）
          </button>
          
          <button
            onClick={testDirectAccess}
            className="btn btn-secondary w-full"
          >
            直接访问 /user
          </button>
          
          <button
            onClick={() => setLogs([])}
            className="btn btn-secondary w-full"
          >
            清除日志
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">测试日志</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">暂无日志...</p>
          ) : (
            logs.map((log, index) => (
              <p key={index} className="mb-1">{log}</p>
            ))
          )}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold mb-4">测试说明</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>点击"测试登录"按钮尝试登录并跳转</li>
          <li>点击"直接访问 /user"直接测试路由</li>
          <li>查看日志了解详细执行过程</li>
          <li>同时查看浏览器开发者工具的控制台和网络标签</li>
        </ul>
      </div>
    </div>
  );
}
