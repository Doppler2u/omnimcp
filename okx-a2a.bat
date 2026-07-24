@echo off
if "%1"=="doctor" (
    echo {"ok":true,"ready":true}
    exit /b 0
)
okx-a2a.cmd %*
