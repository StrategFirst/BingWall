#!/bin/sh

date

if [ -f /var/resources/metadata.json ]
then
	echo "[0/5] - Archiving old ones"
	currentPath=$(pwd)
	cd /var/resources/
	tar -zcf $(date +%F).tgz *.json *.webp && rm *.json *.webp
	cd $currentPath
fi

echo "[1/5] - Download scrapper dependencies"
npm ci

echo "[2/5] - Scrap"
node .

echo "[3/5] - Update daily list"
ls /var/resources/*.webp | sed -e "s/\\/var\\///g" > /var/resources/list.txt 

echo "[4/5] - Monthly list"
archiveList=$(find /var/resources/ -name "*.tgz")
currentPath=$(pwd)
rm /var/monthly-resources/* -rf
cd /var/monthly-resources/
i=0
for archivePath in $archiveList
do
	i=$(expr $i + 1)
	mkdir $i
	cd $i
	tar -zxf $archivePath
	cd ..
done

echo "[5/5] - Update monthly list"
find /var/monthly-resources/ -name "*.webp" | sed -e "s/\\/var\\///g" > /var/monthly-resources/list.txt 

sleep 1d && $0 $@