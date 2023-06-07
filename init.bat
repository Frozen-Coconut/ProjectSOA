@echo off
setlocal
set NODE_ENV=development
for /f "tokens=*" %%i in ('type .env') do set %%i
echo Initializing database...
cmd.exe /c npx sequelize-cli db:create
cmd.exe /c npx sequelize-cli db:migrate:undo:all
cmd.exe /c npx sequelize-cli db:migrate
if not %NODE_ENV%==production cmd.exe /c npx sequelize-cli db:seed:all
echo Database initialized!
endlocal
