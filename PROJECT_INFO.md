# SMS 项目说明

## 项目概述

SMS (Screen Management System) 是一个现代化的数字电影放映管理系统，提供Web界面来控制DCP播放器。

## 关于系统信息显示

**重要说明：** 当前版本中，Dashboard界面显示的系统负载信息（CPU负载、GPU负载、磁盘使用率、温度等）是**静态模拟数据**，用于界面展示目的。

这些数据位于 `sms_frontend/src/Dashboard.jsx` 文件中：
- CPU Load: 12% (硬编码)
- GPU Load: 45% (硬编码)
- Disk Usage: 78% (硬编码)
- Temperature: 42°C (硬编码)

### 如何实现真实的系统监控

如果需要显示真实的系统负载数据，可以：

1. **在后端添加系统监控功能**
   ```python
   # 在 sms_agent/agent.py 中添加
   import psutil
   
   @app.get("/system/stats")
   def get_system_stats():
       return {
           "cpu_load": psutil.cpu_percent(interval=1),
           "gpu_load": get_gpu_usage(),  # 需要nvidia-smi或其他GPU监控工具
           "disk_usage": psutil.disk_usage('/').percent,
           "temperature": get_cpu_temp()  # 需要sensors库
       }
   ```

2. **在前端调用真实数据**
   ```javascript
   // 在 Dashboard.jsx 中
   const [systemStats, setSystemStats] = useState({
       cpu_load: 0,
       gpu_load: 0,
       disk_usage: 0,
       temperature: 0
   });
   
   useEffect(() => {
       const fetchSystemStats = async () => {
           const res = await fetch(`${API_BASE}/system/stats`);
           const data = await res.json();
           setSystemStats(data);
       };
       const interval = setInterval(fetchSystemStats, 5000);
       return () => clearInterval(interval);
   }, []);
   ```

## 项目结构

```
.
├── sms_agent/              # 后端服务
│   └── agent.py           # FastAPI服务器
├── sms_frontend/          # 前端界面
│   ├── src/
│   │   ├── Dashboard.jsx  # 主控制台界面
│   │   ├── i18n.js       # 国际化配置
│   │   └── ...
│   └── package.json
├── src/dcpplayer/         # DCP播放器源码
└── README.md
```

## 功能清单

### 已实现功能
- ✅ DCP播放控制（播放、暂停、停止、继续）
- ✅ 播放进度显示（实时）
- ✅ 播放列表管理
- ✅ 国际化支持（中文/英文）
- ✅ 本地DCP文件夹选择
- ✅ 音频设备选择
- ✅ 显示设备选择
- ✅ 硬件控制模拟（放映机灯泡、遮光板、音频处理器）

### 模拟功能（非真实数据）
- ⚠️ 系统负载监控（CPU、GPU、磁盘、温度）
- ⚠️ 硬件控制（放映机、音频处理器）

## 技术栈

### 后端
- Python 3.x
- FastAPI - Web框架
- Uvicorn - ASGI服务器
- Pydantic - 数据验证

### 前端
- React 19 - UI框架
- Vite - 构建工具
- react-i18next - 国际化

### DCP播放器
- C++ 
- SDL2 - 视频渲染
- NVIDIA JPEG2000 - GPU解码
- ASDCP库 - DCP解析

## 开发路线图

### 短期计划
- [ ] 实现真实的系统监控
- [ ] 添加用户认证
- [ ] 添加播放历史记录
- [ ] 改进错误处理和日志

### 长期计划
- [ ] 支持多放映厅管理
- [ ] 添加排片功能
- [ ] 集成票务系统接口
- [ ] 移动端适配

## 贡献指南

欢迎提交Issue和Pull Request！

在提交代码前，请确保：
1. 代码符合项目风格
2. 添加必要的注释
3. 更新相关文档
4. 测试功能正常

## 联系方式

如有问题或建议，请通过GitHub Issues联系。
