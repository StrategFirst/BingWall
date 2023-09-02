#!/bin/bash

runs=$(curl --silent "https://github.com/StrategFirst/BingWall/actions/workflows/daily-scrap.yml" \
	| egrep -o 'href="/StrategFirst/BingWall/actions/runs/[0-9]+' \
	| sed -e 's/href="/github.com/g' )


for run_url in $runs; do
	curl -L --silent \
		-H "Authorization: Bearer $1" \
		"https://$run_url" \
	  | egrep -o 'href="/StrategFirst/BingWall/suites/[0-9]+/artifacts/[0-9]+"' \
	  | sed -e 's/href="/github.com/g' )
	# aria-label="Download TodaysPicture">
done
