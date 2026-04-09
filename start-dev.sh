#!/bin/bash
# Start Bruno in dev mode
# Unset VS Code's env variables that interfere with Electron
unset ELECTRON_RUN_AS_NODE
unset ELECTRON_NO_ATTACH_CONSOLE
unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use

npm run dev
