@echo off
echo 启动 FRP Client Manager...
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未找到 Node.js，请先安装 Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 依赖安装失败
        pause
        exit /b 1
    )
)

REM 构建项目
echo 正在构建项目...
npm run build
if %errorlevel% neq 0 (
    echo 构建失败
    pause
    exit /b 1
)

REM 启动应用
echo 启动应用...
npx electron .

pause
