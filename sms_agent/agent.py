import socket
import os
import subprocess
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import threading

# Configuration
IPC_SOCKET_PATH = "/tmp/dcpplayer.sock"
PLAYER_BIN = "../src/dcpplayer/build/dcpplayer"

app = FastAPI(title="SMS Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PlayRequest(BaseModel):
    dcp_path: str
    audio_dev: int = 0
    display_dev: int = 0

class PlaylistRequest(BaseModel):
    dcps: list[str]
    audio_dev: int = 0
    display_dev: int = 0

class SMSAgent:
    def __init__(self):
        self.player_process = None
        self.current_dcp = None
        self.status = "IDLE"
        self.playlist = []
        self.playlist_index = 0
        self.playlist_active = False
        self.worker_thread = threading.Thread(target=self._playlist_worker, daemon=True)
        self.worker_thread.start()
        
        # Simulated Hardware State
        self.hardware = {
            "projector": {"lamp": False, "douser": False},
            "sound": {"level": 7.0, "mute": False}
        }

    def _playlist_worker(self):
        while True:
            if self.playlist_active and self.status == "IDLE":
                if self.playlist_index < len(self.playlist):
                    dcp = self.playlist[self.playlist_index]
                    print(f"Playlist: Playing item {self.playlist_index + 1}/{len(self.playlist)}: {dcp}")
                    if self.start_player(dcp):
                        # Wait for it to start
                        time.sleep(1)
                    else:
                        print(f"Playlist: Failed to play {dcp}, skipping...")
                        self.playlist_index += 1
                else:
                    print("Playlist finished")
                    self.playlist_active = False
                    self.playlist = []
                    self.playlist_index = 0
            
            # Check if player finished
            if self.status == "PLAYING" and self.player_process:
                if self.player_process.poll() is not None:
                    print("Player process finished")
                    self.status = "IDLE"
                    self.current_dcp = None
                    if self.playlist_active:
                        self.playlist_index += 1
            
            time.sleep(0.5)

    def start_playlist(self, dcps, audio_dev=0, display_dev=0):
        self.stop_player()
        self.playlist = dcps
        self.playlist_index = 0
        self.playlist_active = True
        return True

    def start_player(self, dcp_path, audio_dev=0, display_dev=0):
        if self.player_process and self.player_process.poll() is None:
            return False

        env = os.environ.copy()
        # env["SDL_VIDEODRIVER"] = "dummy"  # Commented out to enable video
        env["DISPLAY"] = ":1"  # Use X1 display socket 
        env["SDL_AUDIODRIVER"] = "pulseaudio"  # Force PulseAudio
        env["PULSE_PROP_media.role"] = "music"  # Set audio role

        cmd = [PLAYER_BIN, "--headless", dcp_path, "-a", str(audio_dev), "-d", str(display_dev)]
        print(f"Starting player: {' '.join(cmd)}")
        print(f"Audio device: {audio_dev}, Display device: {display_dev}")
        
        try:
            self.player_process = subprocess.Popen(
                cmd, 
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.current_dcp = dcp_path
            self.status = "PLAYING"
            return True
        except Exception as e:
            print(f"Failed to start player: {e}")
            self.status = "ERROR"
            return False

    def send_ipc_command(self, command):
        try:
            client_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            client_socket.connect(IPC_SOCKET_PATH)
            client_socket.sendall(command.encode())
            
            # Read response
            response = client_socket.recv(1024).decode()
            client_socket.close()
            return response
        except Exception as e:
            print(f"IPC Error ({command}): {e}")
            return None

    def stop_player(self):
        self.playlist_active = False # Stop playlist
        if not self.player_process or self.player_process.poll() is not None:
            self.status = "IDLE"
            return True

        if self.send_ipc_command("STOP"):
            try:
                self.player_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.player_process.kill()
            
            self.status = "IDLE"
            self.current_dcp = None
            return True
        else:
            # Force kill if IPC fails
            if self.player_process:
                self.player_process.kill()
                try:
                    self.player_process.wait(timeout=1)
                except:
                    pass
            self.status = "IDLE" # Reset to IDLE even if we killed it
            self.current_dcp = None
            return True # Return True because we forced it to stop

    def pause_player(self):
        if self.status != "PLAYING": return False
        if self.send_ipc_command("PAUSE") == "OK":
            self.status = "PAUSED"
            return True
        return False

    def resume_player(self):
        if self.status != "PAUSED": return False
        if self.send_ipc_command("RESUME") == "OK":
            self.status = "PLAYING"
            return True
        return False

    def get_progress(self):
        if self.status not in ["PLAYING", "PAUSED"]:
            return {"current": 0, "total": 0}
        
        resp = self.send_ipc_command("PROGRESS")
        if resp:
            try:
                curr, total = map(int, resp.split('/'))
                return {"current": curr, "total": total}
            except:
                pass
        return {"current": 0, "total": 0}

    def get_status(self):
        progress = self.get_progress()
        return {
            "status": self.status,
            "current_dcp": self.current_dcp,
            "playlist_active": self.playlist_active,
            "playlist_index": self.playlist_index,
            "playlist_total": len(self.playlist),
            "progress": progress,
            "hardware": self.hardware
        }

agent = SMSAgent()

@app.get("/status")
def get_status():
    return agent.get_status()

@app.post("/play")
def play_dcp(req: PlayRequest):
    agent.playlist_active = False # Manual play stops playlist
    
    # If player is already running, stop it first to restart
    if agent.player_process and agent.player_process.poll() is None:
        print("Player already running, stopping it first...")
        agent.stop_player()

    if agent.start_player(req.dcp_path, req.audio_dev, req.display_dev):
        return {"result": "ok", "status": "PLAYING"}
    else:
        raise HTTPException(status_code=500, detail="Failed to start player")

@app.post("/playlist/start")
def start_playlist(req: PlaylistRequest):
    if agent.start_playlist(req.dcps, req.audio_dev, req.display_dev):
        return {"result": "ok", "status": "PLAYLIST_STARTED"}
    else:
        raise HTTPException(status_code=500, detail="Failed to start playlist")

@app.post("/stop")
def stop_player():
    if agent.stop_player():
        return {"result": "ok", "status": "IDLE"}
    else:
        raise HTTPException(status_code=500, detail="Failed to stop player")

@app.post("/pause")
def pause_player():
    if agent.pause_player():
        return {"result": "ok", "status": "PAUSED"}
    else:
        raise HTTPException(status_code=500, detail="Failed to pause player")

@app.post("/resume")
def resume_player():
    if agent.resume_player():
        return {"result": "ok", "status": "PLAYING"}
    else:
        raise HTTPException(status_code=500, detail="Failed to resume player")

class HardwareRequest(BaseModel):
    component: str
    action: str
    value: float | bool | None = None

@app.post("/hardware")
def control_hardware(req: HardwareRequest):
    if req.component == "projector":
        if req.action == "lamp":
            agent.hardware["projector"]["lamp"] = bool(req.value)
        elif req.action == "douser":
            agent.hardware["projector"]["douser"] = bool(req.value)
    elif req.component == "sound":
        if req.action == "level":
            agent.hardware["sound"]["level"] = float(req.value)
        elif req.action == "mute":
            agent.hardware["sound"]["mute"] = bool(req.value)
    return {"result": "ok", "hardware": agent.hardware}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8088)
