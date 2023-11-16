// webrtc.js

// 自身のclient_idはuser設定画面に付与したdataプロパティから取得
const MY_ID = (get_element('#user-settings')) ?
    get_element('#user-settings').dataset.user_id : null;

// サイドバー内 通信ステータステキスト
const CONNECTING_TXT = get_element('.connecting')[0]
const CONNECTED_TXT = get_element('.connected')[0]

// サイドバー内 パネルセクション、パネルセクションを開く要素
const PHONE_OPERATOR = get_element('#phone-operator');
const PHONE_OPERATOR_OPENER = get_element('#phone-operator-opener');

// サイドバー内 パネル要素 ( 電話帳、サイドモニター、発信バー、受信バー )
const PHONE_BOOK = get_element('.p-index__phone-book')[0];
const SIDE_CALL_MONITOR = get_element('.p-index__call-monitor--side')[0];
const CALLER_BAR = get_element('#calling-bar');
const RECEIVER_BAR = get_element('#receiving-bar');

// SIDE_CALL_MONITOR、FULLモニター、RECEIVER_BAR、CALLER_BAR内 Xボタン
const HUNG_UP_BTNS = get_element('.hung-up-btn');

// 電話帳内 ユーザーリスト
const USER_LIST = get_element('.p-index__callable-user-list li')

// 発信バー内 通話者要素
const SIDE_RECEIVER_NAME = get_element('#calling-bar .user-name')[0];
const SIDE_RECEIVER_IMAGE = get_element('#calling-bar .user-img')[0];

// 受信バー内 通話者要素、応答ボタン
const SIDE_CALLER_NAME = get_element('#receiving-bar .user-name')[0];
const SIDE_CALLER_IMAGE = get_element('#receiving-bar .user-img')[0];
const ANSWER_BTN = get_element('#answer-call-btn');
const REJECT_BTN = get_element('#reject-call-btn');

// Side & Fullディスプレイ内 video/mike切替ボタン
const SIDE_VIDEO_DISABLE_BTN = get_element('#side-video-disable-btn');
const SIDE_VIDEO_ENABLE_BTN = get_element('#side-video-enable-btn');
const SIDE_AUDIO_MUTE_BTN = get_element('#side-audio-mute-btn');
const SIDE_AUDIO_UNMUTE_BTN = get_element('#side-audio-unmute-btn');
const FULL_VIDEO_DISABLE_BTN = get_element('#full-video-disable-btn');
const FULL_VIDEO_ENABLE_BTN = get_element('#full-video-enable-btn');
const FULL_AUDIO_MUTE_BTN = get_element('#full-audio-mute-btn');
const FULL_AUDIO_UNMUTE_BTN = get_element('#full-audio-unmute-btn');
// Side & Fullディスプレイ内 video/mike非表示マーク
const CALLER_VIDEO_OFF_ICONS = get_element(['#side-caller-video-icon--off', '#full-caller-video-icon--off']);
const CALLER_MIKE_OFF_ICONS = get_element(['#side-caller-mike-icon--off', '#full-caller-mike-icon--off']);
const RECEIVER_VIDEO_OFF_ICONS = get_element(['#side-receiver-video-icon--off', '#full-receiver-video-icon--off']);
const RECEIVER_MIKE_OFF_ICONS = get_element(['#side-receiver-mike-icon--off', '#full-receiver-mike-icon--off']);
// Side & Fullディスプレイ内 video要素
const SIDE_MY_VIDEO = get_element('#side-my-video');
const SIDE_OTHER_VIDEO = get_element('#side-other-video');
const FULL_MY_VIDEO = get_element('#full-my-video');
const FULL_OTHER_VIDEO = get_element('#full-other-video');



// PeerJSのp2p通信中に発生するデータを保管するgl変数
CONN = null;          // 接続
CALL = null;          // 通話接続
STREAM = null;        // メディアストリーム
VIDEO_TRACK = null;   // メディアストリームのvideoトラック
AUDIO_TRACK = null;   // メディアストリームのaudioトラック
// メディアストリームを取得する際の制約
const CONSTRAINTS = { video : true, audio : true };



// 「 Connecting 」 のテキストをサイドバー上に表示します
show_connecting_txt = () => {
    CONNECTING_TXT.classList.remove('u-dn');
}

