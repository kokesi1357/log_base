# Log Base
シンプルなチャットセービスです。</br>
PCではビデオチャット機能がございます。</br>
レスポンシブ対応していますので、スマホからもご覧いただけます。

### 目次
- [サービスのURL](https://github.com/kokesi1357/log_base#%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AEurl)
- [機能](https://github.com/kokesi1357/log_base#%E6%A9%9F%E8%83%BD)
- [使用技術](https://github.com/kokesi1357/log_base#%E4%BD%BF%E7%94%A8%E6%8A%80%E8%A1%93)
- [システム構成図](https://github.com/kokesi1357/log_base#%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E6%A7%8B%E6%88%90%E5%9B%B3)
- [ER図](https://github.com/kokesi1357/log_base#er%E5%9B%B3)
- [今後の計画](https://github.com/kokesi1357/log_base#%E4%BB%8A%E5%BE%8C%E3%81%AE%E8%A8%88%E7%94%BB)

<br>

## サービスのURL
ご登録なしでご覧いただくため、ゲストユーザーでのログイン機能を実装しました。<br>
( ログアウト後、ゲストユーザーにより生成されたデータは全て削除されます。あらかじめご了承ください。)<br>

https://logbase1357.com/entry

<br>

## 機能
| トップ画面 | 機能紹介モーダル |
| --- | --- |
| <img alt="Screen Shot 2023-11-26 at 21 16 35" src="https://github.com/kokesi1357/log_base/assets/137332880/45d77e9c-6fb1-4da1-91cf-f45d0d1d524d"> | <img alt="機能紹介モーダル" src="https://github.com/kokesi1357/log_base/assets/137332880/f8e89e20-b117-422b-8122-b34fccc17eb8"> |
| 直感的でシンプルなトップ画面を実装しました。 | 表示したい画像への切替スライドを実装しました。 |
| <img alt="トップ画面" src="https://github.com/kokesi1357/log_base/assets/137332880/6c59565d-7d32-41e2-9979-50fdaaca3f20"> | <img alt="トップ画面" src="https://github.com/kokesi1357/log_base/assets/137332880/04d96df4-94e2-4ec5-84b6-04bd50214e19"> |

<br>

| ログイン画面 | サインアップ画面 |
| --- | --- |
| <img alt="ログイン画面" src="https://github.com/kokesi1357/log_base/assets/137332880/62117ce1-4caf-41a5-8d0a-342671dcee76"> | <img alt="サインアップ画面" src="https://github.com/kokesi1357/log_base/assets/137332880/1e178573-76a3-4199-b778-1a38eec8ab55"> |
| メールアドレスでのログイン機能・ゲストログイン機能・メール認証を介したアカウントのパスワードリセット機能を実装しました。 | メール認証を介するユーザー作成機能を実装しました。 |

<br>

| サーバー一覧画面 | サーバー作成・編集モーダル | サーバー検索モーダル |
| --- | --- | --- |
| <img alt="サーバー一覧画面" src="https://github.com/kokesi1357/log_base/assets/137332880/baf9dc3d-bc3e-4ef3-93d8-ae810a1f9fdd"> | <img alt="サーバー作成・編集モーダル" src="https://github.com/kokesi1357/log_base/assets/137332880/6e3508d8-ef8a-484a-8de1-de1cca2b6053"> | <img alt="サーバー検索モーダル" src="https://github.com/kokesi1357/log_base/assets/137332880/23806390-adf5-42cb-98e5-4157c036a203"> |
| アカウントに紐づくサーバー一覧表示機能を実装しました。 | サーバー作成・編集機能を実装しました。 | 任意のキーワードでのサーバー検索機能を実装しました。 |

<br>

| チャンネル一覧画面 | チャンネル作成・編集モーダル |
| --- | --- |
| <img alt="チャンネル一覧画面" src="https://github.com/kokesi1357/log_base/assets/137332880/fba8018a-e828-4b7d-ba3c-05634af73e9c"> | <img alt="チャンネル作成・編集モーダル" src="https://github.com/kokesi1357/log_base/assets/137332880/074f6f1a-0432-463d-bf6b-f389d95c1baa"> |
| サーバー内チャットスペースとなるチャンネル一覧表示機能を実装しました。 | チャンネル作成・編集機能を実装しました。|

<br>

| メッセージ送信画面 | メッセージ編集 | 画像スライド |
| --- | --- | --- |
| <img alt="メッセージ送信画面" src="https://github.com/kokesi1357/log_base/assets/137332880/c8da91ab-86a9-47a0-ada6-dfe3f16a4fd8"> | <img alt="メッセージ編集" src="https://github.com/kokesi1357/log_base/assets/137332880/a4ce84d7-64a0-4142-9779-ba72a9e46b09"> | <img alt="メッセージ編集" src="https://github.com/kokesi1357/log_base/assets/137332880/bb7ebdfb-e8af-489b-a79b-c28fbf0335e8"> |
| 複数ファイルを添付できるメッセージ送信機能を実装しました。 | メッセージのテキスト編集・ファイル削除機能を実装しました。 | 添付画像のスライド表示機能を実装しました。 |
| | | ![message4](https://github.com/kokesi1357/log_base/assets/137332880/8dce0b9a-293a-4f94-8de9-388209cc6590) |

<br>

| ビデオチャット画面(サイドバー) | ビデオチャット画面(フル) |
| --- | --- |
| <img alt="ビデオチャット画面(サイドバー)" src="https://github.com/kokesi1357/log_base/assets/137332880/5a5333b7-f5d1-4936-b93e-29d67b9ff794"> | <img alt="ビデオチャット画面(フル)" src="https://github.com/kokesi1357/log_base/assets/137332880/7229a04a-cb5e-4c6f-986c-04de74de0dff"> |
| ビデオチャット機能・マイクミュート切替機能・ビデオ表示切替機能を実装しました。(PCでのみ使用可能) | ビデオディスプレイ拡大機能を実装しました。 |

<br>

| アカウント設定画面 | アカウント設定画面(入力フォーム) |
| --- | --- |
| <img alt="アカウント設定画面" src="https://github.com/kokesi1357/log_base/assets/137332880/702d510b-e898-4dc9-acd5-868d5236665c"> | <img alt="アカウント設定画面(入力フォーム)" src="https://github.com/kokesi1357/log_base/assets/137332880/cdbd959e-cedc-4d6d-850f-a390a246998b"> |
| アカウントの画像、名前、メールアドレス、パスワード設定機能を実装しました。 |  |

<br>

## 使用技術
| Category | Technology |
| --- | --- |
| Front-end | CSS, HTML, Javascript |
| Back-end | Flask, Ajax |
| Infrastructure | Amazon Web Services |
| Database | PostgreSQL |
| Module Bundler | webpack |
| etc. | GitHub |

<br>

## システム構成図
<img alt="システム構成図" src="https://github.com/kokesi1357/log_base/assets/137332880/9decdb79-15f9-49f9-97d2-be8e22d5b479">

<br><br>

## ER図
<img alt="ER図" src="https://github.com/kokesi1357/log_base/assets/137332880/2383dc07-81d9-456e-8d43-df0b088710fa">

<br><br>

## 今後の計画
より本格的なチャットサービスに近づけるため、各セクションごとに下記機能の追加を考えています。<br>
- サーバー・チャンネル
  - 管理者の権限委託機能
  - ban機能
  - パスワード設定機能
- ビデオチャット
  - 複数人での通話機能
  - 顔検出してエフェクトをつける機能
- メッセージ
  - メンション機能
  - スレッド機能
