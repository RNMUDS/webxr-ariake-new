# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要
武蔵野大学有明キャンパスをA-Frame WebXRで3D可視化するプロジェクト。実際の航空写真とStreet Viewデータを参考に、キャンパスの建物と周辺環境を再現。

## コマンド

### サーバー起動
```bash
node server.js
```
HTTPSサーバーがポート3000で起動。アクセス: https://localhost:3000

### スクリーンショット撮影
```bash
npm run capture:aframe    # A-Frameシーンの撮影
npm run capture:aerial    # Google Maps航空写真の取得
npm run capture:streetview # Street View画像の取得
```

### 証明書生成
```bash
./generate-cert.sh
```

## アーキテクチャ

### メインコンポーネント
- **server.js**: Express HTTPSサーバー。静的ファイル配信とルーティング
- **public/index.html**: A-Frame WebXRシーン。建物、道路、環境を定義
- **public/js/aframe-campus-components.js**: カスタムA-Frameコンポーネント（windows, building-info, road-markings等）

### データフロー
1. ユーザーがHTTPSでアクセス
2. index.htmlがA-Frame環境を初期化
3. カスタムコンポーネントが建物の詳細（窓、インタラクション）を動的生成
4. ユーザー操作（WASD移動、クリック）でシーンを探索

### キャプチャ・比較システム
- Puppeteerを使用して実写真（航空写真、Street View）を取得
- WebXRシーンのスクリーンショットを様々な角度から撮影
- 実写真と仮想空間の差異を分析し、改善点を特定

## 重要な実装詳細

### 座標系
- 武蔵野大学有明キャンパスの中心座標: 35.6312519, 139.787512
- A-Frame内では原点(0,0,0)を中心に配置

### 建物配置
- 1号館: 西側の複合施設 (-40, 0, 0)
- 2号館: 北側の講義棟 (20, 0, -35)  
- 3号館: 東側の図書館 (50, 0, 10)
- 4号館: 南東の学生サポート (70, 15, 35)
- 5号館: 中央の低層建物 (0, 7.5, 0)

### カスタムコンポーネントの役割
- **windows**: 建物のサイズに基づいて窓を自動配置
- **building-info**: クリック時に建物情報を表示
- **street-lights**: 街路灯と実際の光源を配置

## ファイル構成
```
webxr-ariake/
├── server.js              # HTTPSサーバー
├── public/
│   ├── index.html        # A-Frame WebXRシーン
│   └── js/
│       └── aframe-campus-components.js  # カスタムコンポーネント
├── scripts/              # Puppeteerキャプチャスクリプト
├── captures/             # 撮影画像保存先
└── certs/               # HTTPS証明書
```