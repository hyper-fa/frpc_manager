# 打包说明

## 问题说明
在 VSCode 中运行 `npm run dist` 会遇到进程被 VSCode 本身占用的问题，导致打包失败。

## 解决方案
需要在**管理员身份**的终端中手动执行打包命令。

## 打包步骤

1. **关闭 VSCode 中的开发服务器**
   - 如果正在运行 `npm run dev`，请先停止

2. **以管理员身份打开 PowerShell 或命令提示符**
   - 右键点击 PowerShell 图标
   - 选择"以管理员身份运行"

3. **导航到项目目录**
   ```bash
   cd "C:\Users\pecan\Desktop\frpc-gui-manager"
   ```

4. **执行打包命令**

   **选择一种打包方式：**

   ```bash
   # 所有格式（推荐用于调试）
   npm run dist:all

   # 仅便携版
   npm run dist:portable

   # 仅解压版（用于调试）
   npm run dist:dir

   # 仅安装包
   npm run dist:nsis

   # 调试构建（包含详细检查）
   node debug-build.js
   ```

5. **等待打包完成**
   - 打包过程可能需要几分钟
   - 完成后会在 `portable-build` 目录中生成文件

## 输出文件
- **便携版**: `portable-build/FRPClient Manager-1.0.0-portable.exe`
- **安装包**: `portable-build/FRPClient Manager-1.0.0-setup.exe`
- **解压版**: `portable-build/win-unpacked/` 目录

## 使用说明
- 便携版可以直接在任何 Windows 电脑上运行
- 无需安装 Node.js 或其他依赖
- frp 文件会自动包含在应用中

## 新功能
- ✅ **启动画面**: 添加了启动画面，显示加载进度
- ✅ **详细日志**: 启动过程中会显示详细的状态信息
- ✅ **应用图标**: 添加了自定义的 FRP 管理器图标
- ✅ **单文件便携版**: 生成单个可执行文件，无需安装

## 启动过程说明
1. **启动画面显示**: "正在初始化环境..."
2. **主窗口创建**: "正在初始化主窗口..."
3. **内容加载**: "正在加载界面..."
4. **DOM准备**: "界面准备就绪..."
5. **加载完成**: "加载完成，正在显示界面..."

## 故障排除
如果遇到白屏问题：
1. 查看启动画面上的状态信息
2. 检查控制台输出中的详细日志
3. 确保 frp 目录正确包含在打包中
4. 检查文件路径是否正确
5. 如果启动画面卡在某个步骤，说明该步骤有问题

## 日志位置
- 开发环境：VSCode 终端或 Electron 开发者工具控制台
- 生产环境：启动画面状态 + Windows 事件查看器
