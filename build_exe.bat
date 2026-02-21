@echo off
echo Building SZI Optimization Application...
echo.

pyinstaller --noconfirm --onefile --windowed --add-data "static;static" --collect-all pulp main_window.py

echo.
echo Build finished! The executable is located in the "dist" folder.
pause
