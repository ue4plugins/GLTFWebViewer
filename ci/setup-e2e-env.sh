#!/bin/bash

echo "fs.inotify.max_user_watches=1048576" >> /etc/sysctl.conf
sysctl -p
Xvfb -ac :99 -screen 0 1280x1024x16 > /dev/null 2>&1 &
