# Silhouette

[![release](https://img.shields.io/github/release/tadashi-aikawa/silhouette.svg)](https://github.com/tadashi-aikawa/silhouette/releases/latest)
[![Tests](https://github.com/tadashi-aikawa/silhouette/workflows/Tests/badge.svg)](https://github.com/tadashi-aikawa/silhouette/actions)
![downloads](https://img.shields.io/github/downloads/tadashi-aikawa/silhouette/total)


[Obsidian]でシンプルにタスク管理するためのObsidianプラグインです。目の前のタスクに集中することのみにフォーカスしています。

> **Note**  
> I will wait to write this README in English because I want to prior the speed of developing this plugin until it is stable. Sorry.

> **Note**  
> (上記の意訳) 開発速度を優先したいので、プラグインが安定するまでREADMEには日本語を使います。

> **Note**  
> 要望/バグ報告/質問/感想などはGitHub IssuesまたはTwitterアカウントへお願いします。シンプルかつ自身で使うことを最優先としていますので、機能要望にはお応えできないことも多いかと思います。ご了承ください。

## ⏬インストール

[BRAT]を使って`tadashi-aikawa/silhouette`でインストールします。

## 🚄クイックスタート

何よりもまずは動かしてみたい人向けです。インストール完了して、プラグインを有効にしたところからスタート。

1. 設定画面にて、[Task file path](#task-file-path)に`tasks.md`を設定
2. Vaultのrootに`tasks.md`を作成して以下を貼り付け

```csv
毎日やるタスク,every day
平日やるタスク,weekday
土日やるタスク,weekend
月・水・金やるタスク,mon/wed/fri
火・木・土やるタスク,tue/thu/sat
毎月10日やるタスク,10d
毎月1日/11日/21日/31日やるタスク,1d/11d/21d/31d
1月1日から7日ごとにやるタスク,every 7 day,2023-01-01
1月1日から10日ごとにやるタスク,every 10 day,2023-01-01
```

3. 本日のDaily Noteを開き、[Silhouette: Insert tasks](#silhouette-insert-tasks)コマンドを実行

いくつかのタスクリストが挿入されれば成功です🎉

> **Note**  
> 学校や仕事が休みの日、祝日などを考慮する場合は[休日設定ファイル]を使ってあなただけの[休日]を定義しましょう📅

## 🧠Silhouetteを用いたタスク管理について

機能の紹介をする前に、Silhouetteを使ってどのようにタスク管理するか、前提としているシナリオの説明をします。

Silhouetteでは、**タスクはDaily Noteにタスクリストとして管理する** 思想に基づいた機能を提供します。そのため、Silhouetteはタスク管理に関する独自のUIを持ちません。また、タスク管理に必要なデータも、極力独自に持たないようにしています。

### タスク発生時のアクション

#### [ワンタイムタスク]の場合

> **Warning**  
> Silhouetteの機能は使いません。

実施予定日のDaily Noteにタスクリストとして追加します。

#### [繰り返しタスク]の場合

[繰り返しタスクファイル]に登録します。登録された繰り返しタスクは、今開いているDaily Noteに対して`Silhouette: Insert tasks`コマンドにより、タスクリストとして追加します。

### タスク完了時のアクション

> **Warning**  
> Silhouetteの機能は使いません。

タスクリストを完了させるだけです。

### Silhouetteで対応しないこと

現時点において、以下をSilhouetteで対応するつもりはありません。(気が変わるかもしれませんが...)

- 過去および未来のタスク管理/分析
- 工数の計測
- GUIによるリッチな表現

## ⌨️コマンド

Silhouetteのコマンドは1つだけです。

### `Silhouette: Insert tasks`

このコマンドは **現在アクティブなDaily Noteの日付を読み取り、[繰り返しタスクファイル]からその日にやるべき[ワンタイムタスク]を、Daily Noteに生成** します。

![demo](https://raw.githubusercontent.com/tadashi-aikawa/silhouette/master/resources/insert-tasks.gif)

上記は、2023-01-21(土)の[ワンタイムタスク]を、以下の[繰り返しタスクファイル]を元に生成した動画です。

```csv
毎日やるタスク,every day
平日やるタスク,weekday
土日やるタスク,weekend
月・水・金やるタスク,mon/wed/fri
火・木・土やるタスク,tue/thu/sat
毎月10日やるタスク,10d
毎月1日/11日/21日/31日やるタスク,1d/11d/21d/31d
1月1日から7日ごとにやるタスク,every 7 day,2023-01-01
1月1日から10日ごとにやるタスク,every 10 day,2023-01-01
```

[繰り返しタスクファイル]の見方は、この後に登場する[仕様](#仕様)をご覧ください。

> **Note**  
> 機能が1つしかないのは現時点でそうだからです。今後も1つだけにするというこだわりはありません。(管理を複雑にするようなコマンドを増やす予定もありません)

## ⚙️設定

### `Task file path`

[繰り返しタスクファイル]のパスを、Vault rootからの相対パスとして指定します。

`例`: `_Privates/repeatable tasks.md` 

### `Holiday file path`

[休日設定ファイル]のパスを、Vault rootからの相対パスとして指定します。

`例`: `_Privates/holidays.md`

### `File date format`

タスクを挿入する日付を判断するために必要なファイル名のフォーマットを指定します。

`例`: `YY_MM_DD` (2023年1月1日なら23_01_01というファイル名)

以下のフォーマットに対応しています。

https://day.js.org/docs/en/parse/string-format

## 📜仕様

### 繰り返しタスクファイル

カンマ区切りのCSV形式です。

| 列index | 必須 | 意味             | 例         |
| ------- | ---- | ---------------- | ---------- |
| 1       | O    | タスク名         | 10:00 朝会 |
| 2       | O    | 繰り返しパターン | every day  |
| 3       |      | 起点日           | 2022-03-11 |

以下の行は無視されます。

- `//`から始まるコメント行
- 空行、もしくはスペースのみの行

#### 繰り返しパターン

[繰り返しタスク]の繰り返されるパターンを示す文字列です。

> **Warning**  
> 複数のパターンを複合させることはできません。たとえば `weekday/mon` のような表現はできません。

| パターン           | 例                   | 複数指定       |
| ------------------ | -------------------- | -------------- |
| 毎日               | every day            | 不可           |
| 平日(月～金)       | weekday              | 不可           |
| 土日               | weekend              | 不可           |
| [稼働日]           | workday              | 不可           |
| [稼働日]ではない日 | non workday          | 不可           |
| 曜日複数指定       | sun/mon              | `/` 区切り可   |
| 毎月特定日複数指定 | 10d/20d              | `/` 区切りで可 |
| N日ごと            | every 3 day          | 不可           |
| 月末               | end of month         | 不可           |
| 月末の[稼働日]     | workday end of month |                |

##### 曜日

曜日は小文字のアルファベット3文字で表現します。

| 表記 | 意味               |
| ---- | ------------------ |
| sun  | 日曜               |
| mon  | 月曜               |
| tue  | 火曜               |
| wed  | 水曜               |
| thu  | 木曜               |
| fri  | 金曜               |
| sat  | 土曜               |
| sun! | [休日]ではない日曜 |
| mon! | [休日]ではない月曜 |
| tue! | [休日]ではない火曜 |
| wed! | [休日]ではない水曜 |
| thu! | [休日]ではない木曜 |
| fri! | [休日]ではない金曜 |
| sat! | [休日]ではない土曜 |

#### 起点日

繰り返しパターンの起点となる日付です。たとえば

```
タスク,every 2 day,2022-03-10
```

のとき、2022/3/10を起点として1日おき(2日に1回)のタスクと判定されます。また、起点日以降にならないとタスクは有効になりません。

具体的な各日付でのタスク有無は以下のようになります。

| 日付       | 有無   |
| ---------- | ------ |
| 2022/03/08 | 無     |
| 2022/03/09 | 無     |
| 2022/03/10 | **有** |
| 2022/03/11 | 無     |
| 2022/03/12 | **有** |
| 2022/03/13 | 無     |
| 2022/03/14 | **有** |

#### そのほかの例

私が設定している[繰り返しタスク]の一部を例として紹介します。

```csv
08:30 出勤,mon!/tue!/thu!
22:45 歯磨き,every day
洗濯(洗う),every 2 day,2023-01-14
洗濯(干す),every 2 day,2023-01-14
爪切り,every 7 day,2023-01-13
Minervaバックアップ,mon
```

解説

- 水金はリモートワークなので、月火木は出勤が必要 (休日は不要なので`!`つき)
- 歯磨きは毎日
- 洗濯は2日に1回
- 爪切りは毎週
- Minervaのバックアップは毎週月曜 (休日かどうかは関係ないので`!`なし)

### 休日設定ファイル

各行に日付を記載する形式です。以下は2023年における日本の祝日を定義した例です。

> **Note**  
> サポートフォーマットは`YYYY-MM-DD`形式ですが、他の一般的なフォーマットも受け付ける可能性があります。

```csv
2023-01-01
2023-01-02
2023-01-09
2023-02-11
2023-02-23
2023-03-21
2023-04-29
2023-05-03
2023-05-04
2023-05-05
2023-07-17
2023-08-11
2023-09-18
2023-09-23
2023-10-09
2023-11-03
2023-11-23
```

以下の行は無視されます。

- `//`から始まるコメント行
- 空行、もしくはスペースのみの行

## 🔤用語定義

### タスクの種類

#### ワンタイムタスク

日付が指定されたタスクです。完了したらそれで終わりです。

#### 繰り返しタスク

一定のルールに基づいて繰り返し発生するタスクです。完了しても定期的に発生します。

### 日付に関する単語

#### 平日

月曜～金曜のこと。

|            | 月  | 火  | 水  | 木  | 金  | 土  | 日  |
| ---------- | --- | --- | --- | --- | --- | --- | --- |
| [休日]以外 | o   | o   | o   | o   | o   | x   | x   |
| [休日]     | o   | o   | o   | o   | o   | x   | x   |

#### 休日

[休日設定ファイル]で指定された日付のこと。通常は以下を設定する。

- 祝日
- 年末年始など、仕事や学業などがない休み

|            | 月  | 火  | 水  | 木  | 金  | 土  | 日  |
| ---------- | --- | --- | --- | --- | --- | --- | --- |
| [休日]以外 | x   | x   | x   | x   | x   | x   | x   |
| [休日]     | o   | o   | o   | o   | o   | o   | o   |

#### 稼働日

[休日]を除く[平日]のこと。

|            | 月  | 火  | 水  | 木  | 金  | 土  | 日  |
| ---------- | --- | --- | --- | --- | --- | --- | --- |
| [休日]以外 | o   | o   | o   | o   | o   | x   | x   |
| [休日]     | x   | x   | x   | x   | x   | x   | x   |


## 🦉宣伝

[Obsidian]のプラグインとして以下も開発しております。すべて日本語に対応しておりますので、よろしければお試しください。

<a href="https://github.com/tadashi-aikawa/obsidian-various-complements-plugin">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/obsidian-various-complements-plugin" class="link-card-image" />
</a>

<a href="https://github.com/tadashi-aikawa/obsidian-another-quick-switcher">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/obsidian-another-quick-switcher" class="link-card-image" />
</a>

<a href="https://github.com/tadashi-aikawa/obsidian-old-note-admonitor">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/obsidian-old-note-admonitor" class="link-card-image" />
</a>

<a href="https://github.com/tadashi-aikawa/obsidian-embedded-code-title">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/obsidian-embedded-code-title" class="link-card-image" />
</a>

[ワンタイムタスク]: #ワンタイムタスク
[繰り返しタスク]: #繰り返しタスク
[繰り返しタスクファイル]: #繰り返しタスクファイル
[平日]: #平日
[休日]: #休日
[稼働日]: #稼働日
[休日設定ファイル]: #休日設定ファイル
[Obsidian]: https://obsidian.md/
[BRAT]: https://github.com/TfTHacker/obsidian42-brat

