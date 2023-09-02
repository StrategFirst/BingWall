#!/bin/bash

GITHUB_TOKEN=$1

artifactURLs=$(\
  curl \
    --silent \
    --location \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/StrategFirst/BingWall/actions/artifacts?name=TodaysPicture \
  | grep archive_download_url \
  | grep -E -o 'https:[^"]+/zip'
  )

i=0
mkdir MonthlyPictures tmp
for artifactURL in $artifactURLs
do
	i=$(expr $i + 1)
	curl \
	  --silent \
	  --location \
	  --output tmp.zip \
	  -H "Authorization: Bearer $GITHUB_TOKEN" \
	  $artifactURL

	unzip tmp.zip -d tmp/ 2> /dev/null
	mkdir MonthlyPictures/$i
	mv tmp/* MonthlyPictures/$i/
	rm tmp/.gitignore
	rm tmp.zip
done
rm -r tmp
