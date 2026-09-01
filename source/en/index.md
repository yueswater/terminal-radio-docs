---
title: terminal-radio
layout: page
lang: en
menu_id: home
---

Taiwanese FM and AM radio in your terminal. 44 stations built in, a Textual
interface, shell control, and an HTTP API.

```sh
uv tool install radiotui-tw
radio
```

## What it is

A radio for the terminal. Pick a station, listen, see what is on, without
leaving the keyboard.

- **44 stations built in** — police, BCC, ICRT, Hakka, local AM, all classified
- **Search** — press `/`, filter with `genre:news region:taipei`
- **Backup streams** — moves to the next address when one goes quiet, and stays there
- **History and statistics** — how long and what, charted in the terminal
- **Track log** — what the stations announced, for those that announce anything
- **Shell control** — `radio play news98`, `radio status --json`
- **Two languages** — English and Traditional Chinese, `w` switches

## Install

Needs [mpv](https://mpv.io/), which is what actually plays the sound.

```sh
# One line, bringing uv and mpv with it
curl -LsSf https://raw.githubusercontent.com/yueswater/terminal-radio/main/install.sh | sh
```

Or do it yourself:

```sh
uv tool install radiotui-tw   # or pipx install radiotui-tw
```

## Usage

```sh
radio                      # open the interface
radio play news98          # play straight away
radio status               # what is playing
radio now                  # station and title
radio stations "genre:news region:taipei"
```

Full documentation on [GitHub](https://github.com/yueswater/terminal-radio).

---

[繁體中文](/)
