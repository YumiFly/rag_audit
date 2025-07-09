#!/usr/bin/env node

// 简化的开发服务器启动脚本，兼容旧版本Node.js
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动前端开发服务器...');
console.log('📍 如果遇到语法错误，请升级Node.js到14+版本');
console.log('');

// 尝试直接运行Next.js
const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');
const child = spawn('node', [nextBin, 'dev'], {
  stdio: 'inherit',
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('❌ 启动失败:', error.message);
  console.log('');
  console.log('💡 解决方案:');
  console.log('1. 升级Node.js到14+版本:');
  console.log('   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash');
  console.log('   nvm install 18');
  console.log('   nvm use 18');
  console.log('');
  console.log('2. 或者访问后端API:');
  console.log('   http://localhost:8000/docs (FastAPI文档)');
  console.log('   http://localhost:8000/health (健康检查)');
});

child.on('close', (code) => {
  if (code !== 0) {
    console.log('');
    console.log('❌ 前端服务器停止运行');
    console.log('');
    console.log('📋 当前系统信息:');
    console.log(`   Node.js版本: ${process.version}`);
    console.log(`   平台: ${process.platform}`);
    console.log('');
    console.log('💡 建议升级到Node.js 18+以获得最佳体验');
  }
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭开发服务器...');
  child.kill('SIGINT');
});
