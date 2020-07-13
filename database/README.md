## MySQL Setup

1. Download [MySQL Community Installer 8.0.20 (offline)](https://dev.mysql.com/downloads/installer/) for Windows x86.
	- Install & choose __Developer Default__ option. All settings remain default.
	- After installation, run MySQL installer again from windows menu
		- Uninstall __Documentation > Samples & Examples__ module.
		- Add __MySQL Server > MySQL Server 8.0 > 8.0.20 (x64)__ module.
		- Configure MySQL Server: port=3306, root password=`your_choice`

2. Download [C++ Redistributable Runtime Installer](https://www.techpowerup.com/download/visual-c-redistributable-runtime-package-all-in-one/)
	- Install only __2015-2019 version (x64 + x86)__ through EXE file.

3. Download [MySQL Workbench Installer 8.0.20](https://dev.mysql.com/downloads/workbench/) for Windows x86/x64.
	- Install & choose __Complete__ option. All settings remain default.

4. Download [MySQL timezone description tables](https://dev.mysql.com/downloads/timezones.html) for 5.7+ POSIX standard.
	- Extract and get a __timezone_posix.sql__ file.
	- Import this SQL file in MySQL Workbench.
	- Test with: `SELECT CURRENT_TIMESTAMP() AS singaporeTime, CONVERT_TZ(CURRENT_TIMESTAMP(),'Asia/Singapore','Europe/Berlin') AS germanyTime;` you should see Singapore time is 6 hours later than Germany.

5. In MySQL Workbench, open [script_database_initialise.sql](./script_database_initialise_crmcti.sql) file.
	- Run all commands in the file.
