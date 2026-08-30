# 世界の図鑑 WORLD SAKURA

世界193か国をアルファベット順に紹介する図鑑サイト(プロトタイプ)。

## フォルダ構成

```
index.html          トップページ(動画ヒーロー + 国一覧 + 逆引き検索)
country.html        国の詳細ページ(共通テンプレート、URLの ?code=jp などで国を切り替え)
data/countries.json 国データ(このファイルを増やすだけで国が追加されます)
assets/css/         スタイル
assets/js/          表示ロジック
assets/video/       トップページ用の動画を置く場所
CNAME               独自ドメイン(worldsakura.com)をGitHub Pagesに紐づける設定
```

## 国データの追加方法

`data/countries.json` に、以下の形式でオブジェクトを追加するだけで
一覧・逆引き検索・詳細ページすべてに自動反映されます。

```json
{
  "code": "us",
  "name": "アメリカ合衆国",
  "nameEn": "United States",
  "flagEmoji": "🇺🇸",
  "continent": "北アメリカ",
  "location": "位置の説明",
  "capital": "首都名",
  "languages": ["言語1", "言語2"],
  "ethnicGroups": ["民族1", "民族2"],
  "animals": ["動物1", "動物2"],
  "flagOrigin": "国旗の由来の説明",
  "trivia": "トリビア",
  "landmarks": ["観光名所1", "観光名所2"]
}
```

現在は6か国分(サンプル)のみ収録しています。構成が問題なければ、
残り187か国分のデータを追加していきます。

## 動画の追加方法

`assets/video/README.txt` を参照してください。
