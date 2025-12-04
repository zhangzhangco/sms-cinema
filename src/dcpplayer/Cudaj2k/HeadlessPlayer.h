#pragma once

#include "CPlayer.h"
#include "CommandOptions.h"
#include "CDcpParse.h"
#include <thread>
#include <atomic>
#include <string>
#include <vector>

class HeadlessPlayer
{
public:
    HeadlessPlayer();
    ~HeadlessPlayer();

    // Initialize the player with DCP path and options
    bool Init(const std::string& dcpPath, int audioDevice, int displayIndex);

    // Start the playback loop (blocking or non-blocking based on implementation)
    void Run();

    // Stop the player
    void Stop();

    // IPC Command Handlers
    void Play();
    void Pause();
    void Seek(int frame);
    
    bool IsRunning() const { return m_isRunning; }

private:
    void CommandListenerThread(); // Thread to listen for IPC commands

    std::string m_dcpPath;
    int m_audioDevice;
    int m_displayIndex;
    
    CPlayer* m_pPlayer;
    CDcpParse* m_pDcpParse;
    CommandOptions* m_pOptions;
    Kumu::FileReaderFactory m_Factory; // Persistent factory
    
    std::thread* m_pListenerThread;
    std::atomic<bool> m_isRunning;
    std::atomic<bool> m_shouldStop;
};