// 「 Connected 」 のテキストをサイドバー上に表示、「 Connecting 」のテキストは非表示にします
show_connected_txt = () => {
    if (!CONNECTING_TXT.classList.contains('u-dn'))
        CONNECTING_TXT.classList += ' u-dn';
    CONNECTED_TXT.classList.remove('u-dn');
}

// 「 Connecting 」および「 Connected 」のテキストを非表示にします
hide_connect_txt = () => {
    if (!CONNECTING_TXT.classList.contains('u-dn'))
        CONNECTING_TXT.classList += ' u-dn';
    if (!CONNECTED_TXT.classList.contains('u-dn'))
        CONNECTED_TXT.classList += ' u-dn';
}


open_phone_operator = () => {
    PHONE_OPERATOR.dataset.status = 'on';
    PHONE_OPERATOR_OPENER.dataset.status = 'on';
}

// フルビデオモニターを閉じます
close_full_monitor = () => {
    let full_monitor_closer = get_element('#fixed-section-closer--full-screen-video');
    if (full_monitor_closer.dataset.status == 'on') full_monitor_closer.click();
}

// サイドバー上の通話操作を、電話帳に切り替えます
switch_to_phone_book = () => {
    PHONE_BOOK.classList.remove('u-dn');
    if (!SIDE_CALL_MONITOR.classList.contains('u-dn')) SIDE_CALL_MONITOR.classList += ' u-dn';
    if (!CALLER_BAR.classList.contains('u-dn')) CALLER_BAR.classList += ' u-dn';
    if (!RECEIVER_BAR.classList.contains('u-dn')) RECEIVER_BAR.classList += ' u-dn';
    // 接続/通話キャンセル時に起動するため、同タイミングでフルビデオモニターも閉じます
    close_full_monitor();
    hide_connect_txt();
}

// サイドバー上の通話操作を、ビデオモニターに切り替えます
switch_to_video_monitor = (my_stream, other_stream) => {
    if (!PHONE_BOOK.classList.contains('u-dn')) PHONE_BOOK.classList += ' u-dn';
    SIDE_CALL_MONITOR.classList.remove('u-dn');
    if (!CALLER_BAR.classList.contains('u-dn')) CALLER_BAR.classList += ' u-dn';
    if (!RECEIVER_BAR.classList.contains('u-dn')) RECEIVER_BAR.classList += ' u-dn';
    // 自身のデバイスから取得した映像を表示
    SIDE_MY_VIDEO.srcObject = my_stream;
    FULL_MY_VIDEO.srcObject = my_stream;
    // 相手から受信した映像を表示
    SIDE_OTHER_VIDEO.srcObject = other_stream;
    FULL_OTHER_VIDEO.srcObject = other_stream;
    show_connected_txt();
}

// サイドバー上の通話操作を、発信バーに切り替え、受信者情報をセットします
switch_to_calling_bar = (user_name, b64) => {
    if (!PHONE_BOOK.classList.contains('u-dn')) PHONE_BOOK.classList += ' u-dn';
    if (!SIDE_CALL_MONITOR.classList.contains('u-dn')) SIDE_CALL_MONITOR.classList += ' u-dn';
    CALLER_BAR.classList.remove('u-dn');
    if (!RECEIVER_BAR.classList.contains('u-dn')) RECEIVER_BAR.classList += ' u-dn';
    SIDE_RECEIVER_NAME.innerHTML = user_name;
    SIDE_RECEIVER_IMAGE.innerHTML = (b64) ?
        `<img src="${ b64 }" alt="">` : `<i class="fa-solid fa-user"></i>`;
    show_connecting_txt();
}

// サイドバー上の通話操作を、受信バーに切り替え、発信者情報をセットします
switch_to_recieving_bar = (user_name, b64) => {
    if (!PHONE_BOOK.classList.contains('u-dn')) PHONE_BOOK.classList += ' u-dn';
    if (!SIDE_CALL_MONITOR.classList.contains('u-dn')) SIDE_CALL_MONITOR.classList += ' u-dn';
    if (!CALLER_BAR.classList.contains('u-dn')) CALLER_BAR.classList += ' u-dn';
    RECEIVER_BAR.classList.remove('u-dn');
    SIDE_CALLER_NAME.innerHTML = user_name;
    SIDE_CALLER_IMAGE.innerHTML = (b64) ?
        `<img src="${ b64 }" alt="">` : `<i class="fa-solid fa-user"></i>`;
    show_connecting_txt();
}



