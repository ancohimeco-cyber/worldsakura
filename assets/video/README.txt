ここにトップページ用の動画ファイルを置いてください。

推奨ファイル名: top.mp4
推奨形式: MP4 (H.264)、容量はできるだけ軽く(10MB前後を目安)

動画を置いたら index.html の <section class="hero"> 内にあるコメントアウトを
以下のように書き換えると、動画が背景に表示されます。

<video autoplay muted loop playsinline>
  <source src="assets/video/top.mp4" type="video/mp4">
</video>

このタグはヘッダーやテキストより下(背景)に配置され、
ヘッダー・見出し・検索バーはすべて背景が透明なので、動画がそのまま透けて見えます。
