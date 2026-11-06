@echo off
cd /d "%~dp0"
title coupang-review dev (3002)

if not exist node_modules (
  echo Installing packages...
  call npm install
)

echo Starting dev server at http://localhost:3002
call npm run dev -- -p 3002
pause
