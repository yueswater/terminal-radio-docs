---
title: 關於拾波
layout: page
lang: zh-TW
description: "拾波是一個為終端機而寫的臺灣廣播播放器。用 Textual 留住簡單的操作，把聲音交給 mpv，讓廣播安靜地陪在工作的一隅。"
permalink: /about/
menu_id: about
---

# 關於拾波

拾波是一個為臺灣廣播聽眾寫的終端機播放器。

FM、AM 電台，選台、搜尋、播放控制、收聽紀錄與統計，都收進一個以鍵盤操作為主的 Textual 介面裡。它不打算取代傳統收音機，也不想成為另一個龐大的音樂播放器；只是提供一種更簡單的方式，讓廣播留在終端機裡。

## 為什麼做成終端機程式

廣播本來就毋需一直盯著畫面——比起再開一個網頁或播放器，直接在終端機裡選台、調音量、設睡眠計時器，反而更順手。

拾波想做的，是讓廣播自然地留在工作的一隅。想聽時，從終端機裡拾起一段電波；專注時，便讓它退到背景，陪著時間往前走。

有時是新聞，有時是音樂，也可能只是一段不知道從哪裡開始的談話。廣播迷人的地方，大概也正在於此：你不必特意尋找什麼，只要打開，就能聽見某個地方此刻正在發生的聲音。

## 技術

拾波以 Python 3.12+ 開發，終端機介面使用 [Textual](https://textual.textualize.io/)，實際的音訊播放則交由 [mpv](https://mpv.io/) 處理。

程式本身不負責解碼各種串流格式，而是專注在選台、狀態管理、搜尋、紀錄與介面；電台資料也獨立於程式碼保存，讓新增或維護電台不必修改播放邏輯。

目前包含：

- Python 3.12+
- [Textual](https://textual.textualize.io/) 終端機介面
- [mpv](https://mpv.io/) 音訊播放
- FastAPI 控制 API
- 44 個內建臺灣 FM／AM 電台
- 繁體中文與英文介面

這個網站使用 Hexo 與 Stellar 建置，配色則取自拾波的預設深色主題，希望從終端機到網頁，都保留同一點安靜而簡單的樣子。

## 專案連結

- [GitHub 原始碼](https://github.com/yueswater/terminal-radio)
- [PyPI 套件](https://pypi.org/project/radiotui-tw/)
- [問題回報](https://github.com/yueswater/terminal-radio/issues)

拾波由 Anthony Sung 開發，並以 MIT License 開放原始碼。