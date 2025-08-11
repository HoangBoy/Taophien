@echo off
cd /d %~dp0
title Tool mo Chrome tu dong

echo.
echo ==== BAT DAU CHAY TOOL ====
echo.

REM ===== 1. Kiem tra va cai Node.js neu chua co =====
where node >nul 2>&1
IF ERRORLEVEL 1 (
    echo Node.js chua duoc cai. Dang tai ve va cai dat...
    powershell -Command "Invoke-WebRequest https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi -OutFile nodejs_installer.msi"
    msiexec /i nodejs_installer.msi /quiet /norestart
    del nodejs_installer.msi
    echo Hoan tat cai Node.js.
    REM Sau khi cai xong, can load lai PATH
    setx PATH "%PATH%;%ProgramFiles%\nodejs"
) ELSE (
    echo Node.js da duoc cai.
)

REM ===== 2. Kiem tra package.json =====
IF NOT EXIST package.json (
    echo Dang tao package.json...
    call npm init -y
)

REM ===== 3. Kiem tra selenium-webdriver =====
call npm list selenium-webdriver >nul 2>&1
IF ERRORLEVEL 1 (
    echo Dang cai selenium-webdriver...
    call npm install selenium-webdriver
) ELSE (
    echo selenium-webdriver da duoc cai.
)

REM ===== 4. Kiem tra chromedriver =====
call npm list chromedriver >nul 2>&1
IF ERRORLEVEL 1 (
    echo Dang cai chromedriver...
    call npm install chromedriver
) ELSE (
    echo chromedriver da duoc cai.
)

REM ===== 5. Kiem tra file open-chrome.js =====
IF NOT EXIST open-chrome.js (
    echo Khong tim thay file open-chrome.js
    goto :END
)

REM ===== 6. Chay open-chrome.js =====
echo.
echo Dang chay open-chrome.js...
echo ==================================
call node open-chrome.js
echo ==================================

:END
echo.
echo Hoan tat.
pause >nul
