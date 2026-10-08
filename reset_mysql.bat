@echo off
echo =========================================
echo SkillSwap MySQL Password Reset Tool
echo =========================================
echo.
echo 1. Stopping MySQL service (MySQL80)...
net stop MySQL80

echo.
echo 2. Creating password reset file...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'skillswap123'; > C:\mysql-init.txt

echo.
echo 3. Resetting password in the background...
start "MySQL Password Reset" "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file=C:\mysql-init.txt --console
echo Waiting 15 seconds for the reset to complete...
timeout /t 15 /nobreak

echo.
echo 4. Closing the temporary reset server...
taskkill /IM mysqld.exe /F

echo.
echo 5. Restarting normal MySQL service...
net start MySQL80

echo.
echo Cleaning up temporary files...
del C:\mysql-init.txt

echo.
echo =========================================
echo SUCCESS! Your password is now: skillswap123
echo You can close this window and run 'npm run dev'
echo =========================================
pause