// 自身のビデオoffアイコンを表示/非表示させます
show_caller_video_off_icon = () => {
    CALLER_VIDEO_OFF_ICONS.map((cvoi) => cvoi.classList.remove('u-op-0'))
}
hide_caller_video_off_icon = () => {
    CALLER_VIDEO_OFF_ICONS.map((cvoi) => { if (!cvoi.classList.contains('u-op-0')) cvoi.classList += ' u-op-0'; })
}

// 相手のビデオoffアイコンを表示/非表示させます
show_receiver_video_off_icon = () => {
    RECEIVER_VIDEO_OFF_ICONS.map((rvoi) => rvoi.classList.remove('u-op-0'))
}
hide_receiver_video_off_icon = () => {
    RECEIVER_VIDEO_OFF_ICONS.map((rvoi) => { if (!rvoi.classList.contains('u-op-0')) rvoi.classList += ' u-op-0'; })
}

// 自身のマイクmuteアイコンを表示/非表示させます
show_caller_mike_off_icon = () => {
    CALLER_MIKE_OFF_ICONS.map((cmoi) => cmoi.classList.remove('u-op-0'))
}
hide_caller_mike_off_icon = () => {
    CALLER_MIKE_OFF_ICONS.map((cmoi) => { if (!cmoi.classList.contains('u-op-0')) cmoi.classList += ' u-op-0'; })
}

// 相手のマイクmuteアイコンを表示/非表示させます
show_receiver_mike_off_icon = () => {
    RECEIVER_MIKE_OFF_ICONS.map((rmoi) => rmoi.classList.remove('u-op-0'))
}
hide_receiver_mike_off_icon = () => {
    RECEIVER_MIKE_OFF_ICONS.map((rmoi) => { if (!rmoi.classList.contains('u-op-0')) rmoi.classList += ' u-op-0'; })
}



// メディアストリームのvideoトラックをoffにします
disable_video_track = () => {
    if (VIDEO_TRACK) VIDEO_TRACK.enabled = false;
    if (!SIDE_VIDEO_DISABLE_BTN.classList.contains('u-dn')) SIDE_VIDEO_DISABLE_BTN.classList += ' u-dn';
    if (SIDE_VIDEO_ENABLE_BTN.classList.contains('u-dn')) SIDE_VIDEO_ENABLE_BTN.classList.remove('u-dn');
    if (!FULL_VIDEO_DISABLE_BTN.classList.contains('u-dn')) FULL_VIDEO_DISABLE_BTN.classList += ' u-dn';
    if (FULL_VIDEO_ENABLE_BTN.classList.contains('u-dn')) FULL_VIDEO_ENABLE_BTN.classList.remove('u-dn');
    show_caller_video_off_icon();
}

// メディアストリームのvideoトラックをonにします
enable_video_track = () => {
    if (VIDEO_TRACK) VIDEO_TRACK.enabled = true;
    if (SIDE_VIDEO_DISABLE_BTN.classList.contains('u-dn')) SIDE_VIDEO_DISABLE_BTN.classList.remove('u-dn');
    if (!SIDE_VIDEO_ENABLE_BTN.classList.contains('u-dn')) SIDE_VIDEO_ENABLE_BTN.classList += ' u-dn';
    if (FULL_VIDEO_DISABLE_BTN.classList.contains('u-dn')) FULL_VIDEO_DISABLE_BTN.classList.remove('u-dn');
    if (!FULL_VIDEO_ENABLE_BTN.classList.contains('u-dn')) FULL_VIDEO_ENABLE_BTN.classList += ' u-dn';
    hide_caller_video_off_icon();
}

if (SIDE_VIDEO_DISABLE_BTN) {
    SIDE_VIDEO_DISABLE_BTN.addEventListener('click', disable_video_track)
    SIDE_VIDEO_ENABLE_BTN.addEventListener('click', enable_video_track)
    FULL_VIDEO_DISABLE_BTN.addEventListener('click', disable_video_track)
    FULL_VIDEO_ENABLE_BTN.addEventListener('click', enable_video_track)
}

