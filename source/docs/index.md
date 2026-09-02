---
title: 使用教學
layout: page
lang: zh-TW
description: "從安裝到日常使用的完整說明：怎麼裝、怎麼更新、搜尋電台的語法、備援串流、收聽紀錄與曲目紀錄，以及在指令列操控播放。"
permalink: /docs/
menu_id: docs
---

# 使用教學

terminal-radio 支援 macOS 與 Linux；Windows 可透過 WSL 使用。需要 Python 3.12 以上與 [mpv](https://mpv.io/)，實際的聲音由 mpv 播放。

## 安裝

最快的方式會一併安裝 `uv` 與 `radio`，並在缺少 mpv 時提示安裝方式：

```sh
curl -LsSf https://raw.githubusercontent.com/yueswater/terminal-radio/main/install.sh | sh
```

也可以先安裝 mpv，再自行選擇套件管理工具：

```sh
# macOS
brew install mpv

# Ubuntu / Debian
sudo apt update && sudo apt install mpv

uv tool install radiotui-tw
# 或
pipx install radiotui-tw
```

完成後執行 `radio` 開啟終端機介面。

## 更新

程式每天最多檢查一次新版本。若使用 `uv tool` 或 `pipx` 安裝，介面會在有新版時提供直接更新；也可以手動執行：

```sh
uv tool upgrade radiotui-tw
# 或
pipx upgrade radiotui-tw
```

設定 `RADIO_CHECK_FOR_UPDATES=0` 可完全停用更新檢查。

## 開始播放

```sh
radio                              # 開啟終端機介面
radio ui --no-autoplay             # 啟動時不續播上次電台
radio play news98                  # 直接播放指定電台
radio pause                        # 暫停
radio resume                       # 繼續
radio stop                         # 停止
radio status --json                # 取得適合腳本使用的狀態
radio now                          # 目前電台與節目名稱
radio sleep 30                     # 30 分鐘後停止
radio --help
```

當介面已經開啟，另一個終端機中的控制指令會操控同一個播放器，不會再開第二條音訊串流。

## 鍵盤操作

| 按鍵 | 功能 |
| --- | --- |
| `←` `→` | 切換分頁 |
| `↑` `↓` `j` `k` | 移動游標 |
| `enter` | 播放或套用選取項目 |
| `space` | 暫停或繼續 |
| `s` | 停止播放 |
| `f` | 加入或移除最愛 |
| `+` `-` | 調整音量 |
| `m` | 靜音或取消靜音 |
| `t` | 切換主題 |
| `w` | 切換繁體中文與英文 |
| `/` | 搜尋電台 |
| `e` `i` | 匯出／匯入設定 |
| `?` | 顯示完整快捷鍵說明 |
| `q` | 淡出音訊並離開 |

## 搜尋與選台

介面、CLI 與 HTTP API 使用同一套搜尋語法：

```sh
radio stations "genre:news region:taipei"
radio stations "genre:news genre:talk"
radio stations --genre classical --json
```

可用的篩選器是 `genre:`、`region:`、`lang:`、`network:` 與 `band:`。不同欄位會縮小結果；重複同一欄位則會擴大結果。沒有欄位名稱的文字會搜尋頻率、名稱與描述。

## 介面功能

- **最愛**：在電台上按 `f`，最愛清單會保留在下次啟動。
- **收聽紀錄與統計**：記錄播放、暫停與中斷時間，並顯示常聽電台、時段與 14 天趨勢。
- **曲目紀錄**：支援節目資訊的電台會把播過的標題保存在 Tracks 分頁。
- **備援串流**：主要串流失效時，依序切換電台設定中的備援位址。
- **睡眠計時器**：可選 15、30、60 分鐘或 1–1440 分鐘的自訂時間。
- **電台健康檢查**：辨識在線、速度緩慢或離線的串流。
- **主題與語言**：按 `t` 或 `w` 快速切換，也可以在 Settings 調整。
- **自訂電台**：從 Settings 新增、編輯或刪除自己的 HTTP／HTTPS 串流。

## 匯出與匯入

按 `e` 匯出 `.radio.config`，按 `i` 匯入。檔案包含最愛、音量、靜音、主題、語言、自動播放、自動重連、電台檢查、動畫與自訂電台；收聽紀錄不會被覆蓋。

## HTTP API

```sh
radio api
```

服務預設位於 `http://127.0.0.1:8000`，互動式 API 文件在 `http://127.0.0.1:8000/docs`。播放器狀態、電台搜尋、播放、暫停、音量、靜音與睡眠計時器都有對應端點。

## 移除

```sh
uv tool uninstall radiotui-tw
# 或
pipx uninstall radiotui-tw
```

更完整的環境變數、設定檔格式與開發方式請參閱 [GitHub README](https://github.com/yueswater/terminal-radio#readme)。
