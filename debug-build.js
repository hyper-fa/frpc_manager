const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== 调试构建脚本 ===');

// 检查构建文件
function checkBuildFiles() {
  console.log('\n检查构建文件:');
  
  const filesToCheck = [
    'dist/main.js',
    'dist/preload.js',
    'dist/renderer/index.html',
    'dist/renderer/assets'
  ];
  
  filesToCheck.forEach(file => {
    const fullPath = path.join(__dirname, file);
    const exists = fs.existsSync(fullPath);
    console.log(`- ${file}: ${exists ? '✓ 存在' : '✗ 不存在'}`);
    
    if (exists && fs.statSync(fullPath).isFile()) {
      const size = fs.statSync(fullPath).size;
      console.log(`  大小: ${size} bytes`);
    }
  });
}

// 构建项目
function build() {
  return new Promise((resolve, reject) => {
    console.log('\n开始构建...');
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('构建完成');
        resolve();
      } else {
        reject(new Error(`构建失败，退出码: ${code}`));
      }
    });
  });
}

// 打包应用
function package() {
  return new Promise((resolve, reject) => {
    console.log('\n开始打包...');
    const packageProcess = spawn('npx', ['electron-builder', '--dir', '--publish=never'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    packageProcess.on('close', (code) => {
      if (code === 0) {
        console.log('打包完成');
        resolve();
      } else {
        reject(new Error(`打包失败，退出码: ${code}`));
      }
    });
  });
}

// 主函数
async function main() {
  try {
    await build();
    checkBuildFiles();
    await package();
    
    console.log('\n=== 构建完成 ===');
    console.log('输出目录: portable-build/win-unpacked');
    console.log('可执行文件: portable-build/win-unpacked/FRPClient Manager.exe');
    
  } catch (error) {
    console.error('构建失败:', error.message);
    process.exit(1);
  }
}

main();
