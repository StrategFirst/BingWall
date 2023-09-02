#!/bin/sh

echo $(date)
if [ -f /var/resources/metadata.json ]
then
	echo "[0/2] - Archiving old ones"
	currentPath=$(pwd)
	cd /var/resources/
	tar -zcf $(date +%F).tgz *.json *.webp && rm *.json *.webp
	cd $currentPath
fi

echo "[1/2] - Download dependencies"
npm ci

echo "[2/2] - Scrap"
node .

sleep 1d && $0 $@