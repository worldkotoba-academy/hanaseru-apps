# 話せるシリーズ iOS アプリ

App Store で配信している単語帳アプリ「話せる◯◯語」シリーズ（Expo / React Native）のビルド用リポジトリです。

- `hanaseru-<lang>/` … 各言語のアプリ（画面・設定・アイコン）
- `hanaseru-<lang>/content.enc` … 単語データ（単語・例文・和訳）。暗号化してあり、ビルド時にだけ復号します
- `.github/workflows/ios-build.yml` … App Store Connect へのアップロード

© 世界のことば学習館. All rights reserved.
ソースコードは参照のために公開しているものです。複製・改変・再配布・他アプリへの流用は許可していません。
