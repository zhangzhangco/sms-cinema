# SMS - Screen Management System

一个基于 **GPU 加速技术**的现代化数字电影放映管理系统，支持 DCP（Digital Cinema Package）播放控制。

## 核心技术亮点

### 🚀 GPU 加速解码
- 采用 **NVIDIA JPEG2000 GPU 解码器**，支持 Pascal 及更新架构（GTX 10系列及以上）
- 实时解码 **2K/4K DCP** 内容，性能远超传统CPU解码
- 支持 SMPTE 和 Interop 标准的 DCP 格式

### 🎯 专业级播放能力
- 支持立体声、5.1、7.1 及 IAB（Immersive Audio Bitstream）音轨
- 支持字幕显示
- 精确的帧同步和时间码控制

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

系统集成了基于 GPU 加速的 DCP 播放器：

### 技术架构
- **GPU解码**: NVIDIA JPEG2000 库（nvJPEG2000）
- **DCP解析**: ASDCP 库
- **视频渲染**: SDL2
- **音频输出**: PulseAudio

### 播放器特性
- 支持 `--headless` 无头模式运行
- 命令行参数：`-a` (音频设备) 和 `-d` (显示设备)
- 通过 Unix socket 提供 IPC 接口（`/tmp/dcpplayer.sock`）
- 支持命令：STOP, PAUSE, RESUME, PROGRESS

### 系统要求
- **GPU**: NVIDIA Pascal 架构或更新（GTX 1060 及以上）
- **驱动**: CUDA 支持
- **操作系统**: Linux (Ubuntu 推荐)

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

### DCP播放引擎
- **C++** - 核心播放器
- **NVIDIA nvJPEG2000** - GPU加速JPEG2000解码
- **ASDCP库** - DCP包解析
- **SDL2** - 跨平台多媒体渲染
- **PulseAudio** - Linux音频输出

### 后端服务
- **Python 3.x**
- **FastAPI** - 现代Web框架
- **Uvicorn** - ASGI服务器
- **Pydantic** - 数据验证

### 前端界面
- **React 19** - UI框架
- **Vite** - 快速构建工具
- **react-i18next** - 国际化支持

## 性能优势

相比传统CPU解码方案：
- ⚡ **解码速度提升 10-20倍**（GPU vs CPU）
- 🎥 **流畅播放 4K DCP**，无需降低分辨率
- 💻 **CPU占用率降低 80%+**
- 🔋 **更低的功耗和发热**

## 应用场景

- 🎬 **独立影院** - 小型影院的经济型放映解决方案
- 🎓 **电影学院** - 教学和学生作品展映
- 🎨 **后期制作** - DCP制作后的质量检查
- 🏢 **企业放映** - 公司活动和产品发布会

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

DCP播放器部分基于开源项目开发，使用了以下技术：
- NVIDIA nvJPEG2000 (NVIDIA License)
- ASDCP库 (BSD License)
- SDL2 (zlib License)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

感谢以下开源项目和技术：
- NVIDIA 的 JPEG2000 GPU 解码库
- ASDCP 库开发团队
- SDL2 项目
- 所有贡献者
