#!/bin/bash

GITHUB_TOKEN=$1

artifactURLs=$(\
  curl \
    --silent \
    --location \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/StrategFirst/BingWall/actions/artifacts?name=DailyPictures \
  | grep archive_download_url \
  | grep -E -o 'https:[^"]+/zip'
  )

function data_dl() {
	artifact_url=$1
	artifact_day=$2

	curl \
	  --silent \
	  --location \
	  --output tmp_$artifact_day.zip \
	  -H "Authorization: Bearer $GITHUB_TOKEN" \
	  $artifact_url

	mkdir MonthlyPictures/$artifact_day/
	unzip tmp_$artifact_day.zip -d MonthlyPictures/$artifact_day/ 2> /dev/null
	rm -rf tmp_$artifact_day.zip
}

i=0
mkdir MonthlyPictures
for artifactURL in $artifactURLs
do
	i=$(expr $i + 1)
	data_dl $artifactURL $i &
done
wait

