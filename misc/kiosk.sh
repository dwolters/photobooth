#!/bin/bash

# Unfortunately JavaScript does not recognize any key as an input key.
# To include not recognized keys as well, map their keycode to another key, i. e., return key. Example:
# xmodmap -e "keycode 117 = Return"

# Avoid that chromium shows a crash notification.
# This is important if you want to restart the photobooth by unplugging the raspberry.
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences

# Start chromium in fullscreen mode
chromium-browser --kiosk http://localhost:8080 &

