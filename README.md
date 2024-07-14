<div align="center">
    <h1>Silhouette</h1>
    <img src="./silhouette.webp" width="384" />
    <p>
    <div>Obsidianでシンプルにタスク管理するためのObsidianプラグインです。</div>
    <div>目の前のタスクに集中することのみにフォーカスしています。</div>
    </p>
    <a href="https://github.com/tadashi-aikawa/silhouette/releases/latest"><img src="https://img.shields.io/github/release/tadashi-aikawa/silhouette.svg" /></a>
    <a href="https://github.com/tadashi-aikawa/silhouette/actions"><img src="https://github.com/tadashi-aikawa/silhouette/workflows/Tests/badge.svg" /></a>
    <img src="https://img.shields.io/github/downloads/tadashi-aikawa/silhouette/total" />
</div>

## ⏬ インストール

[BRAT]を使って`tadashi-aikawa/silhouette`でインストールします。

## 🚄 クイックスタート

何よりもまずは動かしてみたい人向けです。インストール完了して、プラグインを有効にしたところからスタート。

1. 設定画面にて、[繰り返しタスクファイルのパス](#繰り返しタスクファイルのパス)に`tasks.md`を設定
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
稼働日の翌日にやるタスク,workday>1
月末の3日前にやるタスク,end of month<3
休み明けの稼働日,non workday>1!
翌日が休み,non workday<1
```

3. 本日のDaily Noteを開き、[Silhouette: Insert tasks]コマンドを実行

いくつかのタスクリストが挿入されれば成功です🎉

> **Note**  
> 学校や仕事が休みの日、祝日などを考慮する場合は[休日設定ファイル]を使ってあなただけの[休日]を定義しましょう📅

## 🧠 Silhouetteを用いたタスク管理について

機能の紹介をする前に、Silhouetteを使ってどのようにタスク管理するか、前提としているシナリオの説明をします。

Silhouetteでは、**タスクはDaily Noteにタスクリストとして管理する** 思想に基づいた機能を提供します。そのため、タスク管理に必要なデータを極力独自に持たないようにしています。

### タスク発生時のアクション

#### [ワンタイムタスク]の場合

実施予定日のDaily Noteにタスクリストとして追加します。Silhouetteの機能は使いません。

#### [繰り返しタスク]の場合

[繰り返しタスクファイル]に登録します。登録された繰り返しタスクは、今開いているDaily Noteに対して`Silhouette: Insert tasks`コマンドにより、タスクリストとして追加します。

### タスク完了時のアクション

タスクリストを完了させるだけです。Silhouetteの機能は使いません。

## ⌨️ コマンド

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

### `Silhouette: Push timer`

このコマンドはカーソル配下の[ワンタイムタスク]を計測開始/終了します。計測に関数するコマンドは1コマンドで賄います。

![demo](https://raw.githubusercontent.com/tadashi-aikawa/silhouette/master/resources/push-timer.gif)

コマンド実行後に遷移する[計測に関するステータス]は以下の通りです。

- [未計測] ---`Push timer`--> [計測中]
- [計測中] <--`Push timer`--> [計測済]

```
- [ ] 未計測のタスク
- [ ] 計測中のタスク (⏳)
- [ ] 計測済のタスク (⏲️01:23:45)
```

[計測済]のカッコ内にある`HH:mm:ss`表記は、そのタスクを計測した時間の合計です。`01:23:45`は合計で1時間23分45秒計測したという意味です。

> **Warning**  
> 異なるデバイス間で計測状態を同期する場合は、[計測状態を記録したJSONファイルのパス]で指定したファイルが同期対象となるようにしてください。

### `Silhouette: Push timer and open`

基本的には `Silhouette: Push timer` と同じですが、タスクが以下2つの条件を満たすとき

- ステータスが[未計測]か[計測済]
- タスクの中にリンク(URLやInternal linkなど)を含む

後処理として、タスク内のリンクを開きます。

![demo](https://raw.githubusercontent.com/tadashi-aikawa/silhouette/master/resources/push-timer-and-open.gif)

### `Silhouette: Cycle bullet/checkbox`

基本はObsidianの`Cycle bullet/checkbox`コマンドと同じですが、変更前のタスクが[計測中] かつ チェックがついていない場合のみタスクを[計測済]にします。

具体的には

```
- [ ] 計測中のタスク (⏳)
```

に対してコマンドを実行すると

```
- [x] 計測済のタスク (⏲️01:23:45)
```

に変わります。

### `Silhouette: Move to recording`

[計測中]のタスクが存在する行に移動します。

### `Silhouette: Force stop recording`

強制的に現在の計測を停止します。

[計測中]のタスクを示す行を誤って削除してしまい、新たな計測を開始したいが、内部状態が計測中になっていて開始できない場合に使用します。

> **Warning**  
> [計測中]タスクの記録時間は消去されます。記録時間を消去したくない場合は ` (⏳)` を末尾に追加してから、通常通り[計測済]にしてください。

### `Silhouette: Insert current time`

カーソル位置の項目に現在時間を挿入します。

リストの状態やインデントも考慮します。たとえば以下のテキストがある場合。

```
hoge
- hoge
  - hoge
- [ ] hoge
- [x] hoge
* hoge
    * hoge
        * [x] hoge
```

各行で19時4分に`Silhouette: Insert current time`コマンドを実行した結果は以下のようになります。

```
19:04 hoge
- 19:04 hoge
  - 19:04 hoge
- [ ] 19:04 hoge
- [x] 19:04 hoge
* 19:04 hoge
    * 19:04 hoge
        * [x] 19:04 hoge
```

開始時刻や終了時刻を記録するなどの用途でお使いください。

## UI

[繰り返しタスク]が意図通りの日付に予定されているか...を確認するUIを用意しています。

<video autoplay muted controls src="https://user-images.githubusercontent.com/9500018/215319503-dfa7fd1f-c7ff-4e3c-a3ef-982aa1b1a983.mp4"></video>

詳細は[0.8.0](https://github.com/tadashi-aikawa/silhouette/releases/tag/0.8.0)のリリースノートをご覧ください。

## ⚙️ 設定

### `繰り返しタスクファイルのパス`

[繰り返しタスクファイル]のパスを、Vault rootからの相対パスとして指定します。

`例`: `_Privates/repeatable tasks.md` 

### `休日設定ファイルのパス`

[休日設定ファイル]のパスを、Vault rootからの相対パスとして指定します。

`例`: `_Privates/holidays.md`

### `ファイルの日付フォーマット`

タスクを挿入する日付を判断するために必要なファイル名のフォーマットを指定します。

`例`: `YY_MM_DD` (2023年1月1日なら23_01_01というファイル名)

以下のフォーマットに対応しています。

https://day.js.org/docs/en/parse/string-format

### `計測状態を記録したJSONファイルのパス`

[計測中]の状態を記録したJSONファイルを保存するパスを、Vault rootからの相対パスとして指定します。

`例`: `_Privates/NOSYNC/timer.json`

指定しなかった場合は`.obsidian/plugins/silhouette/timer.json`に保存されます。

### `ステータスバーに計測時間を表示する`

有効にすると[計測中]タスクの計測時間が表示されます。以下のタイミングで更新されます。

- 計測を開始したとき
- 計測を終了したとき
- 計測中、前回の更新から30秒経ったとき (計測中は30秒に1回更新)

> **Warning**
> 端末間で同期したときも最大で30秒のラグがあります

### `完了したら次のタスクを自動で計測開始する`

有効にすると `Cycle bullet/checkbox` コマンドでタスクを完了したあと、次の行に未完了のタスクが存在するなら、次の行のタスクを自動で計測開始します。

## 📜 仕様

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

#### タスク名

タスクの名称です。

##### 階層構造のタスクを挿入

先頭に半角スペースやタブをつけると、[Silhouette: Insert tasks]コマンドを実行したとき、タスクがインデントされます。たとえば

```txt
普通の タスク,every day
    4つインデント,every day
        8つインデント,every day
	タブインデント,every day
```

という4つのタスクを登録したとき、[Silhouette: Insert tasks]を実行すると以下が挿入されます。

```txt
- [ ] 普通の タスク
    - [ ] 4つインデント
        - [ ] 8つインデント
	- [ ] タブインデント
```

##### リストとして挿入

`- `または`* `から始まるタスク名は **タスクではなく単なるリストとして** 挿入されます。リストを挿入したい場合や、タスクのチェック状態を含めて挿入したい場合に便利です。

たとえば

```txt
体重計測,every day
    - 身長,every day
        * [x] 体重,every day
        - [_] 血圧,every day
```

と記載したとき、`Silhouette: Insert tasks` を実行すると以下が挿入されます。

```txt
- [ ] 体重計測
    - 身長
        * [x] 体重
        - [_] 血圧
```

#### 繰り返しパターン

[繰り返しタスク]の繰り返されるパターンを示す文字列です。

> **Warning**  
> 複数のパターンを複合させることはできません。たとえば `weekday/mon` のような表現はできません。

| パターン           | 例                         | 複数指定       |
| ------------------ | -------------------------- | -------------- |
| 毎日               | every day                  | 不可           |
| 平日(月～金)       | weekday                    | 不可           |
| 土日               | weekend                    | 不可           |
| [稼働日]           | workday                    | 不可           |
| [稼働日]ではない日 | non workday                | 不可           |
| 曜日複数指定       | sun/mon                    | `/` 区切り可   |
| 毎月特定日複数指定 | 10d/20d                    | `/` 区切りで可 |
| N日ごと            | every 3 day                | 不可           |
| [月初]             | beginning of month         | 不可           |
| [月初の稼働日]     | workday beginning of month | 不可           |
| [月末]             | end of month               | 不可           |
| [月末の稼働日]     | workday end of month       | 不可           |

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
| sun* | [休日]の日曜       |
| mon* | [休日]の月曜       |
| tue* | [休日]の火曜       |
| wed* | [休日]の水曜       |
| thu* | [休日]の木曜       |
| fri* | [休日]の金曜       |
| sat* | [休日]の土曜       |

また、曜日表記の前に数字(N)を入れると、[第N曜日]を表現できます。以下は一例です。

| 表記  | 意味                    |
| ----- | ----------------------- |
| 2sat  | 第2土曜日               |
| 1fri! | [休日]ではない第1金曜日 |

##### オフセット

末尾にオフセット表記をつけると、特定日の〇日前や〇日後という表現ができます。

| 末尾につける表記 | 意味        |
| ---------------- | ----------- |
| \>N              | N日後       |
| <N               | N日前       |
| \>N!             | N[稼働日]後 |
| <N!              | N[稼働日]前 |

以下は具体例です。

```
稼働日の翌日タスク,workday>1
月末の3日前タスク,end of month<3
月末の2稼働日前タスク,end of month<2!
休み前の稼働日,non workday<1!
休み明けの稼働日,non workday>1!
翌日が休み,non workday<1
休日の水曜の1稼働日前,wed*<1!
```

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

## 🔤 用語定義

### タスクの種類

#### ワンタイムタスク

日付が指定されたタスクです。完了したらそれで終わりです。

#### 繰り返しタスク

一定のルールに基づいて繰り返し発生するタスクです。完了しても定期的に発生します。

### 計測に関するステータス

タスクの計測機能に関するステータス。それぞれの意味とエディタ上での表示状態を説明します。

#### 未計測

[ワンタイムタスク]を一度も計測したことがない状態。

```
- [ ] タスク名
```

#### 計測中

[ワンタイムタスク]を計測中である状態。末尾に` (⏳)`が付与される。

```
- [ ] タスク名 (⏳)
```

#### 計測済

[ワンタイムタスク]を計測した実績はあるが、今は計測中でない状態。末尾に` (⏲️HH:mm:ss)`が付与される。

```
- [ ] タスク名 (⏲️01:23:45)
```

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

#### 月初

各月、1日のこと。

| 例         | 対象 |
| ---------- | ---- |
| 2023-01 | 1日  |

#### 月末

月の最終日のこと。1月なら31日、4月なら30日。

| 例          | 対象  |
|------------|-----|
| 2023-01 | 31日 |
| 2023-04 | 30日 |

#### 月初の稼働日

その月最初の[稼働日]のこと。以下の条件を満たすとき

- 2023-01-01が休日
- 2023-01-02が平日
- 2023-04-01が平日

以下のようになる。

| 例      | 対象 |
| ------- | ---- |
| 2023-01 | 2日  |
| 2023-04 | 1日  |

#### 月末の稼働日

その月最後の[稼働日]のこと。以下の条件を満たすとき

- 2023-01-31が休日
- 2023-01-30が平日
- 2023-04-30が平日

以下のようになる。

| 例      | 対象 |
| ------- | ---- |
| 2023-01 | 30日 |
| 2023-04 | 30日 |

#### 第N曜日

その月でN番目に登場する特定曜日のこと。具体的には以下のように使う。

```
    2023 February
Su Mo Tu We Th Fr Sa
          1  2  3  4
 5  6  7  8  9 10 11
12 13 14 15 16 17 18
19 20 21 22 23 24 25
26 27 28
```

| 例        | 対象       |
| --------- | ---------- |
| 第1水曜日 | 2023-02-01 |
| 第1月曜日 | 2023-02-06 |
| 第4月曜日 | 2023-02-27 |

## 🐈 FAQ

### 異なる端末で計測時間の同期ができない

計測状態の同期には計測状態を記録したJSONファイルを同期する必要があります。以下を確認してください。

- 設定で [計測状態を記録したJSONファイルのパス] が指定されているか?
    - 指定されている場合
        - 指定されたパスのファイルは同期が有効になっているか?
    - 指定されてない場合
        - `.obsidian/plugins/silhouette/timer.json`の同期が有効になっているか?

## 🦉 宣伝

[Obsidian]のプラグインとして以下も開発しております。よろしければお試しください。

### コミュニティプラグイン

<a href="https://github.com/tadashi-aikawa/obsidian-various-complements-plugin">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/obsidian-various-complements-plugin" class="link-card-image" />
</a>

<a href="https://github.com/tadashi-aikawa/obsidian-another-quick-switcher">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/obsidian-another-quick-switcher" class="link-card-image" />
</a>

<a href="https://github.com/tadashi-aikawa/obsidian-old-note-admonitor">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/obsidian-old-note-admonitor" class="link-card-image" />
</a>

<a href="https://github.com/tadashi-aikawa/shukuchi">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/shukuchi" class="link-card-image" />
</a>

<a href="https://github.com/tadashi-aikawa/obsidian-embedded-code-title">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/obsidian-embedded-code-title" class="link-card-image" />
</a>

### 非コミュニティプラグイン (Silhouetteと同じ)

[BRAT]でインストールします。

<a href="https://github.com/tadashi-aikawa/mobile-first-daily-interface">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/mobile-first-daily-interface" class="link-card-image" />
</a>

#### 自分用

[BRAT]でもインストールできません。TypeScriptで開発できる方なら使いこなせるかも。

<a href="https://github.com/tadashi-aikawa/carnelian">
<img width="75%" src="https://opengraph.githubassets.com/796ed8b971a84d9f9dcb9e107edd11f765e230028bd04a967a487d1551585d90/tadashi-aikawa/carnelian" class="link-card-image" />
</a>


[ワンタイムタスク]: #ワンタイムタスク
[繰り返しタスク]: #繰り返しタスク
[繰り返しタスクファイル]: #繰り返しタスクファイル
[平日]: #平日
[休日]: #休日
[稼働日]: #稼働日
[月初]: #月初
[月末]: #月末
[月初の稼働日]: #月初の稼働日
[月末の稼働日]: #月末の稼働日
[第N曜日]: #第N曜日
[休日設定ファイル]: #休日設定ファイル
[Obsidian]: https://obsidian.md/
[BRAT]: https://github.com/TfTHacker/obsidian42-brat
[未計測]: #未計測
[計測中]: #計測中
[計測済]: #計測済
[計測に関するステータス]: #計測に関するステータス
[計測状態を記録したJSONファイルのパス]: #計測状態を記録したjsonファイルのパス
[Silhouette: Insert tasks]: #silhouette-insert-tasks
