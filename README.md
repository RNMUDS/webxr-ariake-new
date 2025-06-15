# WebXR Ariake - 武蔵野大学有明キャンパス3D可視化

武蔵野大学有明キャンパスをA-Frame WebXRで3D可視化するプロジェクトです。実際の航空写真とStreet Viewデータを参考に、キャンパスの建物と周辺環境をブラウザ上で体験できる仮想空間として再現しています。

## 特徴

- 🏫 武蔵野大学有明キャンパスの主要5棟を3Dモデル化
- 🚶 WASDキーによる自由な移動とマウスによる視点操作
- 🏢 建物をクリックすると詳細情報を表示
- 🌃 リアルな街路灯と環境光による夜景表現
- 📸 実写真との比較による精度向上システム

## デモ

HTTPSサーバーを起動後、`https://localhost:3000` にアクセスしてください。

## セットアップ

### 必要な環境

- Node.js (v14以上)
- npm
- Google Chrome または Firefox（WebXR対応ブラウザ）

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/webxr-ariake.git
cd webxr-ariake

# 依存パッケージのインストール
npm install

# HTTPS証明書の生成（初回のみ）
./generate-cert.sh
```

### 起動方法

```bash
# HTTPSサーバーの起動
node server.js
```

ブラウザで `https://localhost:3000` にアクセスしてください。

## 操作方法

- **移動**: W/A/S/Dキー
- **視点**: マウス移動
- **建物情報**: 建物をクリック
- **VRモード**: VRヘッドセット接続時は「VR」ボタンをクリック

## プロジェクト構成

```
webxr-ariake/
├── server.js              # Express HTTPSサーバー
├── public/
│   ├── index.html        # A-Frame WebXRシーン
│   └── js/
│       └── aframe-campus-components.js  # カスタムコンポーネント
├── scripts/              # キャプチャ・比較用スクリプト
│   ├── capture-aframe-scene.js
│   ├── capture-aerial-view.js
│   └── capture-streetview.js
├── captures/             # 撮影画像保存先
├── certs/               # HTTPS証明書
└── package.json         # プロジェクト設定
```

## 建物情報

| 建物名 | 用途 | 位置（A-Frame座標） |
|--------|------|-------------------|
| 1号館 | 西側の複合施設 | (-40, 0, 0) |
| 2号館 | 北側の講義棟 | (20, 0, -35) |
| 3号館 | 東側の図書館 | (50, 0, 10) |
| 4号館 | 南東の学生サポート | (70, 15, 35) |
| 5号館 | 中央の低層建物 | (0, 7.5, 0) |

## スクリーンショット機能

実写真との比較検証用に、以下のコマンドでスクリーンショットを撮影できます：

```bash
# A-Frameシーンの撮影
npm run capture:aframe

# Google Maps航空写真の取得
npm run capture:aerial

# Street View画像の取得
npm run capture:streetview
```

## 技術スタック

- **A-Frame**: WebXRフレームワーク
- **Express.js**: HTTPSサーバー
- **Puppeteer**: スクリーンショット撮影
- **Google Maps API**: 実写真データ取得

## カスタムコンポーネント

- `windows`: 建物サイズに基づく窓の自動配置
- `building-info`: インタラクティブな建物情報表示
- `road-markings`: 道路標示の描画
- `street-lights`: 街路灯と照明効果

## ライセンス

MIT License

## 作者

[Your Name]

## 謝辞

- 武蔵野大学有明キャンパスの3Dモデル化を許可いただいた関係者の皆様
- A-Frameコミュニティ