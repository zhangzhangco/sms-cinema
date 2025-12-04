#!/bin/bash

# SMS 系统启动脚本

echo "=========================================="
echo "  SMS - Screen Management System"
echo "=========================================="
echo ""

# 检查依赖
echo "检查依赖..."

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装"
    exit 1
fi
echo "✓ Python3"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi
echo "✓ Node.js"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi
echo "✓ npm"

echo ""
echo "启动后端服务..."
cd sms_agent
python3 agent.py &
BACKEND_PID=$!
cd ..

echo "后端服务已启动 (PID: $BACKEND_PID)"
echo ""

# 等待后端启动
sleep 2

echo "启动前端服务..."
cd sms_frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "前端服务已启动 (PID: $FRONTEND_PID)"
echo ""
echo "=========================================="
echo "  系统已启动！"
echo "=========================================="
echo ""
echo "后端API: http://localhost:8088"
echo "前端界面: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "echo ''; echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# 保持脚本运行
wait
