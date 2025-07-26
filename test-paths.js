const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// 测试路径解析
function testPaths() {
  console.log('=== 路径测试 ===');
  console.log('app.isPackaged:', app.isPackaged);
  console.log('process.execPath:', process.execPath);
  console.log('process.resourcesPath:', process.resourcesPath);
  console.log('__dirname:', __dirname);
  
  // 测试不同的根目录计算方式
  const appRoot1 = app.isPackaged
    ? path.dirname(process.execPath)
    : path.join(__dirname, '..');
    
  const appRoot2 = app.isPackaged
    ? path.join(process.resourcesPath, '..')
    : path.join(__dirname, '..');
    
  console.log('\n=== 根目录计算 ===');
  console.log('方式1 (execPath):', appRoot1);
  console.log('方式2 (resourcesPath):', appRoot2);
  
  // 测试 frp 目录路径
  const frpPath1 = path.join(appRoot1, 'frp');
  const frpPath2 = path.join(appRoot2, 'frp');
  const frpPath3 = path.join(process.resourcesPath, 'frp');
  
  console.log('\n=== FRP 目录路径 ===');
  console.log('frpPath1 (execPath/frp):', frpPath1);
  console.log('frpPath2 (resourcesPath/../frp):', frpPath2);
  console.log('frpPath3 (resourcesPath/frp):', frpPath3);
  
  // 检查目录是否存在
  console.log('\n=== 目录存在性检查 ===');
  console.log('frpPath1 exists:', fs.existsSync(frpPath1));
  console.log('frpPath2 exists:', fs.existsSync(frpPath2));
  console.log('frpPath3 exists:', fs.existsSync(frpPath3));
  
  // 如果是打包版本，检查 resources 目录内容
  if (app.isPackaged) {
    console.log('\n=== Resources 目录内容 ===');
    try {
      const resourcesContent = fs.readdirSync(process.resourcesPath);
      console.log('Resources 目录内容:', resourcesContent);
      
      if (resourcesContent.includes('frp')) {
        const frpContent = fs.readdirSync(path.join(process.resourcesPath, 'frp'));
        console.log('FRP 目录内容:', frpContent);
      }
    } catch (error) {
      console.error('读取 resources 目录失败:', error.message);
    }
  }
}

module.exports = { testPaths };
