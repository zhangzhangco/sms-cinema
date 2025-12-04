#include "HeadlessPlayer.h"
#include <iostream>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/un.h>

#define IPC_SOCKET_PATH "/tmp/freedcpplayer.sock"

HeadlessPlayer::HeadlessPlayer()
    : m_pPlayer(nullptr), m_pDcpParse(nullptr), m_pOptions(nullptr), 
      m_pListenerThread(nullptr), m_isRunning(false), m_shouldStop(false)
{
}

HeadlessPlayer::~HeadlessPlayer()
{
    Stop();
    if (m_pPlayer) delete m_pPlayer;
    if (m_pDcpParse) delete m_pDcpParse;
    if (m_pOptions) delete m_pOptions;
}

bool HeadlessPlayer::Init(const std::string& dcpPath, int audioDevice, int displayIndex)
{
    m_dcpPath = dcpPath;
    m_audioDevice = audioDevice;
    m_displayIndex = displayIndex;

    // Simulate CommandOptions initialization
    // In a real implementation, we might need to refactor CommandOptions to not rely on argc/argv
    // For now, we'll construct it manually or modify CommandOptions to be more flexible.
    // Since CommandOptions takes argc/argv, we might need to fake them or add a new constructor.
    // Let's assume we can modify CommandOptions or just pass necessary values to CPlayer directly if possible.
    // But CPlayer takes CommandOptions&.
    
    // For this MVP, let's create a fake argv
    std::vector<std::string> args;
    args.push_back("freedcpplayer");
    args.push_back(dcpPath);
    args.push_back("-a");
    args.push_back(std::to_string(audioDevice));
    args.push_back("-d");
    args.push_back(std::to_string(displayIndex));
    
    std::vector<const char*> argv;
    for (const auto& arg : args) argv.push_back(arg.c_str());
    
    m_pOptions = new CommandOptions(argv.size(), argv.data());
    
    if (m_pOptions->error_flag) {
        std::cerr << "Error parsing options" << std::endl;
        return false;
    }

    m_pDcpParse = new CDcpParse(m_pOptions->verbose_flag);
    std::vector<std::string> mxfFiles;
    m_pDcpParse->ParseDCP(mxfFiles, m_dcpPath.c_str());

    if (!m_pDcpParse->VideoOk || !m_pDcpParse->SoundOk) {
        std::cerr << "DCP Parse failed: Video or Sound not OK" << std::endl;
        return false;
    }

    // Initialize CPlayer
    // Kumu::FileReaderFactory defaultFactory; // Removed local variable
    fs::path fullPath = fs::current_path(); // Or pass the correct path
    m_pPlayer = new CPlayer(*m_pOptions, m_Factory, fullPath);
    
    if (!m_pPlayer->SelectAudioDeviceInitAudio()) {
        std::cerr << "Audio device init failed" << std::endl;
        return false;
    }

    return true;
}

void HeadlessPlayer::Run()
{
    m_isRunning = true;
    
    // Start IPC listener - MOVED DOWN
    // m_pListenerThread = new std::thread(&HeadlessPlayer::CommandListenerThread, this);

    // Main Playback Loop
    // We need to adapt the loop from freedcpplayer.cpp
    // For now, we'll just do a simplified version to prove the concept
    
    int cplIndex = m_pOptions->NumCpl;
    if (m_pDcpParse->CplVector.size() <= cplIndex) return;

    // Init Readers for the first reel
    Result_t result = m_pPlayer->InitialisationReaders(*m_pDcpParse, true, m_pDcpParse->CplVector[cplIndex]->VecReel[0]);
    
    if (ASDCP_SUCCESS(result)) {
        result = m_pPlayer->InitialisationJ2K();
    } else {
    }
    
    if (ASDCP_SUCCESS(result)) {
        
        // Start IPC listener AFTER initialization
        m_pListenerThread = new std::thread(&HeadlessPlayer::CommandListenerThread, this);

        // This MainLoop is currently blocking and handles SDL events internally.
        // We will need to modify CPlayer::MainLoop to be non-blocking or controllable.
        // For Phase 1, we'll call it as is, but we need to ensure we can interrupt it.
        m_pPlayer->MainLoop(false); // false = don't pause after first frame 
    } else {
    }

    m_pPlayer->EndAndClear(true);
    m_isRunning = false;
    
    if (m_pListenerThread && m_pListenerThread->joinable()) {
        m_pListenerThread->join();
        delete m_pListenerThread;
        m_pListenerThread = nullptr;
    }
}

void HeadlessPlayer::Stop()
{
    m_shouldStop = true;
    if (m_pPlayer) {
        m_pPlayer->OutEscape = true; // Signal CPlayer to exit loop
    }
}

void HeadlessPlayer::CommandListenerThread()
{
    int server_fd, client_fd;
    struct sockaddr_un address;
    
    // Create socket
    if ((server_fd = socket(AF_UNIX, SOCK_STREAM, 0)) == 0) {
        perror("socket failed");
        return;
    }
    
    address.sun_family = AF_UNIX;
    strncpy(address.sun_path, IPC_SOCKET_PATH, sizeof(address.sun_path)-1);
    unlink(IPC_SOCKET_PATH); // Remove previous socket
    
    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind failed");
        return;
    }
    
    if (listen(server_fd, 3) < 0) {
        perror("listen");
        return;
    }
    
    std::cout << "IPC Listener started on " << IPC_SOCKET_PATH << std::endl;

    while (m_isRunning && !m_shouldStop) {
        // Accept connection (blocking, need to handle non-blocking or select for clean exit)
        // For MVP, simple blocking accept
        client_fd = accept(server_fd, NULL, NULL);
        if (client_fd < 0) continue;
        
        char buffer[1024] = {0};
        read(client_fd, buffer, 1024);
        std::string command(buffer);
        
        std::cout << "Received command: " << command << std::endl;
        
        if (command == "STOP") {
            Stop();
            const char* response = "OK";
            send(client_fd, response, strlen(response), 0);
        } else if (command == "PAUSE") {
             if (m_pPlayer) {
                 m_pPlayer->NextState = PAUSE;
                 m_pPlayer->RestartLoop = true;
                 const char* response = "OK";
                 send(client_fd, response, strlen(response), 0);
             }
        } else if (command == "RESUME") {
             if (m_pPlayer) {
                 m_pPlayer->NextState = PLAY;
                 m_pPlayer->RestartLoop = true;
                 const char* response = "OK";
                 send(client_fd, response, strlen(response), 0);
             }
        } else if (command == "PROGRESS") {
             if (m_pPlayer) {
                 std::string response = std::to_string(m_pPlayer->CurrentFrameNumber) + "/" + std::to_string(m_pPlayer->frame_count);
                 send(client_fd, response.c_str(), response.length(), 0);
             } else {
                 const char* response = "0/0";
                 send(client_fd, response, strlen(response), 0);
             }
        }
        
        close(client_fd);
    }
    
    close(server_fd);
    unlink(IPC_SOCKET_PATH);
}
