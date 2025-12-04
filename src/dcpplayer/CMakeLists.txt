cmake_minimum_required(VERSION 3.7.0)

project(Free_DCP_Player VERSION 0.6.2 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_CUDA_STANDARD 17)
set(CMAKE_CUDA_STANDARD_REQUIRED ON)
set(CMAKE_CUDA_EXTENSIONS OFF)

find_package(SDL2 REQUIRED)

# Prefer pkg-config for SDL2_ttf on Debian/Ubuntu
find_package(PkgConfig REQUIRED)
pkg_check_modules(SDL2_TTF REQUIRED SDL2_ttf)

# libwxgtk3.0-gtk3-dev
find_package(wxWidgets REQUIRED COMPONENTS gl core base net)

include(${wxWidgets_USE_FILE})

# libnvjpeg-dev-12-0
find_package(CUDAToolkit REQUIRED)

# libnvjpeg2k0-dev-cuda-12
find_library(NVJPEG2K_LIB
     NAMES nvjpeg2k
     PATHS ${NVJPEG2K_PATH}/lib64/${CUDAToolkit_VERSION_MAJOR}
     ${NVJPEG2K_PATH}/lib/${CUDAToolkit_VERSION_MAJOR})

   
include_directories(
  ${NVJPEG2K_PATH}/include
  SYSTEM ${CMAKE_CUDA_TOOLKIT_INCLUDE_DIRECTORIES}
  ${SDL2_INCLUDE_DIRS}
  ${SDL2_TTF_INCLUDE_DIRS}
  ${wxWidgets_INCLUDE_DIRS}
)

add_executable(freedcpplayer
  Cudaj2k/CDcpParse.cpp
  Cudaj2k/freedcpplayer.cpp
  Cudaj2k/Run.cpp
  Cudaj2k/RunDcpPlayer_wx.cpp
  Cudaj2k/CPlayer.cpp
  Cudaj2k/pugixml.cpp
  Cudaj2k/RunDcpDlg.cpp
  Cudaj2k/HeadlessPlayer.cpp
)

if(UNIX)
  set(FILESYS -lstdc++fs)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall")
endif()

# https://github.com/cinecert/asdcplib
# Try to locate asdcplib headers and libraries (asdcp, kumu)
find_path(ASDCP_INCLUDE_DIR
  NAMES AS_DCP.h
  PATH_SUFFIXES asdcplib src
  PATHS /usr/local/include /usr/include
)
find_library(ASDCP_LIBRARY NAMES asdcp PATHS /usr/local/lib /usr/local/lib64 /usr/lib /usr/lib64)
find_library(KUMU_LIBRARY  NAMES kumu  PATHS /usr/local/lib /usr/local/lib64 /usr/lib /usr/lib64)

if(NOT ASDCP_INCLUDE_DIR OR NOT ASDCP_LIBRARY OR NOT KUMU_LIBRARY)
  message(STATUS "asdcplib not found: headers at ${ASDCP_INCLUDE_DIR}, libs asdcp=${ASDCP_LIBRARY}, kumu=${KUMU_LIBRARY}")
  message(STATUS "Install asdcplib (kumu, asdcp) and set include/lib paths if needed.")
endif()

if(ASDCP_INCLUDE_DIR)
  include_directories(${ASDCP_INCLUDE_DIR})
endif()

target_link_libraries(freedcpplayer
  ${wxWidgets_LIBRARIES}
  nvjpeg2k
  crypto
  ssl
  pthread
  SDL2
  ${SDL2_TTF_LIBRARIES}
  ${KUMU_LIBRARY}
  ${ASDCP_LIBRARY}
  ${NVJPEG2K_LIB} CUDA::cudart ${FILESYS}
  )

install(TARGETS freedcpplayer)
