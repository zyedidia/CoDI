#!/usr/bin/env bash

mkdir CoDI.app
mkdir CoDI.app/Contents
mkdir CoDI.app/Contents/MacOS
mkdir CoDI.app/Contents/Resources

cp .codi-app.sh CoDI.app/Contents/MacOS/codi
chmod +x CoDI.app/Contents/MacOS/codi
cp -r src CoDI.app/Contents/Resources/

mv CoDI.app/Contents/Resources/src/.release.json CoDI.app/Contents/Resources/src/package.json
rm CoDI.app/Contents/Resources/src/.debug.json
