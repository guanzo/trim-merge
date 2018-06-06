# Trim-Merge

Trim and - you guessed it - merge videos. There are a ton of tools out there that can trim and merge, so why use this? <nobr>Trim-merge</nobr> is focused, lightweight, and dead simple. 

1. Download trim-merge and ffmpeg if you don't already have it.

// TODO :)

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

### But seriously, why should I use this?

All media editing tools can trim and merge videos, but they often times have lots of other features as well. If all you care about is trim/merge, these other features can get in the way. The GUI's are cluttered with buttons, menus, and widgets, causing you dig through the documentation or google for help. Trim-merge is focused solely on trimming and merging video.

If you need to trim a video multiple times, doing that with a GUI can be slow and repetitive. With trim-merge you define all your trim timestamps in a text file. This allows you to bypass the GUI and move as fast as you can with the keyboard, mouse, and good ole ```Ctrl + C```.

You might be thinking, "But guanzo, ffmpeg is much more powerful and i can automate ffmpeg commands with a script!". 

...

:thumbsup: