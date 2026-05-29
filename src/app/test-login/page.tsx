'use client';

import { useState } from 'react';

export default function TestLoginPage() {
  const [phone, setPhone] = useState('13800000002');
  const [password, setPassword] = useState('user123');
  const [result, setResult] = useState('');

  const handleTest = async () => {
    try {
      setResult('正在测试...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();
      
      setResult(`
状态码: ${response.status}
响应数据: ${JSON.stringify(data, null, 2)}
Cookie: ${document.cookie}
      `);

      if (response.ok) {
        setTimeout(() => {
          window.location.href = '/user';
        }, 1000);
      }
    } catch (err) {
      setResult(`错误: ${err}`);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">登录测试页面</h1>
      
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">输入测试</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">手机号</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={handleTest}
            className="btn btn-primary"
          >
            测试登录
          </button>
        </div>
      </div>

      {result && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">结果</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
