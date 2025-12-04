# 🎬 GPU SMS Experiment

> **Next-Gen Cinema Playback System powered by NVIDIA GPUs.**
> *An experimental project exploring the limits of software-based DCP playback.*

![SMS Console Screenshot](screenshot.jpeg?v=2)

## ⚡️ What is this?

This is a **GPU-accelerated Screen Management System (SMS)** experiment.
We are ditching traditional CPU decoding for the raw power of **NVIDIA Pascal+ GPUs**.

**The Goal:** Real-time 4K DCP playback, buttery smooth performance, and a modern web-based control interface.

## 🚀 Cool Stuff

*   **GPU Native**: Uses `nvJPEG2000` for blazing fast decoding.
*   **4K Ready**: Plays high-bitrate content without breaking a sweat.
*   **Modern UI**: React + Vite frontend. Dark mode by default.
*   **Web Control**: Control your cinema screen from any browser.

## 🛠️ Quick Start

### 1. The Brain (Agent)
```bash
cd sms_agent
pip install fastapi uvicorn pydantic
python agent.py
```

### 2. The Face (Frontend)
```bash
cd sms_frontend
npm install
npm run dev
```

Visit `http://localhost:5173` and start the show.

## 🏗️ Architecture

*   **Core**: C++ Player + NVIDIA nvJPEG2000 + ASDCP + SDL2
*   **Agent**: Python FastAPI
*   **UI**: React 19

## ⚠️ Disclaimer

This is an **experimental** project. It's fast, it's cool, but don't run your IMAX premiere on it just yet.

---
*Built with ❤️ and C++*
