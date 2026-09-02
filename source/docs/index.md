---
title: 使用教學
layout: page
lang: zh-TW
description: "從安裝到日常使用：安裝與更新拾波、搜尋與切換電台、備援串流、收聽與曲目紀錄，以及使用 CLI 控制播放器。"
permalink: /docs/
menu_id: docs
---

# 使用教學

拾波支援 macOS 與 Linux，Windows 可透過 WSL 使用。需要 Python 3.12 以上與 [mpv](https://mpv.io/)；介面與播放狀態由拾波管理，實際的音訊播放則交給 mpv。

## 安裝

最快的方式是直接執行安裝腳本：

```sh
curl -LsSf https://raw.githubusercontent.com/yueswater/terminal-radio/main/install.sh | sh
```

安裝腳本會在需要時安裝 `uv` 與 `radio`，並在系統找不到 mpv 時提示對應的安裝方式。

也可以自行安裝：

```sh
# macOS
brew install mpv

# Ubuntu / Debian
sudo apt update
sudo apt install mpv
```

接著使用 `uv`：

```sh
uv tool install radiotui-tw
```

或 `pipx`：

```sh
pipx install radiotui-tw
```

完成後直接執行：

```sh
radio
```

即可開啟拾波的終端機介面。

## 更新

拾波每天最多檢查一次是否有新版本。若透過 `uv tool` 或 `pipx` 安裝，有新版時可以直接從介面更新。

也可以手動執行：

```sh
uv tool upgrade radiotui-tw
```

或：

```sh
pipx upgrade radiotui-tw
```

若不希望拾波檢查更新，可設定：

```sh
RADIO_CHECK_FOR_UPDATES=0
```

## 開始播放

直接執行 `radio` 會開啟完整的終端機介面：

```sh
radio
```

也可以完全不進入 TUI，直接從指令列控制播放器：

```sh
radio ui --no-autoplay    # 啟動介面，但不續播上次的電台

radio play news98         # 播放 News98
radio pause               # 暫停
radio resume              # 繼續播放
radio stop                # 停止

radio status              # 查看目前播放狀態
radio status --json       # 以 JSON 輸出，適合 shell script 使用
radio now                 # 顯示目前電台與節目名稱

radio sleep 30            # 30 分鐘後停止播放

radio --help
```

當拾波已經在另一個終端機中執行時，這些控制指令會連到同一個播放器，不會另外建立第二條音訊串流。

## 鍵盤操作

| 按鍵              | 功能           |
| --------------- | ------------ |
| `←` `→`         | 切換分頁         |
| `↑` `↓` `j` `k` | 移動游標         |
| `enter`         | 播放或套用目前選取的項目 |
| `space`         | 暫停或繼續播放      |
| `s`             | 停止播放         |
| `f`             | 加入或移除最愛      |
| `+` `-`         | 調整音量         |
| `m`             | 靜音或取消靜音      |
| `t`             | 切換主題         |
| `w`             | 切換繁體中文與英文    |
| `/`             | 搜尋電台         |
| `e`             | 匯出設定         |
| `i`             | 匯入設定         |
| `?`             | 顯示完整快捷鍵說明    |
| `q`             | 淡出音訊並離開      |

## 搜尋與選台

拾波的 TUI、CLI 與 HTTP API 共用同一套搜尋規則。

最簡單的方式是直接搜尋名稱、頻率或描述：

```sh
radio stations news98
radio stations 104.9
radio stations 警廣
```

也可以使用欄位篩選：

```sh
radio stations "genre:news region:taipei"

radio stations "genre:news genre:talk"

radio stations --genre classical --json
```

目前可用的篩選欄位包括：

* `genre:`：節目類型
* `region:`：主要服務地區
* `lang:`：語言
* `network:`：所屬廣播網
* `band:`：FM 或 AM

不同欄位會彼此縮小搜尋結果；同一欄位指定多個值時，則會擴大符合範圍。

例如：

```text
genre:news region:taipei
```

表示搜尋**臺北地區的新聞類電台**。

而：

```text
genre:news genre:talk
```

則表示搜尋**新聞或談話類電台**。

沒有加上欄位名稱的文字，會直接搜尋頻率、電台名稱與描述。

## 介面功能

### 最愛

在任一電台上按 `f`，即可加入或移除最愛。最愛清單會保存，下次啟動拾波時仍然存在。

### 收聽紀錄與統計

拾波會記錄每次播放、暫停、重新連線與實際收聽時間，並整理成：

* 最常收聽的電台
* 播放次數
* 活躍天數
* 最近 14 天收聽趨勢
* 星期分布
* 時段分布
* FM／AM 收聽比例

收聽時間不包含暫停與串流中斷的時間。

### 曲目紀錄

若電台串流有提供 ICY 或其他節目 metadata，拾波會顯示目前節目或曲目名稱，並將變化保存在 **Tracks** 分頁。

例如：

```text
19:32  ICRT      Coldplay — Yellow
19:27  ICRT      Dua Lipa — Houdini
19:23  ICRT      Bruno Mars — ...
```

並非所有電台都提供這類資訊，因此部分電台可能只會顯示電台名稱。

### 備援串流

部分電台設有一個以上的串流來源。

主要串流失效時，拾波會依序嘗試備援位址，並配合自動重新連線機制繼續播放。

若目前使用的是備援來源，介面會顯示相應狀態。

### 睡眠計時器

可從 Settings 選擇：

* 15 分鐘
* 30 分鐘
* 60 分鐘
* 自訂 1–1440 分鐘

也可以直接從 CLI 設定：

```sh
radio sleep 30
```

倒數結束後，拾波會停止播放。

### 電台健康檢查

拾波可以檢查各個串流目前是否：

* 在線
* 回應較慢
* 離線

自動檢查結果會暫時快取，也可以從 Settings 手動重新檢查所有電台。

### 主題與語言

按：

```text
t
```

可快速切換主題。

按：

```text
w
```

可在繁體中文與英文介面之間切換。

也可以從 Settings 選擇偏好的主題與語言。

### 自訂電台

除了內建的臺灣 FM／AM 電台，也可以從 Settings 新增自己的網路電台。

自訂電台支援 HTTP 與 HTTPS 串流，可設定：

* 名稱
* 頻率
* FM／AM
* 說明
* 串流網址

自訂內容保存在使用者資料目錄中，更新或重新安裝拾波時不會被覆蓋。

## 匯出與匯入

按 `e` 可以匯出設定，按 `i` 可以匯入。

匯出的檔案副檔名為：

```text
.radio.config
```

其中包含：

* 最愛
* 音量
* 靜音狀態
* 主題
* 語言
* 自動播放
* 自動重新連線
* 電台健康檢查設定
* 動畫設定
* 自訂電台

收聽紀錄與統計資料不會因匯入設定而被覆蓋。

## HTTP API

拾波也提供 FastAPI 控制介面：

```sh
radio api
```

預設服務位址：

```text
http://127.0.0.1:8000
```

互動式 API 文件：

```text
http://127.0.0.1:8000/docs
```

API 可用來：

* 取得電台清單
* 搜尋電台
* 查看播放器狀態
* 播放指定電台
* 暫停與繼續
* 停止播放
* 調整音量
* 靜音
* 設定睡眠計時器
* 查詢收聽紀錄

因此也可以從其他程式、shell script 或區域網路上的裝置控制拾波。

## 移除

若使用 `uv tool` 安裝：

```sh
uv tool uninstall radiotui-tw
```

若使用 `pipx`：

```sh
pipx uninstall radiotui-tw
```

更完整的設定檔格式、環境變數與開發方式，可以參閱 [GitHub README](https://github.com/yueswater/terminal-radio#readme)。