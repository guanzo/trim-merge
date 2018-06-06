# Trim-Merge

Trim and - you guessed it - merge videos. There are a ton of tools out there that can trim and merge, so why use this? Trim-merge is lightweight and dead simple. 

1. Download trim-merge and ffmpeg if you don't already have it.
2. Create a config.yml file that describes your inputs and outputs.

```yaml
# config.yml

clips:
  - input: video.mp4
    output: merged.mp4
    clips:
      - time: 00:05-00:10
      - time: 00:15-00:20
```

```
# Example directory:

/Videos
  -config.yml
  -video.mp4
```
3. Run trim-merge.

```
$ cd /Videos
$ trim-merge
```


```
# Example directory:

/Videos
    -config.yml
    -merged.mp4
    -video.mp4
```

NOTE: trim-merge requires ffmpeg to be installed and available as a PATH variable.