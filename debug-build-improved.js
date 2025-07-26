const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== FRP GUI Manager 调试构建脚本 ===\n');

// 检查必要的目录和文件
function checkPrerequisites() {
  console.log('1. 检查前置条件...');
  
  const requiredDirs = ['src', 'frp'];
  const requiredFiles = ['package.json', 'tsconfig.main.json'];
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      console.error(`❌ 缺少必要目录: ${dir}`);
      process.exit(1);
    }
    console.log(`✓ 目录存在: ${dir}`);
  }
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ 缺少必要文件: ${file}`);
      process.exit(1);
    }
    console.log(`✓ 文件存在: ${file}`);
  }
  
  // 检查 frp 目录内容
  const frpFiles = fs.readdirSync('frp');
  console.log(`✓ FRP 目录内容: ${frpFiles.join(', ')}`);
  
  console.log('✓ 前置条件检查完成\n');
}

// 构建应用
function buildApp() {
  return new Promise((resolve, reject) => {
    console.log('2. 构建应用...');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✓ 应用构建完成\n');
        resolve();
      } else {
        console.error('❌ 应用构建失败');
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

// 创建便携版
function createPortable() {
  return new Promise((resolve, reject) => {
    console.log('3. 创建便携版...');
    
    const portableProcess = spawn('node', ['create-portable.js'], {
      stdio: 'inherit',
      shell: true
    });
    
    portableProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✓ 便携版创建完成\n');
        resolve();
      } else {
        console.error('❌ 便携版创建失败');
        reject(new Error(`Portable creation failed with code ${code}`));
      }
    });
  });
}

// 启动应用进行测试
function startApp() {
  return new Promise((resolve) => {
    console.log('4. 启动应用进行测试...');
    console.log('注意：应用将在新窗口中打开，请检查控制台输出');
    console.log('按 Ctrl+C 停止测试\n');
    
    const appProcess = spawn('npx', ['electron', '.'], {
      stdio: 'inherit',
      shell: true,
      cwd: 'frpc-manager-portable'
    });
    
    // 监听进程退出
    appProcess.on('close', (code) => {
      console.log(`\n应用已退出，退出码: ${code}`);
      resolve();
    });
    
    // 监听 Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n正在停止应用...');
      appProcess.kill('SIGINT');
    });
  });
}

// 主函数
async function main() {
  try {
    checkPrerequisites();
    await buildApp();
    await createPortable();
    
    console.log('=== 构建完成 ===');
    console.log('便携版已创建在: frpc-manager-portable/');
    console.log('\n选择下一步操作:');
    console.log('1. 直接测试应用 (按 Enter)');
    console.log('2. 仅构建，不测试 (按 Ctrl+C)');
    
    // 等待用户输入
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (key) => {
      if (key[0] === 13) { // Enter 键
        process.stdin.setRawMode(false);
        process.stdin.pause();
        await startApp();
        process.exit(0);
      } else if (key[0] === 3) { // Ctrl+C
        console.log('\n构建完成，跳过测试');
        process.exit(0);
      }
    });
    
  } catch (error) {
    console.error('❌ 构建过程中出现错误:', error.message);
    process.exit(1);
  }
}

main();
