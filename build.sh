#!/bin/bash
ruby build.rb

cd generated/examples

rm *.zip
for D in *; do
    if [ -d "${D}" ]; then
        echo "Making zip for ${D} ..."
	cd $D && zip -r ../$D.zip * && cd ..
    fi
done

echo "DONE"
