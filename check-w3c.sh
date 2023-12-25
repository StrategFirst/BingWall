#!/bin/bash

wget --quiet https://github.com/validator/validator/releases/download/latest/vnu.jar
if [ "$?" -ne "0" ]
then
	exit 1
fi

java -jar vnu.jar $(find web/ -name "*.html") --css web/style/
rc=$?

rm -rf vnu.jar

exit $rc
