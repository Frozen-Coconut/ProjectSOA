@echo off
echo Initializing database...
cmd.exe /c npx sequelize-cli db:create
cmd.exe /c npx sequelize-cli db:migrate:undo:all
cmd.exe /c npx sequelize-cli db:migrate
cmd.exe /c npx sequelize-cli db:seed:all
echo Database initialized!
