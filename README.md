# 世界の図鑑 WORLD SAKURA

世界193か国を、国・国旗・首都・言葉・生きもの・旅・雑学、いろいろな入口から巡る図鑑サイト。

## ページ構成

```
index.html          トップページ(動画ヒーロー + 大カテゴリー入口 + 注目コンテンツ + 検索 + SNS)
countries.html       国一覧ページ(193か国・アルファベット順)
search.html          逆引き検索ページ(言語・動物・首都・観光名所などから検索)
country.html         国の詳細ページ(共通テンプレート、URLの ?id=85 などで国を切り替え)
flags.html           国旗から探す(準備中)
capitals.html        首都から探す(準備中)
words.html           言葉から探す(準備中)
animals.html         生きものから探す(準備中)
travel.html          旅から探す(準備中)
trivia.html          世界の雑学(準備中)
data/countries.json  国データ(このファイルを増やすだけで国が追加されます)
assets/css/          スタイル
assets/js/           表示ロジック
assets/video/        トップページ用の動画
assets/img/          静的背景画像(トップ以外のページで使用)
assets/flags/        国旗SVG画像(ISO国コード名、例: jp.svg)
CNAME                独自ドメイン(worldsakura.com)をGitHub Pagesに紐づける設定
```

## JSファイルの役割

```
assets/js/shared.js          共通関数(fetchCountries, countryCard)
assets/js/home.js            トップページの「今日の国」「追加ずみの国」「豆知識」表示
assets/js/countries-list.js  国一覧ページの表示ロジック
assets/js/search.js          逆引き検索ページの表示ロジック
assets/js/country.js         国の詳細ページの表示ロジック
```

## 国データの追加方法

`data/countries.json` の各国オブジェクトの `detailReady` を `true` にし、
以下の項目を埋めるだけで、一覧・検索・トップの注目コンテンツ・詳細ページ
すべてに自動反映されます。`id` は統一国番号(1〜193、ABC順)、`code` は
ISO国コード(国旗ファイル名と対応)です。

```json
{
  "id": 185,
  "code": "us",
  "name": "アメリカ合衆国",
  "nameEn": "United States",
  "detailReady": true,
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

現在193か国すべてが一覧・国旗つきで登録されていますが、詳細情報が
完成しているのは6か国のみです(残りは `detailReady: false` で
「準備中」と表示されます)。

## 動画の追加方法

`assets/video/README.txt` を参照してください。