// メディアストリームのaudioトラックをoffにします
disable_audio_track = () => {
    if (AUDIO_TRACK) AUDIO_TRACK.enabled = false;
    if (!SIDE_AUDIO_MUTE_BTN.classList.contains('u-dn')) SIDE_AUDIO_MUTE_BTN.classList += ' u-dn';
    if (SIDE_AUDIO_UNMUTE_BTN.classList.contains('u-dn')) SIDE_AUDIO_UNMUTE_BTN.classList.remove('u-dn');
    if (!FULL_AUDIO_MUTE_BTN.classList.contains('u-dn')) FULL_AUDIO_MUTE_BTN.classList += ' u-dn';
    if (FULL_AUDIO_UNMUTE_BTN.classList.contains('u-dn')) FULL_AUDIO_UNMUTE_BTN.classList.remove('u-dn');
    show_caller_mike_off_icon();
}

// メディアストリームのaudioトラックをonにします
enable_audio_track = () => {
    if (AUDIO_TRACK) AUDIO_TRACK.enabled = true;
    if (SIDE_AUDIO_MUTE_BTN.classList.contains('u-dn')) SIDE_AUDIO_MUTE_BTN.classList.remove('u-dn');
    if (!SIDE_AUDIO_UNMUTE_BTN.classList.contains('u-dn')) SIDE_AUDIO_UNMUTE_BTN.classList += ' u-dn';
    if (FULL_AUDIO_MUTE_BTN.classList.contains('u-dn')) FULL_AUDIO_MUTE_BTN.classList.remove('u-dn');
    if (!FULL_AUDIO_UNMUTE_BTN.classList.contains('u-dn')) FULL_AUDIO_UNMUTE_BTN.classList += ' u-dn';
    hide_caller_mike_off_icon();
}

if (SIDE_AUDIO_MUTE_BTN) {
    SIDE_AUDIO_MUTE_BTN.addEventListener('click', disable_audio_track)
    SIDE_AUDIO_UNMUTE_BTN.addEventListener('click', enable_audio_track)
    FULL_AUDIO_MUTE_BTN.addEventListener('click', disable_audio_track)
    FULL_AUDIO_UNMUTE_BTN.addEventListener('click', enable_audio_track)
}



// p2p通信中発生するデータ用のストレージをリセットします
reset_p2p_data = () => {
    CALL=null;
    CONN=null;
    STREAM = null;
    VIDEO_TRACK = null;
    AUDIO_TRACK = null;
}

// 自身のデバイスのメディアストリームを停止させます
stop_my_media_stream = () => {
    if (VIDEO_TRACK) VIDEO_TRACK.stop();
    if (AUDIO_TRACK) AUDIO_TRACK.stop();
}

// p2p通信を閉じます
disconnect = () => {
    if (CALL) { CALL.close(); }
    if (CONN) { CONN.close(); }
}

// HUNG_UP_BTNS押下時、通話を切ります
HUNG_UP_BTNS.map((hub) => {
    hub.addEventListener('click', () => disconnect)
})



// 応答ボタン押下でtrueを返す待機関数
wait_for_call_response = async () => {
    return await new Promise((resolve) => {
        ANSWER_BTN.addEventListener('click', () => resolve(true));
        setTimeout(() => {
            if (!CALL) resolve(false);
        }, 30000);
    });
}

// (テスト用) 自身のメディアストリームを起動 => videoに流します
activate = () => {
    navigator.mediaDevices.getUserMedia(CONSTRAINTS)
    .then(function (stream) {
        STREAM = stream;
        VIDEO_TRACK = STREAM.getVideoTracks()[0];
        AUDIO_TRACK = STREAM.getAudioTracks()[0];
        switch_to_video_monitor();
        // 自信のモニターを表示
        SIDE_MY_VIDEO.srcObject = stream;
        FULL_MY_VIDEO.srcObject = stream;
    // カメラ映像、オーディオへのアクセスが失敗した場合
    }).catch(function (error) {
        console.log(error);
        hide_connect_txt();
    });
}



