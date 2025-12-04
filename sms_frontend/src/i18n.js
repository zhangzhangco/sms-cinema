import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            // Header
            "title": "SMS CONSOLE",
            "subtitle": "Cinema Playback System v1.0",
            "system": "SYSTEM",
            "online": "ONLINE",

            // Status
            "playbackStatus": "Playback Status",
            "currentDcp": "CURRENT DCP",
            "none": "None",

            // System Info
            "systemInfo": "System Info",
            "cpuLoad": "CPU Load",
            "gpuLoad": "GPU Load",
            "diskUsage": "Disk Usage",
            "temp": "Temp",
            "videoOutput": "Video Output",
            "active": "Active (Display :1)",

            // Transport Control
            "transportControl": "Transport Control",
            "frame": "Frame",
            "play": "PLAY",
            "pause": "PAUSE",
            "resume": "RESUME",
            "stop": "STOP",
            "manualDcpLoad": "MANUAL DCP LOAD",
            "browseDcp": "SELECT DCP DIR",
            "audioDevice": "Audio Device",
            "displayDevice": "Display Device",

            // Playlist
            "playlist": "Playlist",
            "playing": "PLAYING",
            "startPlaylist": "START PLAYLIST",
            "addToPlaylist": "ADD TO PLAYLIST",

            // Projector
            "projectorControl": "Projector Control",
            "lamp": "LAMP",
            "douser": "DOUSER",
            "on": "ON",
            "off": "OFF",
            "open": "OPEN",
            "closed": "CLOSED",
            "macro1": "MACRO 1 (2D)",
            "macro2": "MACRO 2 (3D)",
            "macro3": "MACRO 3 (Flat)",
            "macro4": "MACRO 4 (Scope)",

            // Sound
            "soundProcessor": "Sound Processor",
            "masterLevel": "MASTER LEVEL",
            "mute": "MUTE",
            "muted": "MUTED",
            "unmuted": "UNMUTED",

            // Language
            "language": "Language",

            // Status values
            "IDLE": "IDLE",
            "PLAYING": "PLAYING",
            "PAUSED": "PAUSED",
            "STOPPED": "STOPPED"
        }
    },
    zh: {
        translation: {
            // Header
            "title": "SMS 控制台",
            "subtitle": "影院播放系统 v1.0",
            "system": "系统",
            "online": "在线",

            // Status
            "playbackStatus": "播放状态",
            "currentDcp": "当前 DCP",
            "none": "无",

            // System Info
            "systemInfo": "系统信息",
            "cpuLoad": "CPU 负载",
            "gpuLoad": "GPU 负载",
            "diskUsage": "磁盘使用",
            "temp": "温度",
            "videoOutput": "视频输出",
            "active": "活动 (显示器 :1)",

            // Transport Control
            "transportControl": "传输控制",
            "frame": "帧",
            "play": "播放",
            "pause": "暂停",
            "resume": "继续",
            "stop": "停止",
            "manualDcpLoad": "手动加载 DCP",
            "browseDcp": "选择 DCP 目录",
            "audioDevice": "音频设备",
            "displayDevice": "显示设备",

            // Playlist
            "playlist": "播放列表",
            "playing": "播放中",
            "startPlaylist": "开始播放列表",
            "addToPlaylist": "添加到播放列表",

            // Projector
            "projectorControl": "放映机控制",
            "lamp": "灯泡",
            "douser": "遮光板",
            "on": "开",
            "off": "关",
            "open": "打开",
            "closed": "关闭",
            "macro1": "宏 1 (2D)",
            "macro2": "宏 2 (3D)",
            "macro3": "宏 3 (平面)",
            "macro4": "宏 4 (变形)",

            // Sound
            "soundProcessor": "音频处理器",
            "masterLevel": "主音量",
            "mute": "静音",
            "muted": "已静音",
            "unmuted": "未静音",

            // Language
            "language": "语言",

            // Status values
            "IDLE": "空闲",
            "PLAYING": "播放中",
            "PAUSED": "已暂停",
            "STOPPED": "已停止"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'zh', // 默认中文
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
