---
title: Guide
layout: page
lang: en
description: "How to install and use Wavepick: setup, updating, the search syntax, backup streams, listening and track history, and driving playback from the shell."
permalink: /en/docs/
menu_id: docs
---

# Guide

Wavepick supports macOS and Linux; Windows works through WSL. It requires Python 3.12 or later and [mpv](https://mpv.io/), which plays the audio.

## Installation

The quickest route installs `uv` and `radio`, then tells you how to install mpv when it is missing:

```sh
curl -LsSf https://raw.githubusercontent.com/yueswater/terminal-radio/main/install.sh | sh
```

Or install mpv first and choose a Python tool manager yourself:

```sh
# macOS
brew install mpv

# Ubuntu / Debian
sudo apt update && sudo apt install mpv

uv tool install radiotui-tw
# or
pipx install radiotui-tw
```

Run `radio` to open the terminal interface.

## Updating

Radio checks for a new release at most once a day. Installs managed by `uv tool` or `pipx` can update from the interface, or you can run:

```sh
uv tool upgrade radiotui-tw
# or
pipx upgrade radiotui-tw
```

Set `RADIO_CHECK_FOR_UPDATES=0` to disable update checks entirely.

## Start listening

```sh
radio                              # open the terminal interface
radio ui --no-autoplay             # do not resume at launch
radio play news98                  # play a station directly
radio pause                        # pause
radio resume                       # resume
radio stop                         # stop
radio status --json                # script-friendly state
radio now                          # current station and programme
radio sleep 30                     # stop in 30 minutes
radio --help
```

When the interface is already open, commands from another terminal control that same player instead of starting a second audio stream.

## Keyboard controls

| Key | Action |
| --- | --- |
| `←` `→` | Change tabs |
| `↑` `↓` `j` `k` | Move the cursor |
| `enter` | Play or apply the selected item |
| `space` | Pause or resume |
| `s` | Stop playback |
| `f` | Add or remove a favourite |
| `+` `-` | Change volume |
| `m` | Mute or unmute |
| `t` | Switch theme |
| `w` | Switch English and Traditional Chinese |
| `/` | Search stations |
| `e` `i` | Export or import settings |
| `?` | Open the complete shortcut guide |
| `q` | Fade out and quit |

## Find a station

The interface, CLI and HTTP API share one query language:

```sh
radio stations "genre:news region:taipei"
radio stations "genre:news genre:talk"
radio stations --genre classical --json
```

Filters are `genre:`, `region:`, `lang:`, `network:` and `band:`. Different fields narrow results; repeating one field widens them. Plain text searches frequencies, names and descriptions.

## Interface features

- **Favourites** persist between launches; press `f` on a station.
- **History and statistics** track listening, pauses and interruptions, then chart stations, times and a 14-day trend.
- **Track log** keeps titles announced by stations that publish programme metadata.
- **Backup streams** move through a station's fallback addresses if its primary stream fails.
- **Sleep timer** supports 15, 30, 60 or any custom duration from 1–1440 minutes.
- **Station checks** distinguish online, slow and offline streams.
- **Themes and languages** switch with `t` and `w`, or from Settings.
- **Custom stations** add, edit or delete your own HTTP or HTTPS streams from Settings.

## Export and import

Press `e` to export a `.radio.config` file and `i` to import one. It carries favourites, volume, mute, theme, language, autoplay, reconnect, station checks, animations and custom stations. It does not overwrite listening history.

## HTTP API

```sh
radio api
```

The service defaults to `http://127.0.0.1:8000`; interactive API documentation is at `http://127.0.0.1:8000/docs`. Player state, station search, playback, volume, mute and sleep timers all have endpoints.

## Uninstall

```sh
uv tool uninstall radiotui-tw
# or
pipx uninstall radiotui-tw
```

See the [GitHub README](https://github.com/yueswater/terminal-radio#readme) for every environment variable, configuration format and contributor workflow.
