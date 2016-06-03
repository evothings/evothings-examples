#!/bin/bash

OUT=$PWD/generated
LIST=$OUT/examples-list.json

rm -rf $OUT
mkdir $OUT

cd examples
printf "[\n" >> $LIST
FIRST=true
for D in *; do
  if [ -d "${D}" ]; then
    cd $D
    if [ -f "evothings.json" ]; then
      echo "Copying $D to $OUT ..."
      cp -a ../$D $OUT/
      echo "Collecting evothings.json ..."
      if [ "$FIRST" = false ] ; then
        printf ",\n" >> $LIST
      fi
      FIRST=false
      cat evothings.json >> $LIST
      echo "Making zip for ${D} ..."
      zip -r $OUT/$D.zip *
    fi
    cd ..
  fi
done
cd ..
printf "]" >> $LIST

echo "DONE"
