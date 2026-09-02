---
title: 關於拾波
layout: page
lang: zh-TW
description: "拾波為什麼長這樣：為終端機而寫的收音機，聲音交給 mpv，介面用 Textual，電台清單與程式碼分開存放。"
permalink: /about/
menu_id: about
---

# 關於拾波

拾波是一個給臺灣廣播聽眾的終端機播放器。它把 FM、AM 電台、播放控制、搜尋、收聽紀錄與統計放進同一個鍵盤優先的 Textual 介面。

## 為什麼做成終端機程式

廣播適合留在背景，而終端機適合快速控制。拾波不需要瀏覽器分頁，也不需要滑鼠；開啟、選台、調整音量與設定睡眠計時器，都能留在原本的工作流程裡。

## 技術

- Python 3.12+
- [Textual](https://textual.textualize.io/) 終端機介面
- [mpv](https://mpv.io/) 音訊播放
- FastAPI 控制 API
- 44 個內建臺灣 FM／AM 電台
- 繁體中文與英文介面

這個網站使用 Hexo 與 Stellar 建置，介面配色取自拾波的預設深色主題。

## 專案連結

- [GitHub 原始碼](https://github.com/yueswater/terminal-radio)
- [PyPI 套件](https://pypi.org/project/radiotui-tw/)
- [問題回報](https://github.com/yueswater/terminal-radio/issues)

拾波由 Anthony Sung 開發，以 MIT License 開放原始碼。
