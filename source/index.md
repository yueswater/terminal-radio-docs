---
title: terminal-radio
layout: page
lang: zh-TW
permalink: /
menu_id: home
---

在終端機裡聽臺灣的 FM 與 AM 廣播。44 個內建電台、Textual 介面、可用 shell 操控，也有一組 HTTP API。

```sh
uv tool install radiotui-tw
radio
```

## 這是什麼

一個給終端機的收音機。選台、聽、看它現在在播什麼，全部不用離開鍵盤。

- **44 個內建電台** — 警廣、中廣、ICRT、講客、地方 AM，都已分好類
- **搜尋** — 按 `/`，用 `genre:news region:taipei` 這種語法篩選
- **備援串流** — 主要位址斷了自動換下一個，接上就不再打斷
- **收聽紀錄與統計** — 聽了多久、聽了什麼，終端機裡直接畫圖
- **曲目紀錄** — 有報曲目的電台，聽過什麼都留著
- **shell 操控** — `radio play news98`、`radio status --json`
- **雙語介面** — 繁體中文與英文，按 `w` 切換

## 安裝

需要 [mpv](https://mpv.io/)，聲音是它放的。

```sh
# 一行搞定，連 uv 和 mpv 一起裝
curl -LsSf https://raw.githubusercontent.com/yueswater/terminal-radio/main/install.sh | sh
```

或者自己來：

```sh
uv tool install radiotui-tw   # 或 pipx install radiotui-tw
```

## 用法

```sh
radio                      # 開介面
radio play news98          # 直接播
radio status               # 現在在播什麼
radio now                  # 電台和曲目
radio stations "genre:news region:taipei"
```

完整說明在 [GitHub](https://github.com/yueswater/terminal-radio)。

---

[English](/en/)
