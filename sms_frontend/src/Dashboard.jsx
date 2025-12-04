import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE = "http://localhost:8088";

function Dashboard() {
    const { t, i18n } = useTranslation();
    const fileInputRef = useRef(null);
    
    const [status, setStatus] = useState({
        status: "IDLE",
        current_dcp: null,
        playlist_active: false,
        progress: { current: 0, total: 0 },
        hardware: {
            projector: { lamp: false, douser: false },
            sound: { level: 7.0, mute: false }
        }
    });
    const [dcpPath, setDcpPath] = useState("/home/zhangxin/788782_StEM-2_TST-1-48nit-14fl_S_EN-XX_OV_71-IAB_4K_ASC_20220608_DLX_SMPTE_OV");
    const [playlist, setPlaylist] = useState(["/home/zhangxin/788782_StEM-2_TST-1-48nit-14fl_S_EN-XX_OV_71-IAB_4K_ASC_20220608_DLX_SMPTE_OV"]);
    const [audioDevice, setAudioDevice] = useState(0);
    const [displayDevice, setDisplayDevice] = useState(0);

    useEffect(() => {
        const interval = setInterval(fetchStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/status`);
            const data = await res.json();
            setStatus(data);
        } catch (e) {
            console.error("Failed to fetch status", e);
        }
    };

    const handlePlay = async () => {
        await fetch(`${API_BASE}/play`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                dcp_path: dcpPath,
                audio_dev: audioDevice,
                display_dev: displayDevice
            })
        });
        fetchStatus();
    };

    const handleStop = async () => {
        await fetch(`${API_BASE}/stop`, { method: "POST" });
        fetchStatus();
    };

    const handlePause = async () => {
        await fetch(`${API_BASE}/pause`, { method: "POST" });
        fetchStatus();
    };

    const handleResume = async () => {
        await fetch(`${API_BASE}/resume`, { method: "POST" });
        fetchStatus();
    };

    const handlePlaylistStart = async () => {
        await fetch(`${API_BASE}/playlist/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dcps: playlist })
        });
        fetchStatus();
    };

    const controlHardware = async (component, action, value) => {
        await fetch(`${API_BASE}/hardware`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ component, action, value })
        });
        fetchStatus();
    };

    const handleBrowseDcp = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // 获取第一个文件的路径（去掉文件名，只保留目录）
            const file = files[0];
            // webkitRelativePath 包含相对路径，我们需要提取目录路径
            const path = file.webkitRelativePath || file.name;
            const folderPath = path.substring(0, path.lastIndexOf('/'));
            
            if (folderPath) {
                setDcpPath(folderPath);
            }
        }
    };

    const handleAddToPlaylist = () => {
        if (dcpPath && !playlist.includes(dcpPath)) {
            setPlaylist([...playlist, dcpPath]);
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'zh' ? 'en' : 'zh';
        i18n.changeLanguage(newLang);
    };

    const formatTime = (frames) => {
        if (!frames) return "00:00:00";
        const fps = 24;
        const seconds = Math.floor(frames / fps);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progressPercent = status.progress.total > 0
        ? (status.progress.current / status.progress.total) * 100
        : 0;

    return (
        <div style={{
            padding: "20px",
            fontFamily: "'Inter', sans-serif",
            backgroundColor: "#121212",
            color: "#e0e0e0",
            minHeight: "100vh",
            boxSizing: "border-box"
        }}>
            <header style={{
                marginBottom: "30px",
                borderBottom: "1px solid #333",
                paddingBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px", color: "#4CAF50", letterSpacing: "1px" }}>{t('title')}</h1>
                    <p style={{ margin: "5px 0 0", color: "#666", fontSize: "12px", textTransform: "uppercase" }}>{t('subtitle')}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <button 
                        onClick={toggleLanguage}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#333",
                            color: "#fff",
                            border: "1px solid #555",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        {t('language')}: {i18n.language === 'zh' ? '中文' : 'English'}
                    </button>
                    <div style={{ textAlign: "right", fontSize: "12px", color: "#888" }}>
                        <div>{t('system')}: {t('online')}</div>
                        <div>{new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
            </header>

            <div style={{
                display: "grid",
                gridTemplateColumns: "300px 1fr 300px",
                gap: "20px",
                height: "calc(100vh - 120px)"
            }}>
                {/* Left Column: Status */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ padding: "20px", backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333" }}>
                        <h3 style={{ marginTop: 0, fontSize: "14px", color: "#888", textTransform: "uppercase" }}>{t('playbackStatus')}</h3>
                        <div style={{
                            fontSize: "28px",
                            fontWeight: "bold",
                            color: status.status === "PLAYING" ? "#4CAF50" : (status.status === "PAUSED" ? "#FFC107" : "#757575"),
                            margin: "15px 0"
                        }}>
                            {t(status.status)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#aaa" }}>
                            {t('currentDcp')}:
                            <div style={{ color: "#4fc3f7", wordBreak: "break-all", marginTop: "5px" }}>
                                {status.current_dcp ? status.current_dcp.split('/').pop() : t('none')}
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: "20px", backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333", flex: 1 }}>
                        <h3 style={{ marginTop: 0, fontSize: "14px", color: "#888", textTransform: "uppercase" }}>{t('systemInfo')}</h3>
                        <div style={{ marginTop: "15px", fontSize: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span>{t('cpuLoad')}</span>
                                <span style={{ color: "#4CAF50" }}>12%</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span>{t('gpuLoad')}</span>
                                <span style={{ color: "#4CAF50" }}>45%</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span>{t('diskUsage')}</span>
                                <span style={{ color: "#FFC107" }}>78%</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span>{t('temp')}</span>
                                <span style={{ color: "#4CAF50" }}>42°C</span>
                            </div>
                        </div>
                        <div style={{ marginTop: "20px", fontSize: "12px", color: "#666", borderTop: "1px solid #333", paddingTop: "10px" }}>
                            {t('videoOutput')}: <span style={{ color: "#4CAF50" }}>{t('active')}</span>
                        </div>
                    </div>
                </div>

                {/* Middle Column: Controls & Playlist */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ padding: "20px", backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333" }}>
                        <h3 style={{ marginTop: 0, fontSize: "14px", color: "#888", textTransform: "uppercase" }}>{t('transportControl')}</h3>

                        {/* Progress Bar */}
                        <div style={{ margin: "20px 0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#aaa", marginBottom: "5px" }}>
                                <span>{formatTime(status.progress.current)}</span>
                                <span>{formatTime(status.progress.total)}</span>
                            </div>
                            <div style={{ height: "6px", backgroundColor: "#333", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{
                                    width: `${progressPercent}%`,
                                    height: "100%",
                                    backgroundColor: "#2196F3",
                                    transition: "width 0.5s linear"
                                }}></div>
                            </div>
                            <div style={{ textAlign: "center", fontSize: "10px", color: "#666", marginTop: "5px" }}>
                                {t('frame')}: {status.progress.current} / {status.progress.total}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button onClick={handlePlay} disabled={status.status === "PLAYING"} style={{
                                padding: "12px 24px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", opacity: status.status === "PLAYING" ? 0.5 : 1
                            }}>{t('play')}</button>

                            <button onClick={handlePause} disabled={status.status !== "PLAYING"} style={{
                                padding: "12px 24px", backgroundColor: "#FFC107", color: "black", border: "none", borderRadius: "4px", cursor: "pointer", opacity: status.status !== "PLAYING" ? 0.5 : 1
                            }}>{t('pause')}</button>

                            <button onClick={handleResume} disabled={status.status !== "PAUSED"} style={{
                                padding: "12px 24px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", opacity: status.status !== "PAUSED" ? 0.5 : 1
                            }}>{t('resume')}</button>

                            <button onClick={handleStop} style={{
                                padding: "12px 24px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"
                            }}>{t('stop')}</button>
                        </div>

                        <div style={{ marginTop: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#666" }}>{t('manualDcpLoad')}</label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input
                                    type="text"
                                    value={dcpPath}
                                    onChange={(e) => setDcpPath(e.target.value)}
                                    style={{
                                        flex: 1, padding: "10px", backgroundColor: "#121212", border: "1px solid #333", borderRadius: "4px", color: "#ddd"
                                    }}
                                />
                                <button
                                    onClick={handleBrowseDcp}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#2196F3",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    {t('browseDcp')}
                                </button>
                                <button
                                    onClick={handleAddToPlaylist}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#673AB7",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    +
                                </button>
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontSize: "11px", color: "#666" }}>{t('audioDevice')}</label>
                                    <select
                                        value={audioDevice}
                                        onChange={(e) => setAudioDevice(parseInt(e.target.value))}
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            backgroundColor: "#121212",
                                            border: "1px solid #333",
                                            borderRadius: "4px",
                                            color: "#ddd",
                                            fontSize: "12px"
                                        }}
                                    >
                                        <option value="0">Device 0 (Default)</option>
                                        <option value="1">Device 1</option>
                                        <option value="2">Device 2</option>
                                        <option value="3">Device 3</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontSize: "11px", color: "#666" }}>{t('displayDevice')}</label>
                                    <select
                                        value={displayDevice}
                                        onChange={(e) => setDisplayDevice(parseInt(e.target.value))}
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            backgroundColor: "#121212",
                                            border: "1px solid #333",
                                            borderRadius: "4px",
                                            color: "#ddd",
                                            fontSize: "12px"
                                        }}
                                    >
                                        <option value="0">Display 0</option>
                                        <option value="1">Display 1</option>
                                    </select>
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                webkitdirectory=""
                                directory=""
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: "none" }}
                            />
                        </div>
                    </div>

                    <div style={{ padding: "20px", backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333", flex: 1 }}>
                        <h3 style={{ marginTop: 0, fontSize: "14px", color: "#888", textTransform: "uppercase" }}>{t('playlist')}</h3>
                        <div style={{ marginTop: "15px", maxHeight: "300px", overflowY: "auto" }}>
                            {playlist.map((item, idx) => (
                                <div key={idx} style={{
                                    padding: "10px",
                                    backgroundColor: status.playlist_active && status.playlist_index === idx ? "#2c3e50" : "#121212",
                                    border: "1px solid #333",
                                    marginBottom: "5px",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}>
                                    <span style={{ color: "#666" }}>{idx + 1}.</span>
                                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.split('/').pop()}</span>
                                    {status.playlist_active && status.playlist_index === idx && <span style={{ color: "#4CAF50", fontSize: "10px" }}>{t('playing')}</span>}
                                </div>
                            ))}
                        </div>
                        <button onClick={handlePlaylistStart} style={{
                            width: "100%", marginTop: "15px", padding: "10px", backgroundColor: "#673AB7", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"
                        }}>{t('startPlaylist')}</button>
                    </div>
                </div>

                {/* Right Column: Hardware */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ padding: "20px", backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333" }}>
                        <h3 style={{ marginTop: 0, fontSize: "14px", color: "#888", textTransform: "uppercase" }}>{t('projectorControl')}</h3>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "15px 0", padding: "10px", backgroundColor: "#121212", borderRadius: "4px" }}>
                            <span>{t('lamp')}</span>
                            <button
                                onClick={() => controlHardware("projector", "lamp", !status.hardware?.projector?.lamp)}
                                style={{
                                    padding: "5px 15px",
                                    backgroundColor: status.hardware?.projector?.lamp ? "#4CAF50" : "#333",
                                    color: "white", border: "none", borderRadius: "15px", cursor: "pointer",
                                    transition: "background-color 0.3s"
                                }}
                            >
                                {status.hardware?.projector?.lamp ? t('on') : t('off')}
                            </button>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "15px 0", padding: "10px", backgroundColor: "#121212", borderRadius: "4px" }}>
                            <span>{t('douser')}</span>
                            <button
                                onClick={() => controlHardware("projector", "douser", !status.hardware?.projector?.douser)}
                                style={{
                                    padding: "5px 15px",
                                    backgroundColor: status.hardware?.projector?.douser ? "#f44336" : "#4CAF50",
                                    color: "white", border: "none", borderRadius: "15px", cursor: "pointer",
                                    transition: "background-color 0.3s"
                                }}
                            >
                                {status.hardware?.projector?.douser ? t('closed') : t('open')}
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px" }}>
                            <button style={{ padding: "10px", backgroundColor: "#333", border: "none", color: "#aaa", borderRadius: "4px", cursor: "pointer" }}>{t('macro1')}</button>
                            <button style={{ padding: "10px", backgroundColor: "#333", border: "none", color: "#aaa", borderRadius: "4px", cursor: "pointer" }}>{t('macro2')}</button>
                            <button style={{ padding: "10px", backgroundColor: "#333", border: "none", color: "#aaa", borderRadius: "4px", cursor: "pointer" }}>{t('macro3')}</button>
                            <button style={{ padding: "10px", backgroundColor: "#333", border: "none", color: "#aaa", borderRadius: "4px", cursor: "pointer" }}>{t('macro4')}</button>
                        </div>
                    </div>

                    <div style={{ padding: "20px", backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333", flex: 1 }}>
                        <h3 style={{ marginTop: 0, fontSize: "14px", color: "#888", textTransform: "uppercase" }}>{t('soundProcessor')}</h3>

                        <div style={{ margin: "20px 0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span>{t('masterLevel')}</span>
                                <span style={{ color: "#2196F3", fontWeight: "bold" }}>{status.hardware?.sound?.level?.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="10" step="0.1"
                                value={status.hardware?.sound?.level || 7.0}
                                onChange={(e) => controlHardware("sound", "level", e.target.value)}
                                style={{ width: "100%", cursor: "pointer" }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "15px 0", padding: "10px", backgroundColor: "#121212", borderRadius: "4px" }}>
                            <span>{t('mute')}</span>
                            <button
                                onClick={() => controlHardware("sound", "mute", !status.hardware?.sound?.mute)}
                                style={{
                                    padding: "5px 15px",
                                    backgroundColor: status.hardware?.sound?.mute ? "#f44336" : "#333",
                                    color: "white", border: "none", borderRadius: "15px", cursor: "pointer",
                                    transition: "background-color 0.3s"
                                }}
                            >
                                {status.hardware?.sound?.mute ? t('muted') : t('unmuted')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
