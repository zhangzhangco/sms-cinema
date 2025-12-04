# SMS - Screen Management System

一个用于数字电影放映的管理系统，支持DCP（Digital Cinema Package）播放控制。

## 功能特性

- 🎬 DCP播放控制（播放、暂停、停止、继续）
- 📋 播放列表管理
- 🎛️ 硬件控制模拟（放映机、音频处理器）
- 🌐 国际化支持（中文/英文）
- 📁 本地DCP文件夹选择
- 🔊 音频设备选择
- 🖥️ 显示设备选择
- 📊 实时播放进度显示

## 系统架构

### 后端 (SMS Agent)
- FastAPI 服务器
- 端口：8088
- 功能：DCP播放器进程管理、IPC通信、硬件控制API

### 前端 (SMS Frontend)
- React + Vite
- 端口：5173
- 功能：现代化的控制台界面，实时状态更新

## 安装依赖

### 后端依赖
```bash
cd sms_agent
pip install fastapi uvicorn pydantic
```

### 前端依赖
```bash
cd sms_frontend
npm install
```

## 运行系统

### 启动后端
```bash
cd sms_agent
python agent.py
```

### 启动前端
```bash
cd sms_frontend
npm run dev
```

访问 `http://localhost:5173` 使用系统。

## DCP播放器

系统需要配合DCP播放器使用。播放器应该：
- 支持 `--headless` 模式
- 接受命令行参数：`-a` (音频设备) 和 `-d` (显示设备)
- 通过Unix socket提供IPC接口（`/tmp/dcpplayer.sock`）
- 支持命令：STOP, PAUSE, RESUME, PROGRESS

播放器二进制文件路径：`src/dcpplayer/build/dcpplayer`

## 配置

在 `sms_agent/agent.py` 中可以配置：
- `IPC_SOCKET_PATH`: IPC socket路径
- `PLAYER_BIN`: DCP播放器二进制文件路径

## API接口

### 播放控制
- `POST /play` - 播放DCP
- `POST /stop` - 停止播放
- `POST /pause` - 暂停播放
- `POST /resume` - 继续播放

### 播放列表
- `POST /playlist/start` - 开始播放列表

### 状态查询
- `GET /status` - 获取系统状态

### 硬件控制
- `POST /hardware` - 控制硬件设备

## 开发

### 前端开发
```bash
cd sms_frontend
npm run dev
```

### 构建前端
```bash
cd sms_frontend
npm run build
```

## 技术栈

### 后端
- Python 3.x
- FastAPI
- Uvicorn
- Pydantic

### 前端
- React 19
- Vite
- react-i18next (国际化)

## 许可证

本项目基于原有DCP播放器项目开发，保留原项目的GPL许可证。

## 贡献

欢迎提交Issue和Pull Request。
