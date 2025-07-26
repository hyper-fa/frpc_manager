const fs = require('fs');
const path = require('path');

// 创建便携版目录
const portableDir = 'frpc-manager-portable';

// 如果目录存在，先删除
if (fs.existsSync(portableDir)) {
  fs.rmSync(portableDir, { recursive: true, force: true });
}

// 创建目录
fs.mkdirSync(portableDir, { recursive: true });

// 复制必要文件
const filesToCopy = [
  { src: 'dist', dest: path.join(portableDir, 'dist') },
  { src: 'frp', dest: path.join(portableDir, 'frp') },
  { src: 'node_modules', dest: path.join(portableDir, 'node_modules') },

  { src: 'package.json', dest: path.join(portableDir, 'package.json') }

];

function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    console.log(`Copying ${src} to ${dest}...`);
    copyRecursive(src, dest);
    console.log(`✓ Copied ${src} to ${dest}`);
  } else {
    console.log(`⚠ Warning: ${src} does not exist, skipping...`);
  }
});

// 创建启动脚本
const startScript = `@echo off
cd /d "%~dp0"
echo Starting FRP GUI Manager...
npx electron .
pause`;

fs.writeFileSync(path.join(portableDir, 'start.bat'), startScript);

// 创建 README 文件
const readmeContent = `# FRP GUI Manager 便携版

## 使用方法

1. 确保目标电脑已安装 Node.js (建议版本 16 或更高)
2. 如果是首次使用，在此目录运行: npm install
3. 双击 start.bat 启动应用

## 目录结构

- dist/: 应用程序文件
- frp/: FRP 配置文件目录
- node_modules/: Node.js 依赖包
- start.bat: 启动脚本

## 注意事项

- 配置文件保存在 frp/ 目录中
- 确保 frp/ 目录有写入权限
- 如果遇到问题，请检查控制台输出
`;

fs.writeFileSync(path.join(portableDir, 'README.md'), readmeContent);

console.log('✓ 便携版创建完成！');
console.log('✓ 启动脚本已创建: start.bat');
console.log('✓ 说明文档已创建: README.md');
console.log('\n⚠ 重要提示：');
console.log('由于文件锁定问题，node_modules 未被复制');
console.log('请在便携版目录中手动运行: npm install');
console.log('\n使用方法：');
console.log('1. 确保目标电脑已安装 Node.js');
console.log('2. 进入便携版目录: cd frpc-manager-portable');
console.log('3. 安装依赖: npm install');
console.log('4. 双击 start.bat 启动应用');