// PeerJsライブラリを用いたp2p通信用クラス
const MyPeer = class extends Peer {
    constructor() { super(MY_ID) }

    // 生成した接続をgl化、切断後設定を付与
    set_up_conn = (conn) => {
        CONN = conn;
        conn.on('close', () => {
            reset_p2p_data();
            switch_to_phone_book();
        });
    }

    // 生成した通話接続をgl化、切断後設定を付与
    set_up_call = (call) => {
        CALL = call;
        call.on('close', () => stop_my_media_stream);
    }

    // 指定したclient_idに接続を行う
    async my_connect(other_id) {
        return await new Promise((resolve, reject) => {
            let conn = this.connect(other_id)
            // 接続が成功した場合
            conn.on('open', () => {
                this.set_up_conn(conn);
                resolve();
            });
            // 30秒以内に接続ができなかった場合
            setTimeout(() => {
                if (!CONN) {
                    conn.close();
                    switch_to_phone_book();
                    reject();
                }
            }, 30000);
        })
    }

    // 指定したclient_idに通話を行う
    my_call = (other_id) => {
        // 自身のデバイスからカメラ映像 + オーディオを取得
        navigator.mediaDevices.getUserMedia(CONSTRAINTS)
        .then((my_stream) => {
            // 取得したカメラ映像を相手に送信
            let call = PEER.call(other_id, my_stream);
            if (call != null) {
                set_up_call(call);
                // 相手からのストリーミングデータが受信できれば、ビデオモニターを表示
                call.on('stream', (other_stream) => switch_to_video_monitor(my_stream, other_stream));
            } else disconnect(); // 通話が繋がらなかった場合、p2p終了

        // カメラ映像、オーディオへのアクセスが失敗した場合、p2p終了
        }).catch((error) => {
            console.log(error);
            disconnect();
        });
    }
}



// 電話帳がある(=任意のserver内にいる)場合、p2p通信をセットアップ
if (PHONE_BOOK) {
    PEER = new MyPeer();

    // 接続 / 通話を行う側の処理 ------------------------------------------------

    // サイドバーにて、電話帳の任意の相手を押下した際、相手に電話をかけます
    USER_LIST.map(li => {
        li.addEventListener('click', () => {
            show_connecting_txt();
            switch_to_calling_bar(
                get_element('.user-list-name', li)[0].textContent,
                (get_element('.user-list-image img', li)[0]) ? 
                    get_element('.user-list-image img', li)[0].src : null
            );
            // 相手client_idを取得 => 接続
            let other_id = li.dataset.user_id;
            PEER.my_connect(other_id)
            .then(() => {
                // 発信者の名前、画像を相手に送信
                CONN.send({
                    user_name : get_element('#user-info--name').textContent,
                    b64 : (get_element('#user-info--image img')[0]) ? 
                        get_element('#user-info--image img')[0].src : null 
                })

                // 相手から通話への応答がきた場合の処理
                CONN.on('data', (data) => {
                    console.log(`${data}`);
                    // 通話受入の応答だった場合、通話開始
                    if (data) PEER.my_call(other_id);
                })

                // 30秒後通話が開始していない場合、p2p終了
                setTimeout(() => {
                    if (!CALL) disconnect();
                }, 30000);
            })
        });
    })



    // 接続 / 通話を受ける側の処理 -----------------------------------------------

    // 接続がきた際の処理
    PEER.on('connection', (conn) => {
        // 既に接続がある場合、拒否する
        if (CONN) conn.close();
        else {
            PEER.set_up_conn(conn);
            conn.on('data', (data) => switch_to_recieving_bar(data.user_name, data.b64))
            open_phone_operator();

            // 通話の応答(受入 / 拒否)を選択するまで待機
            wait_for_call_response()
            // 通話を受け入れた場合、受入の応答msgを送信
            .then((rslt) => { if(rslt) conn.send(rslt) })
        }
    })

    // 通話がきた際の処理
    PEER.on('call', (call) => {
        set_up_call(call);
        navigator.mediaDevices.getUserMedia(CONSTRAINTS)
        .then((my_stream) => {
            // 取得したカメラ映像を相手に送信
            call.answer(my_stream);
            // 相手からのストリーミングデータ受信処理
            call.on('stream', (other_stream) => switch_to_video_monitor(my_stream, other_stream));

        // カメラ映像、オーディオへのアクセスが失敗した場合、p2p終了
        }).catch((error) => {
            console.log(error);
            disconnect();
        });
    });
}