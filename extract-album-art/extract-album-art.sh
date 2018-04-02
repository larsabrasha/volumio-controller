#!/usr/bin/env bash

MUSIC_DIRECTORY=/Volumes/Data/iTunes/iTunes\ Media/Music

for artist in "${MUSIC_DIRECTORY}"/* ; do
  if [ -d "$artist" ]; then

    for album in "${artist}"/* ; do
        if [ -d "$album" ]; then

            for file in "${album}"/*.m4a "${album}"/*.mp3; do
                if [ -f "$file" ]; then
                    ffmpeg -i "$file" "${album}"/cover.jpg
                    break 1
                fi
            done 
        fi
    done
  fi
done
