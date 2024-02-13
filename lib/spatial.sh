#!/bin/bash

cd ~/workspace/spatial-media

# Specify the directory where your files are located
directory="D:\Porn\VR"

# Iterate over files in the directory
for filepath in "$directory"/*; do
    if [ -f "$filepath" ]; then
        # Run the command for each file
        filename=$(basename "$filepath")
        extension="${filepath##*.}"

        if [[ "$extension" != "mp4" ]]; then
            continue
        fi

        outPath="$directory/spatial/$filename"

        if [ ! -f "$outPath" ]; then
            python spatialmedia -i --stereo=left-right "$filepath" "$outPath"
        fi
    fi
done
