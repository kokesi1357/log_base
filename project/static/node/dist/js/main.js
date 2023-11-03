/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/ajax.js":
/*!********************!*\
  !*** ./js/ajax.js ***!
  \********************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");
// ajax.js

/*------------------------
|   全体で使用する HELPER   |
------------------------*/

// フォーム内要素のdisabledを切り替えます
// jquery要素からmapで抽出した子要素は、js要素の扱いになる
// => .prop("disabled") ×   .disabled ◯
toggle_form_disabled = function toggle_form_disabled(form) {
  var inputs = form.find('input');
  inputs.map(function (i, input) {
    input.disabled = input.disabled ? false : true;
  });
};

/*-------------
|   #サーバー   |
-------------*/

// #サーバー追加用 --------------------------------------------------------------

execute_server_addition = function execute_server_addition(server_name) {
  var base64 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var file_name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
  $.ajax({
    data: {
      name: server_name,
      base64: base64,
      filename: file_name
    },
    type: 'POST',
    url: '/add_server'
  }).done(function (data) {
    if (data.result) {
      // フォームの値 & 画像のプレビューをクリア
      $('#add-server--name').val("");
      $('#error-msg--add-server-name').text("");
      $('#modal--create-server .p-form__filename').text("No file chosen");
      $('#add-server--image').val("");
      if ($('#add-server--image-wrap img')) $('#add-server--image-wrap img').remove();
      // フォームを閉じて、生成したサーバーのUIを追加
      $('#modal-closer--add-server').trigger("click");
      $('#server-board-wrap').append("<div class=\"p-index__server-board col-sp-12 col-tab-6\" id=\"server-board-".concat(data.new_srvr.id, "\" data-id=\"").concat(data.new_srvr.id, "\">\n                    <div class=\"p-index__server-thumnail-wrap\">\n                        <a href=\"/server/").concat(data.new_srvr.id, "\" class=\"p-index__server-thumnail\">\n                            ").concat(base64 ? "<img src=" + base64 + ">" : "<p>No Image</p>", "\n                        </a>\n                        <button class=\"p-index__server-edit-btn modal-opener toggler\"\n                        onclick=\"prefill_server_update(this.parentNode.parentNode); open_modal_with_closer_id('update-server')\">\n                            <i class=\"fa-solid fa-gear\"></i>\n                        </button>\n                    </div>\n                    <p class=\"p-index__server-title\">").concat(server_name, "</p>\n                </div>"));
    } else {
      $('#error-msg--add-server-name').text(data.error_msg.name);
    }
  });
};
var ADD_SERVER_SUBMIT = $("#add-server--submit");
if (ADD_SERVER_SUBMIT.length) {
  ADD_SERVER_SUBMIT.on('click', function () {
    var file = $('#add-server--image')[0].files[0];
    var server_name = $('#add-server--name').val();
    if (typeof file != "undefined") {
      var READER = new FileReader();
      READER.onload = function (e) {
        execute_server_addition(server_name, e.currentTarget.result, file.name);
      };
      READER.readAsDataURL(file);
    } else {
      execute_server_addition(server_name);
    }
  });
}

// #サーバー編集用 ---------------------------------------------------------------

execute_server_update = function execute_server_update(id, server_name) {
  var base64 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
  var file_name = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
  var delete_image = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  $.ajax({
    data: {
      name: server_name,
      base64: base64,
      filename: file_name,
      delete_image: delete_image
    },
    type: 'POST',
    url: "/server/".concat(id, "/update")
  }).done(function (data) {
    if (data.result) {
      if (base64) {
        $("#server-board-".concat(id, " .p-index__server-thumnail")).html("<img src=".concat(base64, ">"));
      } else if (delete_image) {
        $("#server-board-".concat(id, " .p-index__server-thumnail")).html("<p>No Image</p>");
      }
      $("#server-board-".concat(id, " .p-index__server-title")).text(server_name);
      $('#modal-closer--update-server').trigger("click");
    } else {
      $('#error-msg--update-server-name').text(data.error_msg.name);
    }
  });
};
var UPDATE_SERVER_SUBMIT = $("#update-server--submit");
if (UPDATE_SERVER_SUBMIT.length) {
  UPDATE_SERVER_SUBMIT.on('click', function () {
    var id = $('#update-server-form').data('id');
    var server_name = $('#update-server--name').val();
    var file = $('#update-server--image')[0].files.length ? $('#update-server--image')[0].files[0] : null;
    var delete_image = $('#update-server--delete-image') ? $('#update-server--delete-image').prop('checked') : null;
    if (file) {
      var READER = new FileReader();
      READER.onload = function (e) {
        execute_server_update(id, server_name, e.currentTarget.result, file.name);
      };
      READER.readAsDataURL(file);
    } else {
      execute_server_update(id, server_name, "", "", delete_image);
    }
  });
}

// #サーバー検索用 (text欄ENTERで発火するため form.js で起動) ------------------------

execute_server_search = function execute_server_search() {
  $('#server-search-bar').prop("disabled", true);
  loading();
  $.ajax({
    data: {
      keyword: $('#server-search-bar').val()
    },
    type: 'POST',
    url: '/search_server'
  }).done(function (data) {
    var SERVER_LIST_TAG = $('.p-form__server-banner-list').first();
    var SEARCHED_NUM_DISPLAY = $('#found-server-num');
    var CLICK_URGE = $('#click-urge');

    // server_list_tagを空に
    if (SERVER_LIST_TAG.children().length > 0) SERVER_LIST_TAG.empty();

    // 検索結果数を表示
    SEARCHED_NUM_DISPLAY.html("".concat(data.server_info.length, " servers found for \"").concat(data.kw, "\""));

    // 検索結果があれば各サーバーを参照するhtml等を追加
    if (!data.server_info[0]) {
      if (!CLICK_URGE.hasClass("u-dn")) CLICK_URGE.addClass("u-dn");
    } else {
      if (CLICK_URGE.hasClass("u-dn")) CLICK_URGE.removeClass("u-dn");
      data.server_info.map(function (s) {
        var img_html = s.img ? "<img src=\"".concat(s.img, "\" alt=\"Server\u753B\u50CF\u3067\u3059\">") : "";
        SERVER_LIST_TAG.append("<li>\n                        <a href=\"/join_server/".concat(s.name, "\" class=\"p-form__server-banner\">\n                            <div class=\"p-form__searched-server-img-wrap\">").concat(img_html, "</div>\n                            <div class=\"p-form__searched-server-info\">\n                                <p class=\"server-name\">").concat(s.name, "</p>\n                                <p class=\"server-population\">").concat(s.num, " members</p>\n                            </div>\n                        </a>\n                    </li>"));
      });
    }
    $('#server-search-bar').prop("disabled", false);
    $('#server-search-bar').trigger('focus');
    loaded();
  });
};

// #サーバー削除用
execute_server_delete = function execute_server_delete(id) {
  $.ajax({
    type: 'GET',
    url: "/server/".concat(id, "/delete")
  }).done(function (data) {
    if (data.result) {
      $("#server-board-".concat(id)).remove();
      $('#modal-closer--update-server').trigger("click");
    }
  });
};

// #サーバー退出用
execute_server_leave = function execute_server_leave(id) {
  $.ajax({
    type: 'GET',
    url: "/server/".concat(id, "/leave")
  }).done(function (data) {
    if (data.result) {
      $("#joined-server-board-".concat(id)).remove();
    }
  });
};

/*-------------------------------------------------------
|   チャンネル と メッセージ 双方で使用する 変数 および HELPER  |
-------------------------------------------------------*/

// 既存のメッセージ数
// (メッセージの自動更新にて、既存と追加後のメッセージ数の差分を図るのに用いる)
var msg_list_length = $('.p-index-main__msg-list').length ? $('.p-index-main__msg-list').children('li').length : 0;

// 受け取った単一のメッセージ情報をメッセージ一覧に反映させます
display_message = function display_message(msg, sender_b64) {
  // *** 挿入する添付ファイルのリストを作成 ***
  // 画像リストを作成
  var return_img_li = function return_img_li(b64, s3name, msg_id) {
    return "<li class=\"c-menu-wrap flex-item\">\n                    <img class=\"u-pointer\" src=\"".concat(b64, "\" onclick=\"unfold_slide(this)\">\n                    <div class=\"c-corner-icon-menu\">\n                        <button class=\"c-menu-elm confirm-ajax\" data-confirm_txt=\"\u6DFB\u4ED8\u753B\u50CF\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F\"\n                        data-ajax_func=\"delete-message-img\" data-img_name=\"").concat(s3name, "\" data-msg_id=\"").concat(msg_id, "\">\n                            <i class=\"fa-solid fa-trash-can\"></i>\n                        </button>\n                    </div>\n                </li>");
  };
  var img_list_html = "";
  if (msg.files.img.length == 3) {
    img_list_html += return_img_li(msg.files.img[0].base64, msg.files.img[0].s3name, msg.id);
    img_list_html += "<div class=\"flex-item-wrap--column\">\n                ".concat(return_img_li(msg.files.img[1].base64, msg.files.img[1].s3name, msg.id), "\n                ").concat(return_img_li(msg.files.img[2].base64, msg.files.img[2].s3name, msg.id), "\n            </div>");
  } else {
    msg.files.img.map(function (img) {
      img_list_html += return_img_li(img.base64, img.s3name, msg.id);
    });
  }

  // 資料リストを作成
  var dcmnt_list_html = "";
  msg.files.dcmnt.map(function (dcmnt) {
    dcmnt_list_html += "<li class=\"p-index-main__dcmnt-wrap c-menu-wrap\">\n                ".concat(dcmnt.s3name.includes(".pdf") ? "<i class='fa-regular fa-file-pdf'></i>" : "<i class='fa-solid fa-file-signature'></i>", "\n                <div class=\"p-index-main__dcmnt-info u-string-shortener\">\n                    <a href=\"").concat(dcmnt.url, "\" download=\"").concat(dcmnt.true_name, "\" target=\"_blank\" rel=\"noopener noreferrer\">\n                        ").concat(dcmnt.true_name, "\n                    </a>\n                    <p>").concat(dcmnt.size, "</p>\n                </div>\n                <div class=\"c-corner-icon-menu\">\n                    <button class=\"c-menu-elm confirm-ajax\" data-confirm_txt=\"\u6DFB\u4ED8\u30D5\u30A1\u30A4\u30EB\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F\"\n                    data-ajax_func=\"delete-message-dcmnt\" data-dcmnt_name=\"").concat(dcmnt.s3name, "\" data-msg_id=\"").concat(msg.id, "\">\n                        <i class=\"fa-solid fa-trash-can\"></i>\n                    </button>\n                </div>\n            </li>");
  });

  // 画像・資料リストをファイル全体のwrapに格納
  var file_wrap_html = img_list_html || dcmnt_list_html ? "<div class=\"p-index-main__msg-file-wrap row\">\n            ".concat(msg.files.img.length ? "<ul class=\"msg-img-flex-box msg-img-flex-box--".concat(msg.files.img.length, "\">").concat(img_list_html, "</ul>") : "", "\n            ").concat(msg.files.dcmnt.length ? "<ul class=\"p-index-main__msg-dcmnt-list\">".concat(dcmnt_list_html, "</ul>") : "", "\n        </div>") : "";

  // *** メッセージ一覧に新メッセージの内容を反映(上記で生成したファイルリストも統合) ***
  $('.p-index-main__msg-list').append("<li id=\"msg-".concat(msg.id, "\">\n            <div class=\"p-index-main__sender-image-wrap\">\n                <div class=\"p-index-main__sender-image c-btn\">\n                    ").concat(sender_b64 ? "<img src=\"".concat(sender_b64, "\" alt=\"").concat(msg.sender_name, "\">") : "<i class='fa-solid fa-user'></i>", "\n                </div>\n            </div>\n            <div class=\"p-index-main__msg-content\">\n                <div class=\"p-index-main__msg-posting-info\">\n                    <span class=\"username u-string-shortener\">").concat(msg.sender_name, "</span>\n                    <span class=\"date\">").concat(msg.pricise_date, "</span>\n                    ").concat(msg.sender_name == $('#user-name').val() ? "<button class=\"p-index-main__msg-manager p-index-main__msg-mdl-opener\"\n                        data-msg_id=\"".concat(msg.id, "\" onclick=\"open_msg_txtarea(this)\">\n                            <i class=\"fa-regular fa-pen-to-square\"></i>\n                        </button>\n                        <button class=\"p-index-main__msg-manager msg-delete-btn confirm-ajax\" data-confirm_txt=\"\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F\" data-ajax_func=\"delete-message\" data-msg_id=\"").concat(msg.id, "\">\n                            <i class=\"fa-solid fa-trash-can\"></i>\n                        </button>") : "", "\n                </div>\n                ").concat(msg.content ? "<div class=\"p-index-main__msg-text-wrap\">\n                        <p>".concat(msg.content, "</p>\n                    </div>") : "", "\n                ").concat(file_wrap_html, "\n            </div>\n            <div ></div>\n        </li>"));
};

// 日付を区切るボーダーを挿入します
insert_date_partition = function insert_date_partition(date) {
  $('.p-index-main__msg-list').append("<div class=\"p-index-main__date-partition\">".concat(date, "</div>"));
};

// 複数メッセージの内容を反映します
reflect_channel_messages = function reflect_channel_messages(msg_data) {
  var is_chnl_switch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!msg_data.messages.length) return;
  var prev_date = msg_data.messages[0].date;
  msg_data.messages.forEach(function (m, index) {
    // 日付を区切るボーダーを挿入
    // ・チャンネル切替時に先頭メッセージの場合
    // ・直前のメッセージの日付の翌日の場合
    if (is_chnl_switch && index == 0 || m.date > prev_date) {
      insert_date_partition(m.date);
      prev_date = m.date;
    }
    display_message(m, m.sender_name in msg_data.sender_b64 ? msg_data.sender_b64[m.sender_name] : "");
  });
};

/*---------------
|   #チャンネル   |
---------------*/

// HELPER -------------------------------------------------------------------

// インプット、アウトプット欄を別のチャンネル用に初期化
set_up_input_output = function set_up_input_output(chnl_id, chnl_name) {
  $('.p-index-main__output').html("<div class=\"p-index-main__output-header\">Welcome to<br>".concat(chnl_name, "</div>\n        <ul class=\"p-index-main__msg-list\"></ul>"));
  $('#add-message-form').data('chnl_id', chnl_id);
};

// インプット、アウトプット欄を無効化
clear_input_output = function clear_input_output() {
  $('.p-index-main__output').empty();
  $('.p-index-main__input').addClass('u-dn');
};

// ヘッダーのトップチャンネルバナーをチャンネルの有無で変更
change_header_channel_banner = function change_header_channel_banner(status) {
  // チャンネルが存在しなくなった場合、チャンネル生成ボタンのみを設置
  if (status == "clear") {
    $('.l-header__channel-banner').remove();
    $('.l-header__channel-list').remove();
    $('.l-header__leftmenu').append("<button class=\"l-header__channel-banner u-dn-pc col-sp-11\" onclick=\"open_modal_with_closer_id('add-channel')\">\n                <i class=\"fa-solid fa-plus fa-chevron-down fa-chevron-up\"></i>\n                <p class=\"l-header__channel-name u-string-shortener\">Create Channel</p>\n            </button>");

    // 空の状態からチャンネルを追加した場合、ヘッダーのチャンネルリストを生成
  } else if (status == "initial") {
    $('.l-header__channel-banner').remove();
    $('.l-header__leftmenu').append("<button class=\"l-header__channel-banner u-dn-pc col-sp-11 toggler\">\n                <i class=\"fa-solid fa-chevron-up\"></i>\n                <p class=\"l-header__channel-name u-string-shortener\"></p>\n            </button>\n            <ul class=\"l-header__channel-list u-dn-pc tgl-reactor\" id=\"header-channel-list\">\n                <button class=\"p-index__channel-header modal-opener\"\n                onclick=\"open_modal_with_closer_id('add-channel')\">\n                    <p class=\"p-index__channel-name\">Create Channel</p>\n                    <i class=\"fa-solid fa-plus\"></i>\n                </button>\n            </ul>");
  }
};

// ヘッダー、サイドメニューのチャンネルリストにチャンネルバナーを追加
add_new_channel_banner = function add_new_channel_banner(chnl_id, chnl_name) {
  // サイドメニュー
  $('#side-channel-list').append("<li class=\"p-index__channel-wrap row\" id=\"side-channel--".concat(chnl_id, "\" data-chnl_id=\"").concat(chnl_id, "\">\n            <div class=\"p-index__channel-name-wrap col-tab-20\"\n            onclick=\"execute_channel_switch(this.parentNode)\">\n                <div class=\"hash-mark\"><i class=\"fa-solid fa-hashtag\"></i></div>\n                <p class=\"channel-name u-string-shortener\">").concat(chnl_name, "</p>\n            </div>\n            <button class=\"p-index__channel-invite-btn col-tab-2\">\n                <i class=\"fa-solid fa-user-plus\"></i>\n            </button>\n            <button class=\"p-index__channel-setting-btn col-tab-2 modal-opener\"\n            onclick=\"prefill_channel_update(this.parentNode); open_modal_with_closer_id('update-channel')\">\n                <i class=\"fa-solid fa-gear\"></i>\n            </button>\n        </li>"));
  // ヘッダー
  $('#header-channel-list').append("<li class=\"p-index__channel-wrap row\" id=\"header-channel--".concat(chnl_id, "\" data-chnl_id=\"").concat(chnl_id, "\">\n            <div class=\"p-index__channel-name-wrap col-sp-20\"\n            onclick=\"execute_channel_switch(this.parentNode)\">\n                <div class=\"hash-mark\"><i class=\"fa-solid fa-hashtag\"></i></div>\n                <p class=\"channel-name u-string-shortener\">").concat(chnl_name, "</p>\n            </div>\n            <button class=\"p-index__channel-invite-btn col-sp-2\">\n                <i class=\"fa-solid fa-user-plus\"></i>\n            </button>\n            <button class=\"p-index__channel-setting-btn col-sp-2 modal-opener\"\n            onclick=\"prefill_channel_update(this.parentNode); open_modal_with_closer_id('update-channel')\">\n                <i class=\"fa-solid fa-gear\"></i>\n            </button>\n        </li>"));
};

// チャンネルリスト内のバナーのUIを変更
// ・指定id値をID属性に持つチャンネルバナーをactivate
// ・ヘッダーのトップチャンネルバナーをactivateさせたチャンネル名に変更
change_channel_active_status = function change_channel_active_status() {
  var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var chnl_name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  // チャンネルリスト内で現在位置のチャンネルのアクティブステータスをoff
  if ($('.u-active-item')) $('.u-active-item').removeClass("u-active-item");
  if (id) {
    $("#side-channel--".concat(id)).addClass("u-active-item");
    $("#header-channel--".concat(id)).addClass("u-active-item");
  }
  if (chnl_name) $('.l-header__channel-name').text("# " + chnl_name);
};

// #チャンネル切替用 -------------------------------------------------------------

execute_channel_switch = function execute_channel_switch(elm) {
  if (elm.classList.contains("u-active-item")) return;
  loading();
  var id = elm.dataset.chnl_id;
  $.ajax({
    type: 'GET',
    url: "/channel/".concat(id, "/switch")
  }).done(function (data) {
    if (data.result) {
      change_channel_active_status(id, data.chnl_name);
      set_up_input_output(id, data.chnl_name);
      reflect_channel_messages(data.msg_data, true);
      reset_conifrm_ajax();
      // アウトプット欄最下部までスクロール
      scroll_to_bottom();
      // 切り替えたチャンネルの既存メッセージ数を記憶
      msg_list_length = data.msg_data.messages.length;
    }
    loaded();
  });
};

// #チャンネル追加用 -------------------------------------------------------------

execute_channel_addition = function execute_channel_addition() {
  chnl_name = $('#add-channel--name').val();
  $.ajax({
    data: {
      name: chnl_name
    },
    type: 'POST',
    url: "/server/".concat($('#add-channel-form').data('server_id'), "/add_channel")
  }).done(function (data) {
    if (data.result) {
      // チャンネルが存在してなかった場合、input欄を開放、ヘッダーのチャンネルリストを生成
      if (!$('.l-header__leftmenu .p-index__channel-list').length) $('.p-index-main__input').removeClass('u-dn');
      change_header_channel_banner('initial');
      // ヘッダーのトップチャンネルバナーがプルダウンを開けるようtoggle機能を付与
      toggle(get_element('.l-header__channel-banner')[0]);

      // 追加したチャンネル仕様にoutput欄、input欄を変更
      set_up_input_output(data.chnl_id, chnl_name);

      // 追加したチャンネルのバナーをチャンネルリストに追加
      add_new_channel_banner(data.chnl_id, chnl_name);

      // 追加したチャンネルのactive statausをオンに
      change_channel_active_status(data.chnl_id, chnl_name);

      // フォームをクリア
      $('#add-channel--name').val("");
      // チャンネルの追加フォームを閉じる
      $('#modal-closer--add-channel').trigger("click");
    } else {
      $('#error-msg--add-channel-name').text(data.error_msg.name);
    }
  });
};
var ADD_CHANNEL_SUBMIT = $("#add-channel--submit");
if (ADD_CHANNEL_SUBMIT.length) {
  ADD_CHANNEL_SUBMIT.on('click', function () {
    execute_channel_addition();
  });
}

// #チャンネル編集用  -------------------------------------------------------------

execute_channel_update = function execute_channel_update() {
  id = $('#update-channel-form').data('id');
  chnl_name = $('#update-channel--name').val();
  $.ajax({
    data: {
      name: chnl_name
    },
    type: 'POST',
    url: "/channel/".concat(id, "/update")
  }).done(function (data) {
    if (data.result) {
      // サイドメニュー、ヘッダーのチャンネルリストにある対象チャンネルの名前を更新
      $("#side-channel--".concat(id, " .channel-name")).text(chnl_name);
      $("#header-channel--".concat(id, " .channel-name")).text(chnl_name);
      $('#modal-closer--update-channel').trigger("click");
    } else {
      $('#error-msg--update-channel-name').text(data.error_msg.name);
    }
  });
};
var UPDATE_CHANNEL_SUBMIT = $("#update-channel--submit");
if (UPDATE_CHANNEL_SUBMIT.length) {
  UPDATE_CHANNEL_SUBMIT.on('click', function () {
    execute_channel_update();
  });
}

// #チャンネル削除用  -------------------------------------------------------------
execute_channel_delete = function execute_channel_delete(id) {
  $.ajax({
    type: 'GET',
    url: "/channel/".concat(id, "/delete")
  }).done(function (data) {
    if (data.result) {
      var was_active_item = $("#side-channel--".concat(id)).hasClass('u-active-item');

      // サイドバー、ヘッダーのチャンネルリスト内から消去
      $("#side-channel--".concat(id)).remove();
      $("#header-channel--".concat(id)).remove();
      if (was_active_item) {
        // 削除したのが最後のチャンネルなら、output欄を空に、input欄を閉鎖
        if (!$('.p-index__channel-list li').length) {
          clear_input_output();
          change_header_channel_banner('clear');
          // 他にチャンネルが存在すれば、先頭のチャンネルに切替
        } else {
          execute_channel_switch(get_element('.p-index__channel-list li')[0]);
        }
      }
      $('#modal-closer--update-channel').trigger("click");
    }
  });
};

/*---------------
|   #メッセージ   |
---------------*/

// HELPER -------------------------------------------------------------------

remove_msg_elm = function remove_msg_elm(id) {
  var prev_elm = $("#msg-".concat(id)).prev();
  var next_elm = $("#msg-".concat(id)).next();
  if (prev_elm.hasClass('p-index-main__date-partition') && (!next_elm.length || next_elm.hasClass('p-index-main__date-partition'))) prev_elm.remove();
  $("#msg-".concat(id)).remove();
};

// #メッセージ追加用 (text欄ENTERで発火するため form.js で起動)  -----------------------

execute_message_addition = function execute_message_addition(chnl_id, content) {
  var file_list = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  data = {
    content: content,
    file_list: file_list
  };
  json = JSON.stringify(data);
  $.ajax({
    data: json,
    contentType: 'application/json',
    type: 'POST',
    url: "/channel/".concat(chnl_id, "/post_msg")
  }).done(function (data) {
    if (data.result) {
      // 最終の日付ボーダーから日付が変わっている場合、新しいボーダーを挿入
      if (!$('.p-index-main__msg-list').children().length || $('.p-index-main__date-partition').length && data.message.date > $('.p-index-main__date-partition').last().text()) insert_date_partition(data.message.date);

      // メッセージを反映
      display_message(data.message, data.message.sender_img ? data.message.sender_img : "");
      // 反映したメッセージのconifrmが起動できるように仕掛けを施す
      var target = get_element("#msg-".concat(data.message.id, " .confirm-ajax"));
      target.map(function (act) {
        return add_confirm_ajax(act);
      });

      // output欄の下までスクロール
      scroll_to_bottom();

      // 既存メッセージ数に追加分を加算
      msg_list_length += 1;
    }
  });
};
trigger_message_addition = function trigger_message_addition() {
  var chnl_id = $('.u-active-item').data("chnl_id");
  var content = $('#add-message--content').val();
  var files = $('#add-message--files')[0].files;
  // メッセージフォームをクリア
  $('#add-message--content').val("");
  if (files.length) {
    var file_list = [];
    var length = files.length;
    var _loop = function _loop(i) {
      var READER = new FileReader();
      var filename = files[i].name;
      READER.onload = function (e) {
        file_list.push({
          name: filename,
          base64: e.currentTarget.result
        });
        if (i === length - 1) {
          execute_message_addition(chnl_id, content, file_list);
          clear_msg_file_input();
        }
      };
      READER.readAsDataURL(files[i]);
    };
    for (var i = 0; i < files.length; i++) {
      _loop(i);
    }
  } else {
    execute_message_addition(chnl_id, content);
  }
};

// #メッセージ編集用 (text欄ENTERで発火するため form.js で起動)  -----------------------
execute_message_edit = function execute_message_edit(id) {
  var content = $('#update-message--content').val().trim();
  $.ajax({
    data: {
      content: content
    },
    type: 'POST',
    url: "/message/".concat(id, "/update")
  }).done(function (data) {
    if (data.result) {
      $("#msg-".concat(id, " .p-index-main__msg-text-wrap p")).first().text(content);
      close_msg_txtarea();
    }
  });
};

// #メッセージ削除用  -------------------------------------------------------------
execute_message_delete = function execute_message_delete(id) {
  $.ajax({
    type: 'GET',
    url: "/message/".concat(id, "/delete")
  }).done(function (data) {
    if (data.result) {
      remove_msg_elm(id);
    }
  });
};

// #メッセージファイル削除用  -------------------------------------------------------

execute_message_file_delete = function execute_message_file_delete(type, msg_id, file_name, target) {
  $.ajax({
    type: 'GET',
    url: "/file/".concat(file_name, "/delete")
  }).done(function (data) {
    if (data.result) {
      target.remove();
      if (type == "img") {
        var img_box = $("#msg-".concat(msg_id, " .msg-img-flex-box"));
        var imgs = $("#msg-".concat(msg_id, " .msg-img-flex-box img"));
        if (imgs.length) {
          img_box.removeClass();
          img_box.addClass("msg-img-flex-box msg-img-flex-box--".concat(imgs.length));
          if (imgs.length == 2 || imgs.length == 3) {
            var flex_items = $("#msg-".concat(msg_id, " .msg-img-flex-box .flex-item"));
            img_box.empty();
            if (imgs.length == 2) {
              for (var i = 0; i < flex_items.length; i++) {
                img_box.append(flex_items[i]);
              }
            } else {
              var column_wrap = $('<div>').addClass('flex-item-wrap--column');
              column_wrap.append(flex_items[1], flex_items[2]);
              img_box.append(flex_items[0], column_wrap);
            }
          }
        } else {
          img_box.remove();
        }
      } else if (type == "dcmnt") {
        var dcmnts = $("#msg-".concat(msg_id, " .p-index-main__msg-dcmnt-list .p-index-main__dcmnt-wrap"));
        if (!dcmnts.length) {
          $("#msg-".concat(msg_id, " .p-index-main__msg-dcmnt-list")).remove();
        }
      }

      // テキスト欄、画像欄、資料欄が無い場合、メッセージを削除
      if (!$("#msg-".concat(msg_id, " .msg-img-flex-box")).length && !$("#msg-".concat(msg_id, " .p-index-main__msg-dcmnt-list")).length && !$("#msg-".concat(msg_id, " .p-index-main__msg-text-wrap")).length) {
        remove_msg_elm(msg_id);
      }
    }
  });
};

// #メッセージ自動更新 -------------------------------------------------------------

execute_update_message_list = function execute_update_message_list() {
  // メッセージリストが存在しない(チャット画面がない)場合、自動更新を無効
  if (!$('.p-index-main__msg-list').length) return;
  var msg_list = $('.p-index-main__msg-list').children();
  var latest_id = msg_list.length ? msg_list.last().attr('id').slice(4) : 0;
  $.ajax({
    data: {
      latest_id: latest_id
    },
    type: 'POST',
    url: "/channel/".concat($('.u-active-item').first().data('chnl_id'), "/auto_update")
  }).done(function (data) {
    if (data.result) reflect_channel_messages(data.msg_data);
  });
};
$(function () {
  // setInterval(execute_update_message_list, 5000);
});

/*-------------
|   #ユーザー   |
-------------*/

// #ユーザー画像変更  -------------------------------------------------------------

var USER_IMAGE = $('.p-index-main__user-image');
var SIDE_USER_IMAGE = $('.p-index__side-user-image');
var UPDATE_USER_IMAGE_FORM = $('#update-account--image-form');
var MODAL_CLOSER_USER_IMAGE = $('#modal-closer--update-account-image');
execute_account_image_update = function execute_account_image_update(form_data) {
  $.ajax({
    data: form_data,
    type: 'POST',
    url: '/update_account_image'
  }).done(function (data) {
    if (data.result) {
      if (form_data.b64) {
        var img_html = "<img src=\"".concat(form_data.b64, "\" alt=\"\" data-status=\"off\">");
        USER_IMAGE.html(img_html);
        if (SIDE_USER_IMAGE.length) SIDE_USER_IMAGE.html(img_html);
      } else {
        var icon_html = "<i class='fa-solid fa-user'></i>";
        USER_IMAGE.html(icon_html);
        if (SIDE_USER_IMAGE.length) SIDE_USER_IMAGE.html(icon_html);
      }
      MODAL_CLOSER_USER_IMAGE.trigger('click');
      toggle_form_disabled(UPDATE_USER_IMAGE_FORM);
    }
  });
};
var UPDATE_ACCOUNT_IMAGE_SUBMIT = $("#update-account--image-submit");
if (UPDATE_ACCOUNT_IMAGE_SUBMIT.length) {
  UPDATE_ACCOUNT_IMAGE_SUBMIT.on('click', function () {
    toggle_form_disabled(UPDATE_USER_IMAGE_FORM);
    var files = $('#update-account--image')[0].files;
    var form_data = {
      b64: files.length ? $('#update-account--image-form img').first().attr('src') : "",
      filename: files.length ? files[0].name : "",
      image_delete: $('#update-account--image-delete').val()
    };
    if (form_data.b64 || form_data.filename || form_data.image_delete) execute_account_image_update(form_data);
  });
}

// #ユーザー名変更  -------------------------------------------------------------

var USER_INFO_NAME = $('#user-info--name');
var USER_SIDE_INFO_NAME = $('.p-index__user-action-list p');
var UPDATE_USER_NAME_FORM = $('#update-account--name-form');
var UPDATE_USER_NAME = $('#update-account--name');
var UPDATE_USER_NAME_PSW = $('#update-account--name-psw');
var ERROR_MSG_UPDATE_USER_NAME = $('#error-msg--update-account-name');
var ERROR_MSG_UPDATE_USER_NAME_PSW = $('#error-msg--update-account-name-psw');
var MODAL_CLOSER_UPDATE_ACCOUNT_NAME = $('#modal-closer--update-account-name');
execute_user_name_update = function execute_user_name_update() {
  var new_user_name = UPDATE_USER_NAME.val().trim();
  $.ajax({
    data: {
      name: new_user_name,
      psw: UPDATE_USER_NAME_PSW.val()
    },
    type: 'POST',
    url: '/update_account_name'
  }).done(function (data) {
    if (data.result) {
      USER_INFO_NAME.text(new_user_name);
      if (USER_SIDE_INFO_NAME.length) USER_SIDE_INFO_NAME.text(new_user_name);
      MODAL_CLOSER_UPDATE_ACCOUNT_NAME.trigger('click');
    } else {
      ERROR_MSG_UPDATE_USER_NAME.text(data.error_msg.name);
      ERROR_MSG_UPDATE_USER_NAME_PSW.text(data.error_msg.psw);
    }
    toggle_form_disabled(UPDATE_USER_NAME_FORM);
  });
};
var UPDATE_ACCOUNT_NAME_SUBMIT = $("#update-account--name-submit");
if (UPDATE_ACCOUNT_NAME_SUBMIT.length) {
  UPDATE_ACCOUNT_NAME_SUBMIT.on('click', function () {
    toggle_form_disabled(UPDATE_USER_NAME_FORM);
    execute_user_name_update();
  });
}

// #ユーザーメアド変更  -------------------------------------------------------------

var USER_INFO_EMAIL = $('#user-info--email');
var UPDATE_USER_EMAIL_FORM = $('#update-account--email-form');
var UPDATE_USER_EMAIL = $('#update-account--email');
var UPDATE_USER_EMAIL_PSW = $('#update-account--email-psw');
var ERROR_MSG_UPDATE_USER_EMAIL = $('#error-msg--update-account-email');
var ERROR_MSG_UPDATE_USER_EMAIL_PSW = $('#error-msg--update-account-email-psw');
var MODAL_CLOSER_UPDATE_ACCOUNT_EMAIL = $('#modal-closer--update-account-email');
execute_user_email_update = function execute_user_email_update() {
  $.ajax({
    data: {
      email: UPDATE_USER_EMAIL.val().trim(),
      psw: UPDATE_USER_EMAIL_PSW.val()
    },
    type: 'POST',
    url: '/update_account_email'
  }).done(function (data) {
    if (data.result) {
      USER_INFO_EMAIL.text(UPDATE_USER_EMAIL.val().trim());
      MODAL_CLOSER_UPDATE_ACCOUNT_EMAIL.trigger('click');
    } else {
      ERROR_MSG_UPDATE_USER_EMAIL.text(data.error_msg.email);
      ERROR_MSG_UPDATE_USER_EMAIL_PSW.text(data.error_msg.psw);
    }
    toggle_form_disabled(UPDATE_USER_EMAIL_FORM);
  });
};
var UPDATE_ACCOUNT_EMAIL_SUBMIT = $('#update-account--email-submit');
if (UPDATE_ACCOUNT_EMAIL_SUBMIT.length) {
  UPDATE_ACCOUNT_EMAIL_SUBMIT.on('click', function () {
    toggle_form_disabled(UPDATE_USER_EMAIL_FORM);
    execute_user_email_update();
  });
}

// #ユーザーパスワ変更  --------------------------------------------------------------

var UPDATE_USER_PSW_FORM = $('#update-account--psw-form');
var UPDATE_USER_NEW_PSW = $('#update-account--new-psw');
var UPDATE_USER_CONF_PSW = $('#update-account--conf-psw');
var UPDATE_USER_PREV_PSW = $('#update-account--prev-psw');
var ERROR_MSG_UPDATE_USER_NEW_PSW = $('#error-msg--update-account-new-psw');
var ERROR_MSG_UPDATE_USER_PREV_PSW = $('#error-msg--update-account-prev-psw');
var MODAL_CLOSER_UPDATE_ACCOUNT_PSW = $('#modal-closer--update-account-password');
execute_user_psw_update = function execute_user_psw_update() {
  $.ajax({
    data: {
      psw: UPDATE_USER_NEW_PSW.val(),
      conf_psw: UPDATE_USER_CONF_PSW.val(),
      prev_psw: UPDATE_USER_PREV_PSW.val()
    },
    type: 'POST',
    url: '/update_account_password'
  }).done(function (data) {
    if (data.result) {
      MODAL_CLOSER_UPDATE_ACCOUNT_PSW.trigger('click');
    } else {
      ERROR_MSG_UPDATE_USER_NEW_PSW.text(data.error_msg.psw);
      ERROR_MSG_UPDATE_USER_PREV_PSW.text(data.error_msg.prev_psw);
    }
    toggle_form_disabled(UPDATE_USER_PSW_FORM);
  });
};
var UPDATE_ACCOUNT_PSW_SUBMIT = $('#update-account--psw-submit');
if (UPDATE_ACCOUNT_PSW_SUBMIT.length) {
  UPDATE_ACCOUNT_PSW_SUBMIT.on('click', function () {
    toggle_form_disabled(UPDATE_USER_PSW_FORM);
    execute_user_psw_update();
  });
}

/***/ }),

/***/ "./js/ui/banner.js":
/*!*************************!*\
  !*** ./js/ui/banner.js ***!
  \*************************/
/***/ (() => {

/* banner.js */

// bannerの
var HEADER_CHANNEL_BANNER = get_element(".l-header__channel-banner")[0];
var CHANNEL_BANNER_ICON = get_element("i", HEADER_CHANNEL_BANNER)[0];
var set_banner_events = function set_banner_events() {
  HEADER_CHANNEL_BANNER.addEventListener('click', function () {
    CHANNEL_BANNER_ICON.classList.toggle("fa-chevron-down");
    CHANNEL_BANNER_ICON.classList.toggle("fa-chevron-up");
  });
};
if (typeof HEADER_CHANNEL_BANNER != "undefined") set_banner_events();

/***/ }),

/***/ "./js/ui/confirm.js":
/*!**************************!*\
  !*** ./js/ui/confirm.js ***!
  \**************************/
/***/ (() => {

// confirm.js

conifrm_url = function conifrm_url() {
  if (get_element(".confirm")[0]) {
    var confirm_btn_list = get_element(".confirm");
    confirm_btn_list.map(function (cb) {
      cb.addEventListener('click', function () {
        var result = confirm(cb.dataset.confirm_txt);
        if (result) location.href = cb.dataset.url;
      });
    });
  }
};
conifrm_url();
CONFIRM_AJAX_BTN_LIST = get_element(".confirm-ajax");
confirm_ajax = function confirm_ajax() {
  var result = confirm(this.dataset.confirm_txt);
  if (result) {
    if (this.dataset.ajax_func == "delete-server") execute_server_delete(this.dataset.server_id);
    if (this.dataset.ajax_func == "leave-server") execute_server_leave(this.dataset.server_id);
    if (this.dataset.ajax_func == "delete-channel") execute_channel_delete(this.dataset.chnl_id);
    if (this.dataset.ajax_func == "delete-message") execute_message_delete(this.dataset.msg_id);
    if (this.dataset.ajax_func == "delete-message-img") execute_message_file_delete("img", this.dataset.msg_id, this.dataset.img_name, this.parentNode.parentNode);
    if (this.dataset.ajax_func == "delete-message-dcmnt") execute_message_file_delete("dcmnt", this.dataset.msg_id, this.dataset.dcmnt_name, this.parentNode.parentNode);
    if (this.dataset.ajax_func == "leave-account") {
      execute_leave_account();
    }
  }
};
add_confirm_ajax = function add_confirm_ajax(elm) {
  elm.addEventListener('click', confirm_ajax);
  CONFIRM_AJAX_BTN_LIST.push(elm);
};
set_confirm_ajax = function set_confirm_ajax() {
  CONFIRM_AJAX_BTN_LIST.map(function (cab) {
    cab.addEventListener('click', confirm_ajax);
  });
};
remove_confirm_ajax = function remove_confirm_ajax() {
  CONFIRM_AJAX_BTN_LIST.map(function (cab) {
    cab.removeEventListener('click', confirm_ajax);
  });
};
reset_conifrm_ajax = function reset_conifrm_ajax() {
  remove_confirm_ajax();
  CONFIRM_AJAX_BTN_LIST = get_element(".confirm-ajax");
  set_confirm_ajax();
};
if (CONFIRM_AJAX_BTN_LIST.length) set_confirm_ajax();

/***/ }),

/***/ "./js/ui/file.js":
/*!***********************!*\
  !*** ./js/ui/file.js ***!
  \***********************/
/***/ (() => {

// file.py

var ALLOWED_IMAGE_FORMAT = ["jpg", "jpeg", "png"];
var ALLOWED_FILE_FORMAT = ["jpg", "jpeg", "png", "gif", "pdf", "txt"];

// ファイルの拡張子を返します
get_file_format = function get_file_format(filename) {
  return format = filename.split('.').slice(-1)[0].toLowerCase();
};

// ファイル名が使用可能な拡張子か判定します
validate_format = function validate_format(file, allowed_format) {
  // 複数ファイルの場合
  if (Object.prototype.toString.call(file).slice(8, -1) == "FileList") {
    for (var i = 0; i < file.length; i++) {
      var _format = get_file_format(file[i].name);
      if (!allowed_format.includes(_format)) return false;
    }
    return true;
  } else {
    var _format2 = get_file_format(file.name);
    return allowed_format.includes(_format2);
  }
};

// ファイル容量が最大値を超えないか判定します
// 単一画像(プロフィール等) => 5MB
// 複数ファイル(メッセージへの添付等) => 合計で25MB
validate_size = function validate_size(file) {
  var second_files = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  try {
    // 複数ファイルの場合
    if (Object.prototype.toString.call(file).slice(8, -1) == "FileList") {
      var file_size = 0;
      for (var i = 0; i < file.length; i++) file_size += file[i].size;
      // メッセージへの添付の場合、選択済み+追加ファイルの合計を判定
      if (second_files) {
        for (var _i = 0; _i < second_files.length; _i++) {
          file_size += second_files[_i].size;
        }
      }
      return file_size < 20000000;
      //単一画像の場合
    } else {
      return file.size < 5000000;
    }
  } catch (e) {
    return false;
  }
};

/* -----------------------------------------------
|   入力された単一画像のpreviewを表示                 |
|   (例：profile画像)                              |
|   ファイル選択中キャンセル => プレビューの画像も削除    |
------------------------------------------------*/
var FILE_ELM = get_element(".image-input");
var FILENAME_ELM = [];
FILE_ELM.map(function (fe) {
  FILENAME_ELM.push(get_element(".p-form__filename", fe.parentNode)[0]);
});
var IMAGE_ERROR_MSG = get_element(".p-form__image-error-msg");
var IMAGE_WRAP_ELM_NAME = ".image-wrap";
var PREVIEW_ELM = get_element(IMAGE_WRAP_ELM_NAME);

// ユーザー編集フォーム用
var USER_IMAGE = get_element(".p-index-main__user-image")[0];
var USER_IMAGE_DELETE = get_element("#update-account--image-delete");
update_image = function update_image(file, file_index) {
  var file_reader = new FileReader();
  // ロードが終わるとonloadに設定した関数が実行(event : ProgressEvent オブジェクト)
  file_reader.onload = function (event) {
    // event.currentTarget.resultにbase64文字列が入る
    var base64_text = event.currentTarget.result;
    var img = document.createElement("img");
    img.src = base64_text;
    // 指定した要素の中の末尾に挿入
    PREVIEW_ELM[file_index].appendChild(img);
  };
  //ファイルをbase64に変換
  file_reader.readAsDataURL(file);
};
clear_image = function clear_image(file_index) {
  PREVIEW_ELM[file_index].innerHTML = "";
};
update_image_form = function update_image_form() {
  FILE_ELM.map(function (fe) {
    fe.addEventListener('change', function () {
      var file_index = FILE_ELM.indexOf(fe);
      clear_image(file_index);
      // ファイルが存在し、かつフォーマットが指定のものである場合、許容する
      if (fe.files[0] && validate_format(fe.files[0], ALLOWED_IMAGE_FORMAT)) {
        var file = fe.files[0];
        if (FILENAME_ELM[file_index]) FILENAME_ELM[file_index].textContent = file.name;
        update_image(file, file_index);
        IMAGE_ERROR_MSG[file_index].textContent = "";
        USER_IMAGE_DELETE.value = "";
      } else {
        // file名を表示する箇所が存在する場合
        if (FILENAME_ELM[file_index]) FILENAME_ELM[file_index].textContent = "No file chosen";
        // 画像入力がユーザーアカウントの編集だった場合
        if (fe.id == "update-account--image") {
          PREVIEW_ELM[file_index].innerHTML = "<i class='fa-solid fa-user'></i>";
          // 既存の画像がある場合のみ、画像削除のオプションを有効にする
          if (get_element("img", USER_IMAGE)[0]) USER_IMAGE_DELETE.value = true;
        }
        // ファイルの拒否原因がフォーマットのバリデーションによる場合
        if (fe.files[0]) IMAGE_ERROR_MSG[file_index].textContent = "jpg / jpeg / png 形式の画像のみご使用いただけます。";
      }
    });
  });
};
if (FILE_ELM) update_image_form();

// マイナスボタンを押下すると、単一画像のプレビューとfile inputを空にする
var FORMS_WITH_SOLE_PREVIEW = get_element(["#update-account--image-form"]);
var IMAGE_DELETE = get_element(["#update-account--image-delete"]);
FORMS_WITH_SOLE_PREVIEW.map(function (fwsp) {
  var preview_clearer = get_element(".p-form__clear-circle-preview", fwsp)[0];
  var img_wrap = get_element(".image-wrap", fwsp)[0];
  var img_input = get_element(".image-input", fwsp)[0];
  var img_delete = IMAGE_DELETE[FORMS_WITH_SOLE_PREVIEW.indexOf(fwsp)];
  preview_clearer.addEventListener('click', function () {
    img_wrap.innerHTML = "<i class='fa-solid fa-user'></i>";
    img_input.value = "";
    if (get_element("img", USER_IMAGE)[0]) img_delete.value = true;
  });
});

/* -----------------------------------------------
|   inputタグを用いたFileListオブジェクトの操作        |
|   複数枚のファイルのpreviewを表示                   |
|   (例：メッセージに添付するファイル達)                |
|   ゴミ箱アイコン押下 => 指定ファイルの削除            |
|   //? ・送信前にファイル編集する？ => (保留)
|   //?    => ファイル名
|   //?    => 補足説明 (modelの改修いるからだるそう)
|   //! 注意モーダルが2回目ひらけない => 同ファイル選択でinputが更新されてないだけ
|   //! ↑と同じ 同ファイルを選択した場、inputの中身は変化ないため、追加にならない
|   //!   => 同ファイル選択ではなく、アップロード済みの内容と同じファイル内容を選択した場合と判明
|   /////! 関係ないけど、entry funcのモーダル開かなくなってる => なんか直っとる
|   //* FileListオブジェクトについて
|   //* ・配列のようで配列ではない
|   //* ・FileListオブジェクトから指定要素のみの削除、および追加は不可
|   //* ・上記を行う場合、datatransferを用いて、抽出したfileをFileListに再構築
------------------------------------------------*/

// previewを格納するリストタグ
var PREVIEW_LIST = get_element(".p-form__preview-list")[0];

// 受け取ったファイルのpreviewを追加します
insert_file_preview = function insert_file_preview(file) {
  var file_reader = new FileReader();
  file_reader.onload = function (event) {
    var base64_text = event.currentTarget.result;
    var random = Math.floor(Math.random() * 10000000);
    var file_format = get_file_format(file.name);
    var thumnail_tag = "";
    if (validate_format(file, ALLOWED_IMAGE_FORMAT)) {
      thumnail_tag = "<img src=\"".concat(base64_text, "\" alt=\"\u9078\u629E\u4E2D\u306E\u753B\u50CF\"> ");
    } else if (file_format == "pdf") {
      thumnail_tag = "<i class=\"fa-regular fa-file-pdf\"></i>";
    } else if (file_format == "txt") {
      thumnail_tag = "<i class=\"fa-solid fa-file-signature\"></i>";
    }
    html = "<div class=\"p-form__file-block c-menu-wrap\" id=\"preview-".concat(random, "\">\n                <div class=\"p-form__image-wrap\">").concat(thumnail_tag, "</div>\n                <div class=\"p-form__filename\">").concat(file.name, "</div>\n                <div class=\"p-form__file-menu c-corner-icon-menu\">\n                    <button class=\"p-form__file-dumper c-menu-elm\" data-id=\"preview-").concat(random, "\" onclick=\"dump_file_preview(this)\">\n                        <i class=\"fa-solid fa-trash-can\"></i>\n                    </button>\n                </div>\n            </div>");
    var li_element = document.createElement("li");
    li_element.innerHTML = html;
    // 指定した要素の中の末尾に挿入
    PREVIEW_LIST.appendChild(li_element);
  };
  //ファイルをbase64に変換
  file_reader.readAsDataURL(file);
};

// ファイルをアップロードするinputタグ
var FILE_INPUT = get_element("#add-message--files");
var FILE_LIST = []; // アップロードされたファイルをバックアップ
var PREVIEW_SHOWCASE = get_element(".p-form__preview-showcase")[0];

// inputタグ内のFileListの操作およびpreviewの表示を行います
manipulate_msg_filelist = function manipulate_msg_filelist() {
  // ファイルがアップロードされた場合、FileListの追加およびpreviewを追加
  FILE_INPUT.addEventListener('change', function (e) {
    // 更新されたFileListオブジェクト
    var files = e.target.files;
    // 抽出したFileオブジェクトを格納して、FileListを再構築してくれます
    var dt = new DataTransfer();

    // FileListオブジェクトの中身があるか判定
    if (files[0]) {
      // 拡張子が利用可能なものか判定
      if (!validate_format(files, ALLOWED_FILE_FORMAT)) {
        open_modal_with_closer_id("unavailable-format");

        // 添付ファイルが最大数(10)を上回らないか判定
      } else if (FILE_LIST.length + files.length > 10) {
        open_modal_with_closer_id("too-many-uploads");

        // 添付ファイルが最大容量(25MB)を上回らないか判定
      } else if (!validate_size(files, FILE_LIST)) {
        open_modal_with_closer_id("too-large-data");
      } else {
        // datatransferにfile_list内の既存ファイルを追加
        for (var i = 0; i < FILE_LIST.length; i++) {
          dt.items.add(FILE_LIST[i]);
        }
        // datatransferにアップロードファイルを追加
        // FILE_LISTにアップロードファイルを追加
        for (var _i2 = 0; _i2 < files.length; _i2++) {
          dt.items.add(files[_i2]);
          FILE_LIST.push(files[_i2]);
          // 各アップロードのpreviewをPREVIEW_LISTに挿入
          insert_file_preview(files[_i2]);
        }
      }

      // dataransfer内で再構築したFileListをinputタグに挿入 
      e.target.files = dt.files;

      // previewの枠を 非表示 => 表示
      PREVIEW_SHOWCASE.classList.remove("u-dn");
    }
  });
};
if (FILE_INPUT) manipulate_msg_filelist();

// previewのゴミ箱押下 => 該当のpreviewを破棄します (html内onclick)
dump_file_preview = function dump_file_preview(dumper) {
  var dumpers = get_element(".p-form__file-dumper");
  var dumper_idx = dumpers.indexOf(dumper);
  var file_blocks = get_element(".p-form__file-block");
  // previewを囲うliタグを削除
  file_blocks[dumper_idx].parentNode.remove();
  // FILE_LIST内の対象となるファイルを削除
  FILE_LIST.splice(dumper_idx, 1);
  // dataransferでFILE_LISTからFileListオブジェクトを再構築し、inputタグに挿入
  var dt = new DataTransfer();
  for (var i = 0; i < FILE_LIST.length; i++) {
    dt.items.add(FILE_LIST[i]);
  }
  FILE_INPUT.files = dt.files;
  // previewが全て削除された場合、previewの枠を非表示
  if (!FILE_LIST[0]) PREVIEW_SHOWCASE.classList += " u-dn";
};

// Previewとファイルフォームを空にします (流用先 ; ajax.js)
clear_msg_file_input = function clear_msg_file_input() {
  FILE_INPUT.value = "";
  FILE_LIST.splice(0, FILE_LIST.length);
  PREVIEW_LIST.innerHTML = "";
  if (!FILE_LIST[0]) PREVIEW_SHOWCASE.classList += " u-dn";
};

/***/ }),

/***/ "./js/ui/flash.js":
/*!************************!*\
  !*** ./js/ui/flash.js ***!
  \************************/
/***/ (() => {

// flash.js

// flashメッセージ内の「×」が押下された際、該当メッセージを削除します
var FLASH_CLOSER = get_element(".l-header__flash-closer");
flash = function flash() {
  FLASH_CLOSER.map(function (fc) {
    fc.addEventListener('click', function () {
      fc.parentNode.remove();
    });
  });
};
if (FLASH_CLOSER[0]) flash();

/***/ }),

/***/ "./js/ui/form.js":
/*!***********************!*\
  !*** ./js/ui/form.js ***!
  \***********************/
/***/ (() => {

// form.js

/* -----------------------------------
|   パスワード入力欄のテキスト可視化します  |
------------------------------------*/

var INPUT_PASSWORD_SET = get_element(["#psw", "#conf", "#add-user--psw", "#add-user--conf", "#update-account--new-psw", "#update-account--conf-psw"]);
var VISUALIZER = get_element("#p-form__password-visualizer");
visualize_password = function visualize_password() {
  if (!INPUT_PASSWORD_SET[0] || !VISUALIZER) return [];
  VISUALIZER.addEventListener('click', function () {
    if (INPUT_PASSWORD_SET[0].type === "password") {
      INPUT_PASSWORD_SET.map(function (pi) {
        if (isElement(pi)) pi.type = "text";
      });
      VISUALIZER.firstElementChild.style.display = "none";
      VISUALIZER.lastElementChild.style.display = "block";
    } else {
      INPUT_PASSWORD_SET.map(function (pi) {
        if (isElement(pi)) pi.type = "password";
      });
      VISUALIZER.firstElementChild.style.display = "block";
      VISUALIZER.lastElementChild.style.display = "none";
    }
  });
};
visualize_password();

/* --------------------------------------------------------------------
|   フォーム内のチェックボックスの状態に応じて対象のinput要素をdisabled化します  |
---------------------------------------------------------------------*/

var CHECKBOXES = get_element(".p-form__disabled-trigger");
var INPUT_USER_NAME = get_element("#add-user--name");
var INPUT_USER_PSW = get_element("#add-user--psw");
var INPUT_USER_PSW_CONF = get_element("#add-user--conf");
var INPUT_UPDATE_SERVER_IMAGE = get_element("#update-server--image");

// チェックボックスの状態に応じて対象をdisabled化します
var checkbox_toggle_disabled = function checkbox_toggle_disabled() {
  var checkbox = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  if (!checkbox || !target) return [];
  if (is_array(target)) {
    target.map(function (trgt) {
      trgt.disabled = checkbox.checked ? true : false;
    });
  } else {
    target.disabled = checkbox.checked ? true : false;
  }
};

// チェックボックスの初期状態に応じて対象のinput要素をdisabled化します
checkbox_set_disabled = function checkbox_set_disabled() {
  CHECKBOXES.map(function (cb) {
    // 名前のdisabled化
    if (cb.id == "admin") {
      checkbox_toggle_disabled(cb, INPUT_USER_NAME);
    }

    // パスワードのdisabled化
    if (cb.id == "psw_disabled") {
      checkbox_toggle_disabled(cb, [INPUT_USER_PSW, INPUT_USER_PSW_CONF]);
    }
  });
  return [];
};

// チェックボックスの変更に応じて対象のinput要素をdisabled化します  (hmtl内onchange)
checkbox_disable_input = function checkbox_disable_input(checkbox) {
  // admin内ユーザー追加 : 名前のdisabled化
  if (checkbox.id == "admin") {
    checkbox_toggle_disabled(checkbox, INPUT_USER_NAME);
  }

  // admin内ユーザー追加 : パスワードのdisabled化
  if (checkbox.id == "psw-disabled") {
    checkbox_toggle_disabled(checkbox, [INPUT_USER_PSW, INPUT_USER_PSW_CONF]);
  }

  // サーバー編集 : 画像アップローダーのdisabled化
  if (checkbox.id == "update-server--delete-image") {
    checkbox_toggle_disabled(checkbox, INPUT_UPDATE_SERVER_IMAGE);
  }
};

/* メッセージ送信フォームの制御 ---------------------------
|   ・一部テキストエリアの入力を、 Enter+Shift で改行、     |
|     Enter でフォームの送信に統一しますテキストエリアの     |
|   ・IME(全角)入力が未確定での、送信を防止します           |
|   ・層複数回送信を防止                                 |
|   ・テキストエリアの自動リサイズ                         |
----------------------------------------------------*/

var is_form_filled = function is_form_filled(target) {
  var file_input = get_element("input[type='file']", target.parentNode)[0];
  var file_wrap = get_element("#msg-".concat(target.dataset.msg_id, " .p-index-main__msg-file-wrap"))[0];
  if (typeof file_input != "undefined") {
    if (target.value.trim() !== "" || file_input.files[0]) return true;
  } else if (typeof file_wrap != "undefined" || target.value.trim() !== "") {
    return true;
  } else {
    return false;
  }
};
var is_composition_completed = function is_composition_completed(e) {
  return e.isComposing ? false : true;
};

// text または textarea のinputで Enter を押下した際の挙動を設定します
var optimize_text_input = function optimize_text_input() {
  window.document.onkeydown = function (e) {
    target = e.target;
    if (target.classList.contains('optimized-text-input') && e.key === 'Enter' && !e.shiftKey) {
      // デフォルトの操作を無効化
      e.preventDefault();
      // テキストまたはファイルが入力されている、かつ日本語入力中でない => フォームを送信
      if (is_form_filled(target) && is_composition_completed(e)) {
        if (target.id == "update-message--content") {
          execute_message_edit(target.dataset.msg_id);
        } else if (target.id == "add-message--content") {
          trigger_message_addition();
        } else if (target.id == "server-search-bar") {
          execute_server_search();
        }
      }
    }
  };
};
if (typeof get_element(".optimized-text-input")[0] != "undefined") {
  optimize_text_input();
}

// デフォルトのメッセージ用テキストエリア
var MSG_TXTAREA = get_element(".p-form__msg-txtarea")[0];

// 入力されたテキストエリアの行数(スクロール幅)に応じて、高さを変更します
auto_resize = function auto_resize(textarea) {
  //textareaの要素の高さを設定
  textarea.style.height = MSG_TXTAREA.clientHeight + 'px';
  //textareaの入力内容の高さを取得
  var scrollHeight = textarea.scrollHeight;
  //textareaの高さに入力内容の高さを設定
  textarea.style.height = scrollHeight + 'px';
};

// メッセージ編集(テキストのみ)フォームを生成、表示します (hmtl内onclick)
open_msg_txtarea = function open_msg_txtarea(opener) {
  // 他に表示中のメッセージ編集欄があれば、閉じる
  if (typeof get_element("#update-message--content") != "undefined") close_msg_txtarea();
  var msg_txt_p = get_element(".p-index-main__msg-text-wrap p", opener.parentNode.parentNode)[0];
  var textarea = document.createElement("textarea");
  textarea.id = "update-message--content";
  textarea.className = "p-form__msg-txtarea optimized-text-input";
  textarea.name = "content";
  textarea.placeholder = "Message";
  textarea.rows = "1";
  textarea.setAttribute('oninput', 'auto_resize(this)');
  textarea.value = msg_txt_p.textContent;
  textarea.dataset.msg_id = opener.dataset.msg_id;
  var cancel_btn = document.createElement("button");
  cancel_btn.textContent = "cancel";
  cancel_btn.className = "p-form__msg-txtarea-closer";
  cancel_btn.setAttribute('onclick', 'close_msg_txtarea()');

  // フォーム、キャンセルボタンをメッセージテキストの隣に挿入
  msg_txt_p.parentNode.after(textarea);
  msg_txt_p.parentNode.after(cancel_btn);
  // メッセージテキストを非表示
  msg_txt_p.parentNode.classList += " u-dn";
  // テキストエリアの高さを調整(行数に合わせる)
  auto_resize(textarea);
};

// メッセージ編集(テキストのみ)フォームを閉じる処理を行います (html内onclick) (流用先 : )
close_msg_txtarea = function close_msg_txtarea() {
  var textarea = get_element("#update-message--content");
  if (typeof textarea != "undefined") {
    textarea.previousElementSibling.previousElementSibling.classList.remove("u-dn");
    get_element(".p-form__msg-txtarea-closer")[0].remove();
    textarea.remove();
  }
};

/* サーバー検索フォームの制御 ------------------------------------
|   ・検索バーがからの時と、入力されている状態でのplaceholderを変更   |
|      - 空 (空白のみも判定) => 虫メガネ                         |
|      - 入力済 => xマーク + 実行方法の示唆                       |
|   ・入力済でxマークを押下した際にフォームをクリア                  |
------------------------------------------------------------*/

var SERVER_SEARCH_BAR = get_element("#server-search-bar");
var INNER_ICON_BLANK = get_element("#p-form__search-bar-status--blank");
var INNER_ICON_FILLED = get_element("#p-form__search-bar-status--filled");

// 検索フォームを空にします (hmtl内onclick)
clear_server_search_bar = function clear_server_search_bar() {
  SERVER_SEARCH_BAR.value = "";
  INNER_ICON_BLANK.classList.remove("u-dn");
  INNER_ICON_FILLED.classList += " u-dn";
};

// 検索フォームの入力に応じてplaceholderを変更します
server_search_bar = function server_search_bar() {
  SERVER_SEARCH_BAR.addEventListener('input', function () {
    if (SERVER_SEARCH_BAR.value.trim() !== "" && !INNER_ICON_BLANK.classList.contains("u-dn")) {
      INNER_ICON_BLANK.classList += " u-dn";
      INNER_ICON_FILLED.classList.remove("u-dn");
    } else if (SERVER_SEARCH_BAR.value.trim() === "" && !INNER_ICON_FILLED.classList.contains("u-dn")) {
      INNER_ICON_BLANK.classList.remove("u-dn");
      INNER_ICON_FILLED.classList += " u-dn";
    }
  });
};
if (SERVER_SEARCH_BAR) server_search_bar();

/* 編集フォームの制御 ----------------------------------------------------------
|   ・フォームが開いた際、以前の入力をリセットしk編集対象の情報をフォーム欄に反映します    |
----------------------------------------------------------------------------*/

// サーバー編集 (hmtl内onclick)
prefill_server_update = function prefill_server_update(server_board) {
  var id = server_board.dataset.id;
  var base64 = get_element("img", server_board)[0] ? get_element("img", server_board)[0].src : null;
  var server_name = get_element(".p-index__server-title", server_board)[0].textContent;
  get_element('#update-server-form').dataset.id = id;
  get_element("#update-server--name").value = server_name;
  get_element("#update-server--image").value = "";
  get_element("#update-server--image").disabled = false;
  if (base64) {
    get_element("#updatet-server--image-wrap").innerHTML = "<img src='".concat(base64, "'>");
    get_element("#update-server--delete-image-wrap").innerHTML = "<input class=\"p-form__checkbox p-form__disabled-trigger\" id=\"update-server--delete-image\" name=\"delete_image\" type=\"checkbox\" value=\"y\" onchange=\"checkbox_disable_input(this)\">\n            <label class=\"p-form__checkbox-label\" for=\"update-server--delete-image\">DELETE IMAGE</label>";
  } else {
    get_element("#updatet-server--image-wrap").innerHTML = "<i class='fa-solid fa-image'></i>";
  }
  get_element("#update-server--delete").dataset.confirm_txt = "\u30B5\u30FC\u30D0\u30FC ".concat(server_name, " \u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F");
  get_element("#update-server--delete").dataset.server_id = id;
  get_element("#error-msg--update-server-name").textContent = "";
  get_element("#update-server-form .p-form__image-error-msg")[0].textContent = "";
};

// channel編集 (hmtl内onclick)
prefill_channel_update = function prefill_channel_update(chnl_wrap) {
  var id = chnl_wrap.dataset.chnl_id;
  var channel_name = get_element(".channel-name", chnl_wrap)[0].textContent.trim();
  get_element('#update-channel-form').dataset.id = id;
  get_element("#update-channel--name").value = channel_name;
  get_element("#update-channel--delete").dataset.confirm_txt = "\u30C1\u30E3\u30F3\u30CD\u30EB ".concat(channel_name, " \u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F");
  get_element("#update-channel--delete").dataset.chnl_id = id;
  get_element("#error-msg--update-channel-name").textContent = "";
};

/* ユーザー編集フォームの制御 -----------------------------------
|   ・フォームの入力をリセットします                              |
|   ・フォームが閉じるタイムラグ(0.5秒未満)の後、UIのリセットを行う   |
-----------------------------------------------------------*/

// プロフィール画像編集
var UPDATE_USER_IMGAE = get_element("#update-account--image");
var UPDATE_USER_IMGAE_WRAP = get_element("#update-account--image-form .image-wrap")[0];
var USER_IMAGE_DELETE = get_element("#update-account--image-delete");
var ERROR_MSG_UPDATE_USER_IMGAE = get_element("#update-account--image-form .p-form__image-error-msg")[0];
var USER_IMAGE = get_element(".p-index-main__user-image")[0];
reset_account_image_form = function reset_account_image_form() {
  UPDATE_USER_IMGAE.value = "";
  USER_IMAGE_DELETE.value = "";
  setTimeout(function () {
    if (get_element("img", USER_IMAGE)[0]) {
      UPDATE_USER_IMGAE_WRAP.innerHTML = "<img src=\"".concat(get_element("img", USER_IMAGE)[0].src, "\" alt=\"\" data-status=\"off\">");
    } else {
      UPDATE_USER_IMGAE_WRAP.innerHTML = "<i class='fa-solid fa-user'></i>";
    }
    ERROR_MSG_UPDATE_USER_IMGAE.textContent = "";
  }, 500);
};

// 名前編集
var UPDATE_USER_NAME = get_element("#update-account--name");
var UPDATE_USER_NAME_PSW = get_element("#update-account--name-psw");
var ERROR_MSG_UPDATE_USER_NAME = get_element('#error-msg--update-account-name');
var ERROR_MSG_UPDATE_USER_NAME_PSW = get_element('#error-msg--update-account-name-psw');
reset_account_name_form = function reset_account_name_form() {
  setTimeout(function () {
    UPDATE_USER_NAME.value = "";
    UPDATE_USER_NAME_PSW.value = "";
    ERROR_MSG_UPDATE_USER_NAME.textContent = "";
    ERROR_MSG_UPDATE_USER_NAME_PSW.textContent = "";
  }, 500);
};

// email編集
var UPDATE_USER_EMAIL = get_element("#update-account--email");
var UPDATE_USER_EMAIL_PSW = get_element("#update-account--email-psw");
var ERROR_MSG_UPDATE_USER_EMAIL = get_element('#error-msg--update-account-email');
var ERROR_MSG_UPDATE_USER_EMAIL_PSW = get_element('#error-msg--update-account-email-psw');
reset_account_email_form = function reset_account_email_form() {
  setTimeout(function () {
    UPDATE_USER_EMAIL.value = "";
    UPDATE_USER_EMAIL_PSW.value = "";
    ERROR_MSG_UPDATE_USER_EMAIL.textContent = "";
    ERROR_MSG_UPDATE_USER_EMAIL_PSW.textContent = "";
  }, 500);
};

// パスワード編集
var UPDATE_USER_NEW_PSW = get_element("#update-account--new-psw");
var UPDATE_USER_CONF_PSW = get_element("#update-account--conf-psw");
var UPDATE_USER_PREV_PSW = get_element("#update-account--prev-psw");
var ERROR_MSG_UPDATE_USER_NEW_PSW = get_element('#error-msg--update-account-new-psw');
var ERROR_MSG_UPDATE_USER_PREV_PSW = get_element('#error-msg--update-account-prev-psw');
reset_account_psw_form = function reset_account_psw_form() {
  setTimeout(function () {
    UPDATE_USER_NEW_PSW.value = "";
    UPDATE_USER_CONF_PSW.value = "";
    UPDATE_USER_PREV_PSW.value = "";
    ERROR_MSG_UPDATE_USER_NEW_PSW.textContent = "";
    ERROR_MSG_UPDATE_USER_PREV_PSW.textContent = "";
  }, 500);
};

/***/ }),

/***/ "./js/ui/load.js":
/*!***********************!*\
  !*** ./js/ui/load.js ***!
  \***********************/
/***/ (() => {

// load.js

loading = function loading() {
  var SPINNER = document.getElementById('loading');
  SPINNER.classList.remove('loaded');
};
loaded = function loaded() {
  var SPINNER = document.getElementById('loading');
  SPINNER.classList.add('loaded');
};
window.onload = function () {
  return loaded();
};

/***/ }),

/***/ "./js/ui/modal.js":
/*!************************!*\
  !*** ./js/ui/modal.js ***!
  \************************/
/***/ (() => {

// modal.js

// モーダル内にある複数画像のスライドを行います
// サムネとメイン画像をそれぞれ配列化した場合、クリックされたサムネの配列位置と同位置となるメイン画像を表示します
modal_img_swapper = function modal_img_swapper() {
  var thumnail_lists = get_element(".modal-thumnails");
  if (!thumnail_lists[0]) return [];
  thumnail_lists.map(function (thum_li) {
    var thum_imgs = get_element("img", thum_li);
    thum_imgs.map(function (thm) {
      thm.addEventListener('click', function () {
        if (thm.dataset.status != "on") {
          var main_imgs = Array.from(get_element(".modal-mainimages", thum_li.parentNode)[0].children);
          var thum_index = thum_imgs.indexOf(thm);
          // サムネの配列位置と同位置となるメイン画像を表示します
          main_imgs.map(function (mn) {
            mn.style.order = main_imgs.indexOf(mn) == thum_index ? "1" : "2";
          });
          // サムネのUIを切り替えます(サムネが一つの場合、切替なし)
          if (thum_imgs.length > 1) toggle_target_data(thm, [], thum_imgs);
        }
      });
    });
  });
};
modal_img_swapper();
var SWITCHER_NAMES__ADD_SERVER = ["entry--create-server", "entry--join-server", "modal--create-server", "modal--join-server"];

// モーダル内のコンテンツ切替を行います (html内onclick)
switch_modal_content = function switch_modal_content(entry) {
  if (SWITCHER_NAMES__ADD_SERVER.includes(entry.id) || SWITCHER_NAMES__ADD_SERVER.includes(entry.parentNode.parentNode.id)) {
    var ADD_MODAL_ENTRIES = {
      "m-add-srvr": get_element("#modal--add-server"),
      "m-crt-srvr": get_element("#modal--create-server"),
      "m-jn-srvr": get_element("#modal--join-server")
    };
    if (entry.id == "entry--create-server") {
      ADD_MODAL_ENTRIES["m-crt-srvr"].classList.remove("u-dn");
      ADD_MODAL_ENTRIES["m-add-srvr"].classList += " u-dn";
    } else if (entry.id == "entry--join-server") {
      ADD_MODAL_ENTRIES["m-jn-srvr"].classList.remove("u-dn");
      ADD_MODAL_ENTRIES["m-add-srvr"].classList += " u-dn";
    } else if (entry.classList.contains("p-modal__content-switch--left")) {
      entry.parentNode.parentNode.classList += " u-dn";
      ADD_MODAL_ENTRIES["m-add-srvr"].classList.remove("u-dn");
    }
  }
};

/***/ }),

/***/ "./js/ui/preload.js":
/*!**************************!*\
  !*** ./js/ui/preload.js ***!
  \**************************/
/***/ (() => {

// preload.js
// 画面更新直後に発生するUIのバグや調整を行います

// アニメーション系プロパティの誤表示を防ぐ要素(.preload)を削除します(Chromのバグが原因だったり)
remove_preload = function remove_preload() {
  var preload = document.querySelectorAll('.u-preload');
  preload.forEach(function (pre) {
    setTimeout(function (e) {
      // 1秒後に削除(プロジェクト内のアニメーション設定は1秒以内であるため)
      pre.classList.remove('u-preload');
    }, 1000);
  });
};
window.addEventListener('load', function () {
  remove_preload();
});

/***/ }),

/***/ "./js/ui/scroll.js":
/*!*************************!*\
  !*** ./js/ui/scroll.js ***!
  \*************************/
/***/ (() => {

// scroll.js

/*  指定要素までの自動スクロールを行います ----------------------------------
|   - イベント発生時に特定の画面位置までスクロールします 
|   - 自動スクロール後にUIの切替が期待される場合、以下フローを辿ります
|     - toggle.js > toggle_target_data() : モーダル開くなどの場合
|   Cautions :
|   - クリック先要素に<a>は指定しない(ページ更新によりスクロール挙動が行われない為)
---------------------------------------------------------------------*/

// scrollのクリック先とスクロール先
var SCL_ELM_NAME_LIST = {
  "#scroll--entry-top": "#p-entry-top",
  "#scroll--entry-about": "#p-entry-about",
  "#scroll--entry-func": "#p-entry-func"
};

// クリック先(key)およびスクロール先(value)の各要素を配列に格納
var SCL_KEY_ELM_LIST = get_element(Object.keys(SCL_ELM_NAME_LIST));
var SCL_TARGET_ELM_LIST = get_element(Object.values(SCL_ELM_NAME_LIST));
scroll = function scroll() {
  if (!SCL_KEY_ELM_LIST[0]) return [];
  SCL_KEY_ELM_LIST.map(function (ke) {
    if (typeof ke !== "undefined") {
      ke.addEventListener('click', function () {
        var ke_idx = SCL_KEY_ELM_LIST.indexOf(ke);
        var rect_top = SCL_TARGET_ELM_LIST[ke_idx].getBoundingClientRect().top;
        var position_y = window.pageYOffset;
        var target = rect_top + position_y;
        var header = get_element("#l-header");
        if (header) target -= header.clientHeight;
        window.scrollTo({
          top: target,
          behavior: 'smooth'
        });
        if (SCL_TOGGLER_LIST[ke.id]) {
          var toggler = document.getElementById(SCL_TOGGLER_LIST[ke.id]);
          var _target = get_element(TGL_TARGET_LIST[toggler.id]);
          toggle_target_data(toggler, _target);
        }
      });
    }
  });
};
if (SCL_KEY_ELM_LIST) scroll();

// メッセージ一覧が初期表示される際、最新メッセージがある位置までスクロール
MSG_OUTPUT = get_element(".p-index-main__output")[0];
reset_msg_output = function reset_msg_output() {
  MSG_OUTPUT = get_element(".p-index-main__output")[0];
};
scroll_to_bottom = function scroll_to_bottom() {
  get_element(".p-index-main__output")[0].scrollTop = MSG_OUTPUT.scrollHeight;
};
if (MSG_OUTPUT) scroll_to_bottom();

/***/ }),

/***/ "./js/ui/slide.js":
/*!************************!*\
  !*** ./js/ui/slide.js ***!
  \************************/
/***/ (() => {

// slide.js

unfold_slide = function unfold_slide(img_tag) {
  var img_list_tag = img_tag.parentNode.parentNode;
  var imgs = get_element("li img", img_list_tag);
  slide_elm_html = "";
  imgs.map(function (img) {
    slide_elm_html += "<li class=\"splide__slide\">\n\t\t\t\t<img src=\"".concat(img.src, "\">\n\t\t\t</li>");
  });
  slide_html = "<div class=\"splide__track\">\n\t\t\t<ul class=\"splide__list\">\n\t\t\t\t".concat(slide_elm_html, "\n\t\t\t</ul>\n\t\t</div>");
  var SLIDE = get_element(".splide")[0];
  var SLIDE_WRAP = get_element(".p-slide-wrap")[0];
  SLIDE.innerHTML = slide_html;
  SLIDE_WRAP.dataset.status = "on";
  OVERLAY.dataset.status = "on";
  BODY.dataset.status = "on";
  var type = imgs.length > 1 ? 'loop' : '';
  var start_index = imgs.indexOf(img_tag);
  var splide = new Splide('.splide', {
    type: type,
    drag: 'free',
    snap: true,
    start: start_index
  });
  splide.mount();
};
close_slide = function close_slide(closer) {
  var SLIDE_WRAP = closer.parentNode;
  SLIDE_WRAP.dataset.status = "off";
  OVERLAY.dataset.status = "off";
  BODY.dataset.status = "off";
};

/***/ }),

/***/ "./js/ui/toggle.js":
/*!*************************!*\
  !*** ./js/ui/toggle.js ***!
  \*************************/
/***/ (() => {

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
/* toggle.js ----------------------------------
|   On/Offで切り替えるUIデザインを操作します。   
|   Rules :
|   - .togglerがクリックされると切替挙動を行います
|   - UIの切替は、.togglerおよび切替要素のdata属性(data-status)に On / Off を指定することで行います
|   - 特定の.togglerと対応する切替要素のハッシュリストはTGL_TARGET_LISTになります(dist/ignored/js/variable.jsにて定義)
|   - target_list構成(1) => key(id名) : [要素名(string), ...]
|   - target_list構成(2) => key(id名) : [[*1], [*2]]
|     - *1 => togglerクラスのdata-statusと同値を所持する要素(例: toggler(on) => on)
|     - *2 => togglerクラスのdata-statusと逆値を所持する要素(例: toggler(on) => off)
---------------------------------------------*/

// togglerクラスと切替対象のdata-statusを変更(togglerと同値: target, 逆値: anti-target)
// 当関数は別jsファイルでも流用します(流用先 : modal.js, scroll.js, file.js)
toggle_target_data = function toggle_target_data(toggler, target) {
  var anti_target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  if (anti_target !== null) {
    anti_target.map(function (anti) {
      if (anti !== null) anti.dataset.status = toggler.dataset.status !== "on" ? "off" : "on";
    });
  }
  toggler.dataset.status = toggler.dataset.status !== 'on' ? 'on' : 'off';
  if (target[0]) target.map(function (trg) {
    if (trg !== null) trg.dataset.status = toggler.dataset.status;
  });
};

// .toggler クリック時、TGL_TARGET_LISTから対象の切替要素を検索
// => .toggler および切替対象のdata-statusに on / off の値を指定
// (流用先 : ajax.js ... toggleの掛け直し)
toggle = function toggle() {
  var toggler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var togglers = toggler ? is_array(toggler) ? toggler : [toggler] : get_element('.toggler');
  if (!togglers[0]) return [];
  togglers.map(function (tgl) {
    tgl.addEventListener('click', function () {
      var target = null; // togglerと同じdata-statusの値が設定させる対象
      var anti_target = null; // togglerと逆のdata-statusの値が設定させる対象

      // togglerの対象がid検索の場合 (togglerがTGL_TARGET_LISTのキー値であるid値を有する)
      if (typeof TGL_TARGET_LIST[tgl.id] !== "undefined") {
        // 二重配列(anti_targetの枠)が設けられている場合
        if (is_array(TGL_TARGET_LIST[tgl.id][0])) {
          target = get_element(TGL_TARGET_LIST[tgl.id][0]);
          anti_target = get_element(TGL_TARGET_LIST[tgl.id][1]);
          // 配列要素が文字列のみ(targetの枠のみ)の場合
        } else {
          target = get_element(TGL_TARGET_LIST[tgl.id]);
        }

        // togglerの対象が同じタグ内の兄弟要素の場合 (対象のクラス名 : tgl-reactor)
      } else if (get_element(".tgl-reactor", tgl.parentNode)[0]) {
        target = get_element(".tgl-reactor", tgl.parentNode);

        /* 複数のモーダル中、特定のモーダルを開閉する場合 ------------
        |   タグの構造 1 (使用先：p-entry-func)
        |     Parent >
        |       modal-opener
        |       modal > modal-closer
        |   タグの構造 2 (使用先：p-index-server)
        |     GrandParent >
        |       Parent > modal-opener
        |       modal > modal-closer
        |   タグの構造 3 (使用先：p-in_server)
        |     ▼ each located in random layers (openerは複数存在できる)
        |       modal-opener (data-target_id = #modal-closer--)
        |                      (get_elementで取得するため # は必須)
        |       modal > modal-closer
        |
        |   * modal-closerを押下 => すべてのmodalとopenerをOff
        -----------------------------------------------------*/
      } else if (tgl.classList.contains("modal-opener") || tgl.classList.contains("modal-closer")) {
        target = [];
        target.push(OVERLAY, BODY);
        // Modal Opener がクリックされていた場合
        if (tgl.classList.contains("modal-opener")) {
          var parent = tgl.parentNode;
          var grand_parent = tgl.parentNode.parentNode;
          // タグの構造 1 の場合
          if (get_element(".modal", parent)[0]) {
            var _target;
            (_target = target).push.apply(_target, _toConsumableArray(get_element(".modal", parent)).concat(_toConsumableArray(get_element(".modal .modal-closer", parent))));
            // タグの構造 2 の場合
          } else if (get_element(".modal", grand_parent)[0]) {
            var _target2;
            (_target2 = target).push.apply(_target2, _toConsumableArray(get_element(".modal", grand_parent)).concat(_toConsumableArray(get_element(".modal .modal-closer", grand_parent))));
            // タグの構造 3 の場合
          } else if (typeof tgl.dataset.target_id != "undefined") {
            target.push(get_element(tgl.dataset.target_id), get_element(tgl.dataset.target_id).parentNode);
          }
          // Modal Closer がクリックされていた場合
        } else {
          var _target3;
          (_target3 = target).push.apply(_target3, _toConsumableArray(get_element(".modal")).concat(_toConsumableArray(get_element(".modal-opener"))));
        }

        // fixed-sectionを閉じる操作の場合
      } else if (tgl.classList.contains("fixed-section-closer")) {
        var section_id = tgl.id.split('closer--').slice(-1)[0];
        console.log(tgl.id.split('fixed-section-closer--')[0]);
        target = [get_element("#".concat(section_id))];
      }

      // tgl要素のdata-status値(on / off)を切替、target要素のdata-statusもそれに合わせる
      if (target !== null) toggle_target_data(tgl, target);else if (anti_target !== null) toggle_target_data(tgl, target, anti_target);
    });
  });
};
toggle();

// modal-closerのidで検索しmodalを開きます (hmtl内onclick) (js流用先 : file.js) 
open_modal_with_closer_id = function open_modal_with_closer_id(type) {
  var tgl = get_element("#modal-closer--".concat(type));
  if (tgl) {
    target = [OVERLAY, BODY, tgl.parentNode];
    toggle_target_data(tgl, target);
  }
};

// fixed-section-closerのidで検索しfixed-sectionを開きます (hmtl内onclick)
open_fixed_section_by_section_id = function open_fixed_section_by_section_id(section_id) {
  var tgl = get_element("#fixed-section-closer--".concat(section_id));
  if (tgl) {
    target = [get_element("#".concat(section_id))];
    toggle_target_data(tgl, target);
  }
};

/***/ }),

/***/ "./js/ui/utility.js":
/*!**************************!*\
  !*** ./js/ui/utility.js ***!
  \**************************/
/***/ (() => {

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// utility.js

// 引数がStringか否かを判別します(戻り値: Boolean)
is_string = function is_string(target) {
  if (typeof target === "string") return true;else return false;
};

// 引数がArrayか否かを判別します(戻り値: Boolean)
is_array = function is_array(target) {
  if (Array.isArray(target)) return true;else return false;
};

// 指定要素名とマッチする要素を返します(第1引数: 要素名(String/Array), 第2引数: 任意の親要素
// (戻り値: 複数の要素/単一クラス => Array, 要素名がidのみ => 単一要素)
// 各要素名の構成は、document.querySelector()の引数命名法則に準拠します
// 主なエラー要因: elm_nameに該当する要素が存在しない
get_element = function get_element(elm_name) {
  var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  // 要素名が複数(Array)の場合
  if (is_array(elm_name)) {
    var elm_array = [];
    elm_name.map(function (en) {
      var elms = element !== null ? Array.from(element.querySelectorAll(en)) : Array.from(document.querySelectorAll(en));
      if (elms[0]) {
        // 検索がid要素の場合は配列[0]の要素を返り値に格納
        if (en.split(" ").slice(-1)[0].slice(0, 1) === "#") elm_array.push(elms[0]);
        // class要素の場合は配列内の要素全てを格納
        else elm_array.push.apply(elm_array, _toConsumableArray(elms));
      }
    });
    return elm_array;
    // 要素名が単一(String)の場合
  } else {
    var elms = element !== null ? Array.from(element.querySelectorAll(elm_name)) : Array.from(document.querySelectorAll(elm_name));
    return elm_name.split(" ").slice(-1)[0].slice(0, 1) === "#" ? elms[0] : elms;
  }
};

// オブジェクトHTMLElementかを判断します
// ・obj instanceof HTMLElementで確認できる場合はそれを使用し、
// ・上記で確認できない場合は以下をすべて満たせばHTMLElementだと判断します
//   - オブジェクトのデータ型が "object"
//   - nodeTypeが 1 (ELEMENT_NODE)
//   - styleプロパティのデータ型が "object"
//   - ownerDocumentプロパティのデータ型が "object"
isElement = function isElement(obj) {
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrom)
    return obj instanceof HTMLElement;
  } catch (e) {
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have. (works on IE7)
    return _typeof(obj) === "object" && obj.nodeType === 1 && _typeof(obj.style) === "object" && _typeof(obj.ownerDocument) === "object";
  }
};

/***/ }),

/***/ "./js/webrtc.js":
/*!**********************!*\
  !*** ./js/webrtc.js ***!
  \**********************/
/***/ (() => {

// webrtc.js

// const promise = new Promise((resolve, reject) => {
//     reject("test");
// })
// .then((val) => {
//     console.log(`then1: ${val}`);
//     return val;
// })
// .catch((val) => {
//     console.log(`catch: ${val}`);
//     return val;
// })
// .then((val) => {
//     console.log(`then2: ${val}`);
// });

// const asyncFunc = async () => {
//     let x, y;
//     // Promiseがresolveするまで待機
//     x = await new Promise((resolve) => {
//         setTimeout(() => {
//             resolve(1);
//         }, 1000);
//     });
//     // Promiseがresolveするまで待機
//     y = await new Promise((resolve) => {
//         setTimeout(() => {
//             resolve(1);
//         }, 1000);
//     });

//     console.log(x + y);
// };
// asyncFunc();

// stream_video = () => {
//     const video = document.getElementById('side-caller-video');
//     const video2 = document.getElementById('full-caller-video');
//     navigator.mediaDevices
//         .getUserMedia({
//             video: true,
//             audio: false,
//         })
//         .then((stream) => {
//             video.srcObject = stream;
//             video.play();
//             video2.srcObject = stream;
//             video2.play();
//         })
//         .catch((e) => {
//             console.log(e);
//         });
// }

// let go_btn = document.getElementById('video-go');
// if (go_btn) go_btn.addEventListener('click', stream_video);

// const PEER = new Peer();

// // Connect
// const CONN = PEER.connect('another-peers-id');
// // on open will be launch when you successfully connect to PeerServer
// PEER.on('open', function(){
//     // here you have conn.id
//     PEER.send('hi!');
// });

// // Receive
// PEER.on('connection', function(conn) {
//     conn.on('data', function(data){
//         // Will print 'hi!'
//         console.log(data);
//     });
// });

/***/ }),

/***/ "../node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].use[1]!../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/import-glob-loader/index.js!./scss/style.scss":
/*!*******************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].use[1]!../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/import-glob-loader/index.js!./scss/style.scss ***!
  \*******************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "../node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "../node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "../node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../img/channel1.png */ "./img/channel1.png"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_1___ = new URL(/* asset import */ __webpack_require__(/*! ../img/message1.png */ "./img/message1.png"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Itim&display=swap);"]);
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_1___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "@charset \"UTF-8\";\n/*\n* --- プロパティ宣言順 ------\n* mixin\n* ボックスモデルの種類や表示方法を示すプロパティ（box-sizing, display, visibility, floatなど）\n* 位置情報に関するプロパティ（position, z-indexなど）\n* ボックスモデルのサイズに関するプロパティ（width, height, margin, padding, borderなど）\n* フォント関連のプロパティ（font-size, line-heightなど）\n* 色に関するプロパティ（color, background-colorなど）\n* それ以外\n* @contentを使用している@mixin\n* --- webpack関連 注意事項 ----\n* background-imageは../img~ (import先のstyle.scssで読み込まれるため)\n* \n* --- その他 注意事項 ----\n* HTMLでimgのaltつけ忘れに用心\n* \n*/\n/*-------------------------------------------------------------------\n|  Bootstrap                                                        |\n-------------------------------------------------------------------*/\n.row {\n  --bs-gutter-x: 1.5rem;\n  --bs-gutter-y: 0;\n  display: flex;\n  flex-wrap: wrap;\n  margin-top: calc(-1 * var(--bs-gutter-y));\n  margin-right: calc(-0.5 * var(--bs-gutter-x));\n  margin-left: calc(-0.5 * var(--bs-gutter-x));\n}\n.row > * {\n  flex-shrink: 0;\n  width: 100%;\n  max-width: 100%;\n  padding-right: calc(var(--bs-gutter-x) * 0.5);\n  padding-left: calc(var(--bs-gutter-x) * 0.5);\n  margin-top: var(--bs-gutter-y);\n}\n\n@media (min-width: 320px) {\n  .col-sp {\n    flex: 1 0 0%;\n  }\n  .row-cols-sp-auto > * {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .row-cols-sp-1 > * {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .row-cols-sp-2 > * {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .row-cols-sp-3 > * {\n    flex: 0 0 auto;\n    width: 33.3333333333%;\n  }\n  .row-cols-sp-4 > * {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .row-cols-sp-5 > * {\n    flex: 0 0 auto;\n    width: 20%;\n  }\n  .row-cols-sp-6 > * {\n    flex: 0 0 auto;\n    width: 16.6666666667%;\n  }\n  .col-sp-auto {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .col-sp-1 {\n    flex: 0 0 auto;\n    width: 4.16666667%;\n  }\n  .col-sp-2 {\n    flex: 0 0 auto;\n    width: 8.33333333%;\n  }\n  .col-sp-3 {\n    flex: 0 0 auto;\n    width: 12.5%;\n  }\n  .col-sp-4 {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-sp-5 {\n    flex: 0 0 auto;\n    width: 20.83333333%;\n  }\n  .col-sp-6 {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .col-sp-7 {\n    flex: 0 0 auto;\n    width: 29.16666667%;\n  }\n  .col-sp-8 {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .col-sp-9 {\n    flex: 0 0 auto;\n    width: 37.5%;\n  }\n  .col-sp-10 {\n    flex: 0 0 auto;\n    width: 41.66666667%;\n  }\n  .col-sp-11 {\n    flex: 0 0 auto;\n    width: 45.83333333%;\n  }\n  .col-sp-12 {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .col-sp-13 {\n    flex: 0 0 auto;\n    width: 54.16666667%;\n  }\n  .col-sp-14 {\n    flex: 0 0 auto;\n    width: 58.33333333%;\n  }\n  .col-sp-15 {\n    flex: 0 0 auto;\n    width: 62.5%;\n  }\n  .col-sp-16 {\n    flex: 0 0 auto;\n    width: 66.66666667%;\n  }\n  .col-sp-17 {\n    flex: 0 0 auto;\n    width: 70.83333333%;\n  }\n  .col-sp-18 {\n    flex: 0 0 auto;\n    width: 75%;\n  }\n  .col-sp-19 {\n    flex: 0 0 auto;\n    width: 79.16666667%;\n  }\n  .col-sp-20 {\n    flex: 0 0 auto;\n    width: 83.33333333%;\n  }\n  .col-sp-21 {\n    flex: 0 0 auto;\n    width: 87.5%;\n  }\n  .col-sp-22 {\n    flex: 0 0 auto;\n    width: 91.66666667%;\n  }\n  .col-sp-23 {\n    flex: 0 0 auto;\n    width: 95.83333333%;\n  }\n  .col-sp-24 {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .offset-sp-0 {\n    margin-left: 0;\n  }\n  .offset-sp-1 {\n    margin-left: 4.16666667%;\n  }\n  .offset-sp-2 {\n    margin-left: 8.33333333%;\n  }\n  .offset-sp-3 {\n    margin-left: 12.5%;\n  }\n  .offset-sp-4 {\n    margin-left: 16.66666667%;\n  }\n  .offset-sp-5 {\n    margin-left: 20.83333333%;\n  }\n  .offset-sp-6 {\n    margin-left: 25%;\n  }\n  .offset-sp-7 {\n    margin-left: 29.16666667%;\n  }\n  .offset-sp-8 {\n    margin-left: 33.33333333%;\n  }\n  .offset-sp-9 {\n    margin-left: 37.5%;\n  }\n  .offset-sp-10 {\n    margin-left: 41.66666667%;\n  }\n  .offset-sp-11 {\n    margin-left: 45.83333333%;\n  }\n  .offset-sp-12 {\n    margin-left: 50%;\n  }\n  .offset-sp-13 {\n    margin-left: 54.16666667%;\n  }\n  .offset-sp-14 {\n    margin-left: 58.33333333%;\n  }\n  .offset-sp-15 {\n    margin-left: 62.5%;\n  }\n  .offset-sp-16 {\n    margin-left: 66.66666667%;\n  }\n  .offset-sp-17 {\n    margin-left: 70.83333333%;\n  }\n  .offset-sp-18 {\n    margin-left: 75%;\n  }\n  .offset-sp-19 {\n    margin-left: 79.16666667%;\n  }\n  .offset-sp-20 {\n    margin-left: 83.33333333%;\n  }\n  .offset-sp-21 {\n    margin-left: 87.5%;\n  }\n  .offset-sp-22 {\n    margin-left: 91.66666667%;\n  }\n  .offset-sp-23 {\n    margin-left: 95.83333333%;\n  }\n  .g-sp-0,\n  .gx-sp-0 {\n    --bs-gutter-x: 0;\n  }\n  .g-sp-0,\n  .gy-sp-0 {\n    --bs-gutter-y: 0;\n  }\n  .g-sp-1,\n  .gx-sp-1 {\n    --bs-gutter-x: 0.25rem;\n  }\n  .g-sp-1,\n  .gy-sp-1 {\n    --bs-gutter-y: 0.25rem;\n  }\n  .g-sp-2,\n  .gx-sp-2 {\n    --bs-gutter-x: 0.5rem;\n  }\n  .g-sp-2,\n  .gy-sp-2 {\n    --bs-gutter-y: 0.5rem;\n  }\n  .g-sp-3,\n  .gx-sp-3 {\n    --bs-gutter-x: 1rem;\n  }\n  .g-sp-3,\n  .gy-sp-3 {\n    --bs-gutter-y: 1rem;\n  }\n  .g-sp-4,\n  .gx-sp-4 {\n    --bs-gutter-x: 1.5rem;\n  }\n  .g-sp-4,\n  .gy-sp-4 {\n    --bs-gutter-y: 1.5rem;\n  }\n  .g-sp-5,\n  .gx-sp-5 {\n    --bs-gutter-x: 3rem;\n  }\n  .g-sp-5,\n  .gy-sp-5 {\n    --bs-gutter-y: 3rem;\n  }\n}\n@media (min-width: 768px) {\n  .col-tab {\n    flex: 1 0 0%;\n  }\n  .row-cols-tab-auto > * {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .row-cols-tab-1 > * {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .row-cols-tab-2 > * {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .row-cols-tab-3 > * {\n    flex: 0 0 auto;\n    width: 33.3333333333%;\n  }\n  .row-cols-tab-4 > * {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .row-cols-tab-5 > * {\n    flex: 0 0 auto;\n    width: 20%;\n  }\n  .row-cols-tab-6 > * {\n    flex: 0 0 auto;\n    width: 16.6666666667%;\n  }\n  .col-tab-auto {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .col-tab-1 {\n    flex: 0 0 auto;\n    width: 4.16666667%;\n  }\n  .col-tab-2 {\n    flex: 0 0 auto;\n    width: 8.33333333%;\n  }\n  .col-tab-3 {\n    flex: 0 0 auto;\n    width: 12.5%;\n  }\n  .col-tab-4 {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-tab-5 {\n    flex: 0 0 auto;\n    width: 20.83333333%;\n  }\n  .col-tab-6 {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .col-tab-7 {\n    flex: 0 0 auto;\n    width: 29.16666667%;\n  }\n  .col-tab-8 {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .col-tab-9 {\n    flex: 0 0 auto;\n    width: 37.5%;\n  }\n  .col-tab-10 {\n    flex: 0 0 auto;\n    width: 41.66666667%;\n  }\n  .col-tab-11 {\n    flex: 0 0 auto;\n    width: 45.83333333%;\n  }\n  .col-tab-12 {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .col-tab-13 {\n    flex: 0 0 auto;\n    width: 54.16666667%;\n  }\n  .col-tab-14 {\n    flex: 0 0 auto;\n    width: 58.33333333%;\n  }\n  .col-tab-15 {\n    flex: 0 0 auto;\n    width: 62.5%;\n  }\n  .col-tab-16 {\n    flex: 0 0 auto;\n    width: 66.66666667%;\n  }\n  .col-tab-17 {\n    flex: 0 0 auto;\n    width: 70.83333333%;\n  }\n  .col-tab-18 {\n    flex: 0 0 auto;\n    width: 75%;\n  }\n  .col-tab-19 {\n    flex: 0 0 auto;\n    width: 79.16666667%;\n  }\n  .col-tab-20 {\n    flex: 0 0 auto;\n    width: 83.33333333%;\n  }\n  .col-tab-21 {\n    flex: 0 0 auto;\n    width: 87.5%;\n  }\n  .col-tab-22 {\n    flex: 0 0 auto;\n    width: 91.66666667%;\n  }\n  .col-tab-23 {\n    flex: 0 0 auto;\n    width: 95.83333333%;\n  }\n  .col-tab-24 {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .offset-tab-0 {\n    margin-left: 0;\n  }\n  .offset-tab-1 {\n    margin-left: 4.16666667%;\n  }\n  .offset-tab-2 {\n    margin-left: 8.33333333%;\n  }\n  .offset-tab-3 {\n    margin-left: 12.5%;\n  }\n  .offset-tab-4 {\n    margin-left: 16.66666667%;\n  }\n  .offset-tab-5 {\n    margin-left: 20.83333333%;\n  }\n  .offset-tab-6 {\n    margin-left: 25%;\n  }\n  .offset-tab-7 {\n    margin-left: 29.16666667%;\n  }\n  .offset-tab-8 {\n    margin-left: 33.33333333%;\n  }\n  .offset-tab-9 {\n    margin-left: 37.5%;\n  }\n  .offset-tab-10 {\n    margin-left: 41.66666667%;\n  }\n  .offset-tab-11 {\n    margin-left: 45.83333333%;\n  }\n  .offset-tab-12 {\n    margin-left: 50%;\n  }\n  .offset-tab-13 {\n    margin-left: 54.16666667%;\n  }\n  .offset-tab-14 {\n    margin-left: 58.33333333%;\n  }\n  .offset-tab-15 {\n    margin-left: 62.5%;\n  }\n  .offset-tab-16 {\n    margin-left: 66.66666667%;\n  }\n  .offset-tab-17 {\n    margin-left: 70.83333333%;\n  }\n  .offset-tab-18 {\n    margin-left: 75%;\n  }\n  .offset-tab-19 {\n    margin-left: 79.16666667%;\n  }\n  .offset-tab-20 {\n    margin-left: 83.33333333%;\n  }\n  .offset-tab-21 {\n    margin-left: 87.5%;\n  }\n  .offset-tab-22 {\n    margin-left: 91.66666667%;\n  }\n  .offset-tab-23 {\n    margin-left: 95.83333333%;\n  }\n  .g-tab-0,\n  .gx-tab-0 {\n    --bs-gutter-x: 0;\n  }\n  .g-tab-0,\n  .gy-tab-0 {\n    --bs-gutter-y: 0;\n  }\n  .g-tab-1,\n  .gx-tab-1 {\n    --bs-gutter-x: 0.25rem;\n  }\n  .g-tab-1,\n  .gy-tab-1 {\n    --bs-gutter-y: 0.25rem;\n  }\n  .g-tab-2,\n  .gx-tab-2 {\n    --bs-gutter-x: 0.5rem;\n  }\n  .g-tab-2,\n  .gy-tab-2 {\n    --bs-gutter-y: 0.5rem;\n  }\n  .g-tab-3,\n  .gx-tab-3 {\n    --bs-gutter-x: 1rem;\n  }\n  .g-tab-3,\n  .gy-tab-3 {\n    --bs-gutter-y: 1rem;\n  }\n  .g-tab-4,\n  .gx-tab-4 {\n    --bs-gutter-x: 1.5rem;\n  }\n  .g-tab-4,\n  .gy-tab-4 {\n    --bs-gutter-y: 1.5rem;\n  }\n  .g-tab-5,\n  .gx-tab-5 {\n    --bs-gutter-x: 3rem;\n  }\n  .g-tab-5,\n  .gy-tab-5 {\n    --bs-gutter-y: 3rem;\n  }\n}\n@media (min-width: 1024px) {\n  .col-pc {\n    flex: 1 0 0%;\n  }\n  .row-cols-pc-auto > * {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .row-cols-pc-1 > * {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .row-cols-pc-2 > * {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .row-cols-pc-3 > * {\n    flex: 0 0 auto;\n    width: 33.3333333333%;\n  }\n  .row-cols-pc-4 > * {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .row-cols-pc-5 > * {\n    flex: 0 0 auto;\n    width: 20%;\n  }\n  .row-cols-pc-6 > * {\n    flex: 0 0 auto;\n    width: 16.6666666667%;\n  }\n  .col-pc-auto {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .col-pc-1 {\n    flex: 0 0 auto;\n    width: 4.16666667%;\n  }\n  .col-pc-2 {\n    flex: 0 0 auto;\n    width: 8.33333333%;\n  }\n  .col-pc-3 {\n    flex: 0 0 auto;\n    width: 12.5%;\n  }\n  .col-pc-4 {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-pc-5 {\n    flex: 0 0 auto;\n    width: 20.83333333%;\n  }\n  .col-pc-6 {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .col-pc-7 {\n    flex: 0 0 auto;\n    width: 29.16666667%;\n  }\n  .col-pc-8 {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .col-pc-9 {\n    flex: 0 0 auto;\n    width: 37.5%;\n  }\n  .col-pc-10 {\n    flex: 0 0 auto;\n    width: 41.66666667%;\n  }\n  .col-pc-11 {\n    flex: 0 0 auto;\n    width: 45.83333333%;\n  }\n  .col-pc-12 {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .col-pc-13 {\n    flex: 0 0 auto;\n    width: 54.16666667%;\n  }\n  .col-pc-14 {\n    flex: 0 0 auto;\n    width: 58.33333333%;\n  }\n  .col-pc-15 {\n    flex: 0 0 auto;\n    width: 62.5%;\n  }\n  .col-pc-16 {\n    flex: 0 0 auto;\n    width: 66.66666667%;\n  }\n  .col-pc-17 {\n    flex: 0 0 auto;\n    width: 70.83333333%;\n  }\n  .col-pc-18 {\n    flex: 0 0 auto;\n    width: 75%;\n  }\n  .col-pc-19 {\n    flex: 0 0 auto;\n    width: 79.16666667%;\n  }\n  .col-pc-20 {\n    flex: 0 0 auto;\n    width: 83.33333333%;\n  }\n  .col-pc-21 {\n    flex: 0 0 auto;\n    width: 87.5%;\n  }\n  .col-pc-22 {\n    flex: 0 0 auto;\n    width: 91.66666667%;\n  }\n  .col-pc-23 {\n    flex: 0 0 auto;\n    width: 95.83333333%;\n  }\n  .col-pc-24 {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .offset-pc-0 {\n    margin-left: 0;\n  }\n  .offset-pc-1 {\n    margin-left: 4.16666667%;\n  }\n  .offset-pc-2 {\n    margin-left: 8.33333333%;\n  }\n  .offset-pc-3 {\n    margin-left: 12.5%;\n  }\n  .offset-pc-4 {\n    margin-left: 16.66666667%;\n  }\n  .offset-pc-5 {\n    margin-left: 20.83333333%;\n  }\n  .offset-pc-6 {\n    margin-left: 25%;\n  }\n  .offset-pc-7 {\n    margin-left: 29.16666667%;\n  }\n  .offset-pc-8 {\n    margin-left: 33.33333333%;\n  }\n  .offset-pc-9 {\n    margin-left: 37.5%;\n  }\n  .offset-pc-10 {\n    margin-left: 41.66666667%;\n  }\n  .offset-pc-11 {\n    margin-left: 45.83333333%;\n  }\n  .offset-pc-12 {\n    margin-left: 50%;\n  }\n  .offset-pc-13 {\n    margin-left: 54.16666667%;\n  }\n  .offset-pc-14 {\n    margin-left: 58.33333333%;\n  }\n  .offset-pc-15 {\n    margin-left: 62.5%;\n  }\n  .offset-pc-16 {\n    margin-left: 66.66666667%;\n  }\n  .offset-pc-17 {\n    margin-left: 70.83333333%;\n  }\n  .offset-pc-18 {\n    margin-left: 75%;\n  }\n  .offset-pc-19 {\n    margin-left: 79.16666667%;\n  }\n  .offset-pc-20 {\n    margin-left: 83.33333333%;\n  }\n  .offset-pc-21 {\n    margin-left: 87.5%;\n  }\n  .offset-pc-22 {\n    margin-left: 91.66666667%;\n  }\n  .offset-pc-23 {\n    margin-left: 95.83333333%;\n  }\n  .g-pc-0,\n  .gx-pc-0 {\n    --bs-gutter-x: 0;\n  }\n  .g-pc-0,\n  .gy-pc-0 {\n    --bs-gutter-y: 0;\n  }\n  .g-pc-1,\n  .gx-pc-1 {\n    --bs-gutter-x: 0.25rem;\n  }\n  .g-pc-1,\n  .gy-pc-1 {\n    --bs-gutter-y: 0.25rem;\n  }\n  .g-pc-2,\n  .gx-pc-2 {\n    --bs-gutter-x: 0.5rem;\n  }\n  .g-pc-2,\n  .gy-pc-2 {\n    --bs-gutter-y: 0.5rem;\n  }\n  .g-pc-3,\n  .gx-pc-3 {\n    --bs-gutter-x: 1rem;\n  }\n  .g-pc-3,\n  .gy-pc-3 {\n    --bs-gutter-y: 1rem;\n  }\n  .g-pc-4,\n  .gx-pc-4 {\n    --bs-gutter-x: 1.5rem;\n  }\n  .g-pc-4,\n  .gy-pc-4 {\n    --bs-gutter-y: 1.5rem;\n  }\n  .g-pc-5,\n  .gx-pc-5 {\n    --bs-gutter-x: 3rem;\n  }\n  .g-pc-5,\n  .gy-pc-5 {\n    --bs-gutter-y: 3rem;\n  }\n}\n.row, .row > * {\n  padding: 0;\n  margin: 0;\n}\n\n/* http://meyerweb.com/eric/tools/css/reset/ \n  v2.0 | 20110126\n  License: none (public domain)\n*/\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font: inherit;\n  vertical-align: baseline;\n}\n\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n  display: block;\n}\n\nol, ul {\n  list-style: none;\n}\n\nblockquote, q {\n  quotes: none;\n}\n\nblockquote:before, blockquote:after,\nq:before, q:after {\n  content: \"\";\n  content: none;\n}\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n\n/** #Index ... 各項目に # を付けて検索できます\n  ▼ Bootstrapにて使用される変数の上書き\n * MediaQuery..........メディアクエリ時に使用する変数\n\n  ▼ 自作の変数\n * Color...............色の変数 (font, bg, btn, border)\n * Font................fontの変数(size, family)\n * Line height.........line-heightのサイズを定める変数\n * Border..............borderのサイズを定める変数\n * Spacing.............要素の外/内側に設ける空間を定める変数(margin, padding)\n * Layout..............Layout配下の要素で、操作を受けやすいプロパティ値を変数化\n * Project.............Project配下の要素で、操作を受けやすいプロパティ値を変数化\n * \n * \n * \n * \n * \n * \n * \n**/\n/*-------------------------------------\n|   #Bootstrapにて使用される変数の上書き   |\n-------------------------------------*/\n/*  #MediaQuery  ---------------------------------------------*/\n/*  使用方法   //! 要記載\nhtmlでのクラス記載...\n\nrow\nrow-cols-sp-1\nrow-cols-tab-2\nrow-cols-pc-4\n\ncol\n*/\n/*---------------\n|   #自作の変数   |\n---------------*/\n/*  #Color  ---------------------------------------------*/\n/*  #Font  ---------------------------------------------*/\n/*  #Line height  ---------------------------------------------*/\n/*  #Border  ---------------------------------------------*/\n/*  #Space (padding / margin)  ---------------------------------------------*/\n/*  #Layout  -----------------------------------------------------------------*/\n/*  #Project   ---------------------------------------------------------------*/\n/*--------\n|  Base  | - default/reset\n--------*/\n* {\n  box-sizing: border-box;\n  color: inherit;\n}\n\nbody {\n  margin: auto;\n  color: #fff;\n  background-color: #1b1b1b;\n  font-size: 0.82rem;\n  font-family: \"Helvetica Neue\", \"Helvetica\", Helvetica, Arial, sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -webkit-text-size-adjust: none;\n}\n\na {\n  outline: none;\n  text-decoration: none;\n  color: inherit;\n  cursor: pointer;\n}\n\np {\n  word-wrap: break-word;\n}\n\nbutton, input {\n  padding: 0;\n  border: none;\n  outline: none;\n  font: inherit;\n}\n\nbutton {\n  background-color: inherit;\n  cursor: pointer;\n}\n\nlabel {\n  cursor: pointer;\n}\n\ntextarea {\n  font-family: \"Helvetica Neue\", \"Helvetica\", Helvetica, Arial, sans-serif;\n}\n\n.l-header__submenu-toggler,\n.l-header__main-layer-entry, .l-header__sub-layer-entry {\n  display: flex;\n  align-items: center;\n  height: 46px;\n  cursor: pointer;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .l-header__submenu-toggler:hover,\n  .l-header__main-layer-entry:hover, .l-header__sub-layer-entry:hover {\n    background-color: #333;\n  }\n}\n@media screen and (min-width: 1025px) {\n  .l-header__submenu-toggler,\n  .l-header__main-layer-entry, .l-header__sub-layer-entry {\n    padding: 0 0.7rem;\n    border-radius: 0.3rem;\n  }\n}\n\n.l-header__sub-layer-entry {\n  display: flex;\n  align-items: center;\n  width: 100%;\n}\n\n#l-header {\n  align-items: center;\n  z-index: 5;\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 60px;\n  background-color: #222;\n}\n\n/* --------------------------------------------------------------------\n|  height, background-colorは                                          |\n|  l-header-wrapの裏からスライド表示されるl-header-menuの透過を隠す目的       |\n----------------------------------------------------------------------*/\n.l-header__wrap {\n  display: flex;\n  flex: 1;\n  flex-flow: row;\n  align-items: center;\n  z-index: 4;\n  height: 100%;\n  width: 100%;\n  padding: 0 1.5rem;\n  background-color: #222;\n}\n@media screen and (max-width: 1024px) {\n  .l-header__wrap {\n    flex: none;\n  }\n}\n\n/* --------------------------------------------------------------------\n|  left menu                                                           |\n----------------------------------------------------------------------*/\n.l-header__leftmenu {\n  display: flex;\n  position: relative;\n  width: 50vw;\n  margin-right: auto;\n  font-size: 1rem;\n}\n@media screen and (max-width: 1024px) {\n  .l-header__leftmenu {\n    width: 80vw;\n  }\n}\n\n.l-header__home-entry, .l-header__home-entry--arrow,\n#l-header__server-banner, .l-header__channel-banner {\n  display: flex;\n  align-items: center;\n  height: 45px;\n  padding: 0 0.7rem;\n  border-radius: 0.3rem;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .l-header__home-entry:hover, .l-header__home-entry--arrow:hover,\n  #l-header__server-banner:hover, .l-header__channel-banner:hover {\n    background-color: #333;\n  }\n}\n\n.l-header__home-entry {\n  width: -moz-fit-content;\n  width: fit-content;\n}\n\n.l-header__home-entry--arrow {\n  padding: 0;\n}\n\n@media screen and (max-width: 767px) {\n  #l-header__server-banner, .l-header__channel-banner {\n    padding: 0 0.5rem;\n  }\n}\n\n#l-header__server-banner {\n  background-color: transparent !important;\n}\n\n.l-header__home-entry--arrow {\n  position: relative;\n  display: inline-block;\n}\n.l-header__home-entry--arrow::before {\n  content: \"\";\n  position: absolute;\n  top: 57.5%;\n  right: 0;\n  left: 0;\n  transform: rotate(225deg);\n  width: 7px;\n  height: 7px;\n  margin: auto;\n  margin-top: -0.5rem;\n  border-right: solid 1.5px #fff;\n  border-top: solid 1.5px #fff;\n}\n\n.l-header__server-img {\n  width: 30px;\n  height: 30px;\n  margin-right: 0.5rem;\n  border-radius: 0.3rem;\n  -o-object-fit: cover;\n     object-fit: cover;\n}\n\n.l-header__server-name {\n  max-width: 350px;\n}\n\n@media screen and (max-width: 767px) {\n  .l-header__server-name, .l-header__channel-name {\n    max-width: 125px;\n  }\n}\n\n.l-header__channel-banner {\n  background-color: #1b1b1b;\n}\n\n.l-header__channel-name {\n  margin-left: 0.5rem;\n}\n\n.l-header__channel-list {\n  display: none;\n  position: absolute;\n  top: 45px;\n  right: 0;\n  min-width: 250px;\n  max-width: 300px;\n  padding: 0.3rem;\n  border: 1px solid #777;\n  border-radius: 0.3rem;\n  background-color: #1b1b1b;\n}\n.l-header__channel-list[data-status=on] {\n  display: block;\n}\n\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  button#p-modal-opener--new-channel:hover {\n    background-color: #333;\n  }\n}\n\n/* --------------------------------------------------------------------\n|  main menu                                                           |\n----------------------------------------------------------------------*/\n#l-header__mainmenu-toggler {\n  position: relative;\n}\n\n#l-header__mainmenu-opener {\n  transform: scale(1);\n  position: absolute;\n  top: -17px;\n  right: 0;\n  border: none;\n  font-size: 0.82rem;\n}\n#l-header__mainmenu-opener > i {\n  margin: auto 0;\n}\n#l-header__mainmenu-opener[data-status=on] {\n  transition: transform 0.15s 0s ease;\n  transform: scale(0);\n}\n#l-header__mainmenu-opener[data-status=off] {\n  transition: transform 0.15s 0.15s ease;\n  transform: scale(1);\n}\n\n#l-header__mainmenu-closer {\n  transform: scale(0);\n  position: absolute;\n  top: -17px;\n  right: 0;\n}\n#l-header__mainmenu-closer[data-status=on] {\n  transition: transform 0.15s 0.15s ease;\n  transform: scale(1);\n}\n#l-header__mainmenu-closer[data-status=off] {\n  transition: transform 0.15s 0s ease;\n  transform: scale(0);\n}\n\n#l-header__mainmenu {\n  transition: transform 0.3s 0s ease;\n  display: flex;\n  flex-flow: row;\n  align-items: center;\n  z-index: 4;\n  padding: 0 2rem;\n  background-color: #222;\n}\n@media screen and (max-width: 1024px) {\n  #l-header__mainmenu {\n    flex-flow: column;\n    align-items: initial;\n    z-index: 3;\n    position: absolute;\n    bottom: 1.5px;\n    width: 100%;\n  }\n}\n#l-header__mainmenu[data-status=on] {\n  transform: translateY(100%);\n}\n#l-header__mainmenu[data-status=off] {\n  transform: translateY(-60px);\n}\n\n.l-header__mainmenu-item {\n  position: relative;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 1025px) {\n  .l-header__mainmenu-item:hover .l-header__submenu {\n    display: block;\n  }\n}\n\n.l-header__submenu {\n  display: none;\n}\n@media screen and (min-width: 1025px) {\n  .l-header__submenu {\n    position: absolute;\n    top: 38px;\n    right: 0;\n    width: -moz-max-content;\n    width: max-content;\n    min-width: 220px;\n    max-width: 250px;\n    padding: 0.3rem;\n    border: 1px solid #777;\n    border-radius: 0.3rem;\n    background-color: #222;\n  }\n}\n@media screen and (max-width: 1024px) {\n  .l-header__submenu[data-status=on] {\n    display: block;\n  }\n  .l-header__submenu[data-status=off] {\n    display: none;\n  }\n}\n\n.l-header__submenu-toggler {\n  display: flex;\n  justify-content: space-between;\n  width: 100%;\n  cursor: pointer;\n}\n\n.l-header__submenu-arrow {\n  position: relative;\n  display: inline-block;\n}\n.l-header__submenu-arrow::before {\n  content: \"\";\n  position: absolute;\n  top: 50%;\n  right: 0.3rem;\n  transform: rotate(135deg);\n  width: 7px;\n  height: 7px;\n  margin-top: -0.5rem;\n  border-right: solid 1.5px #fff;\n  border-top: solid 1.5px #fff;\n}\n\n.l-header__submenu-pilar-icon {\n  height: 2rem;\n  border-left: 4px solid white;\n  margin: auto 1rem auto 0;\n}\n\n.l-header__submenu-item-title {\n  font-size: 0.82rem;\n}\n\n.l-header__submenu-item-detail {\n  font-size: 0.62rem;\n  margin-top: 0.5rem;\n  word-wrap: break-word;\n}\n\n.l-header__flash-wrap {\n  display: flex;\n  position: fixed;\n  top: 60px;\n}\n\n.l-header__flash-message {\n  display: flex;\n  justify-content: space-between;\n  width: 100vw;\n  padding: 0.3rem 2rem;\n  background-color: #222;\n}\n\n.l-main, .l-main--app {\n  padding-top: 60px;\n}\n\n.l-main--app {\n  display: flex;\n  width: 100%;\n}\n\n.l-main__section, .l-main__app-section, .l-main__fixed-section {\n  display: flex;\n  min-height: calc(100vh - 60px);\n  width: 100vw;\n}\n.l-main__section > .content, .l-main__section .wide-content, .l-main__section .app-content, .l-main__app-section > .content, .l-main__app-section .wide-content, .l-main__app-section .app-content, .l-main__fixed-section > .content, .l-main__fixed-section .wide-content, .l-main__fixed-section .app-content {\n  height: -moz-fit-content;\n  height: fit-content;\n  width: 85%;\n  padding: 2rem 0;\n}\n.l-main__section > .content, .l-main__section .wide-content, .l-main__app-section > .content, .l-main__app-section .wide-content, .l-main__fixed-section > .content, .l-main__fixed-section .wide-content {\n  margin: auto;\n}\n@media screen and (min-width: 768px) {\n  .l-main__section > .content, .l-main__section .wide-content, .l-main__app-section > .content, .l-main__app-section .wide-content, .l-main__fixed-section > .content, .l-main__fixed-section .wide-content {\n    padding: 3rem 0;\n  }\n}\n.l-main__section > .app-content, .l-main__app-section > .app-content, .l-main__fixed-section > .app-content {\n  margin: 0 auto;\n}\n\n.l-main__fixed-section {\n  position: fixed;\n  top: 0;\n  z-index: 6;\n  height: 100%;\n  width: 100%;\n  background-color: #1b1b1b;\n}\n.l-main__fixed-section:not([data-status=on]) {\n  display: none;\n}\n\n.l-main__fixed-section-closer {\n  position: absolute;\n  top: 4rem;\n  right: 3rem;\n  font-size: 2.4rem;\n}\n\n.l-main__section:last-child {\n  min-height: calc(100vh - 120px);\n}\n\n.l-main:nth-child(1), .l-main--app:nth-child(1) {\n  padding: 0;\n}\n.l-main:nth-child(1) .l-main__section, .l-main--app:nth-child(1) .l-main__section {\n  min-height: calc(100vh - 60px);\n}\n\n.l-main__section-header {\n  text-align: center;\n  margin-bottom: 1.5rem;\n  font-size: 1.8rem;\n}\n@media screen and (max-width: 767px) {\n  .l-main__section-header {\n    font-size: 1.2rem;\n  }\n}\n\n.l-main__section-brief {\n  text-align: center;\n  margin-bottom: 2rem;\n  font-size: 0.82rem;\n  line-height: 2rem;\n}\n@media screen and (max-width: 767px) {\n  .l-main__section-brief {\n    font-size: 0.72rem;\n  }\n}\n\n.l-main__link-section {\n  display: flex;\n  justify-content: space-between;\n  width: 100%;\n  margin-bottom: 1.5rem;\n  font-size: 1rem;\n}\n\n.l-main__link-section-text {\n  margin: 0 0.3rem;\n}\n\n.l-footer {\n  height: 60px;\n  padding: 0 3rem;\n  line-height: 60px;\n}\n\n.l-footer__copy-light-txt {\n  font-size: 0.72rem;\n}\n\n.c-btn, .c-btn--quad, .c-btn--outstanding-rect, .c-btn--min-rect, .c-btn--submit-full, .c-btn--submit, .c-btn--xquad {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  padding: 0 0.3rem;\n  color: inherit;\n  cursor: pointer;\n}\n.c-btn > i, .c-btn--quad > i, .c-btn--outstanding-rect > i, .c-btn--min-rect > i, .c-btn--submit-full > i, .c-btn--submit > i, .c-btn--xquad > i {\n  margin: auto;\n}\n\n.c-btn--bg-primary, .c-btn--submit-full, .c-btn--submit {\n  background-color: #333;\n}\n\n.c-btn--hover-bg-primary {\n  border: 1px solid #777;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .c-btn--hover-bg-primary:hover {\n    background-color: #333;\n  }\n}\n\n.c-btn--bg-secondary {\n  background-color: #666;\n}\n\n.c-btn--hover-bg-secondary, .c-btn--submit-full, .c-btn--submit {\n  border: 1px solid #888;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .c-btn--hover-bg-secondary:hover, .c-btn--submit-full:hover, .c-btn--submit:hover {\n    background-color: #666;\n  }\n}\n\n.c-btn--bg-white-back {\n  background-color: #1b1b1b;\n}\n\n.c-btn--hover-bg-white-back, .c-btn--xquad {\n  border: 1px solid #1b1b1b;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .c-btn--hover-bg-white-back:hover, .c-btn--xquad:hover {\n    background-color: #1b1b1b;\n    color: #fff;\n  }\n}\n\n.c-btn--bg-outstanding {\n  background-color: #159ed0;\n}\n\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .c-btn--hover-bg-outstanding:hover {\n    background-color: #159ed0;\n  }\n}\n\n.c-btn--quad, .c-btn--outstanding-rect, .c-btn--min-rect, .c-btn--submit-full, .c-btn--submit, .c-btn--xquad {\n  min-height: 34px;\n  min-width: 34px;\n  border-radius: 0.3rem;\n}\n\n.c-btn--submit {\n  padding: 0 4rem;\n}\n\n.c-btn--submit-full {\n  width: 100%;\n}\n\n.c-btn--min-rect {\n  min-width: 65px;\n  background-color: #333;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .c-btn--min-rect:hover {\n    background-color: #666;\n  }\n}\n\n.c-btn--outstanding-rect {\n  padding: 0.5rem 0.7rem;\n  background-color: #159ed0;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .c-btn--outstanding-rect:hover {\n    background-color: #2eb8ea;\n  }\n}\n\n.card {\n  width: -moz-fit-content;\n  width: fit-content;\n  padding: 1rem 1.5rem;\n  border-left: 4px solid #777;\n  border-radius: 0.3rem;\n  font-size: 1rem;\n  line-height: 2rem;\n  background-color: #222;\n}\n\n.c-flex-wrapper {\n  display: flex;\n}\n\n.c-flex-wrapper--center {\n  display: flex;\n  align-items: center;\n}\n\n.c-flex-wrapper--column {\n  display: flex;\n  flex-flow: column;\n}\n\n.c-flex-wrapper--row {\n  display: flex;\n  flex-flow: row;\n}\n\n.c-menu-wrap {\n  overflow: hidden;\n  position: relative;\n}\n\n.c-menu-wrap > .c-corner-icon-menu {\n  display: flex;\n  overflow: hidden;\n  position: absolute;\n  top: -0.3rem;\n  right: -0.3rem;\n  padding: 0.3rem 0.3rem 0 0;\n  border-radius: 0.3rem;\n  background-color: #222;\n}\n.c-menu-wrap > .c-corner-icon-menu > .c-menu-elm {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  position: relative;\n  width: 32px;\n  height: 30px;\n}\n.c-menu-wrap > .c-corner-icon-menu > .c-menu-elm:not(:last-child)::after {\n  content: \"\";\n  position: absolute;\n  right: 0;\n  height: 15px;\n  border-right: 1px solid #777;\n}\n\n.c-patition, .c-partition--modal, .c-partition--full {\n  border-top: 1px solid #888;\n}\n\n.c-partition--full {\n  width: 100%;\n  margin: 1rem auto;\n}\n\n.c-partition--modal {\n  width: 65%;\n  min-width: 250px;\n  margin: 1.5rem auto;\n}\n\n.p-auth__form {\n  width: 50%;\n  min-width: 250px;\n  margin: 0 auto;\n}\n\n.p-auth__input-label {\n  font-size: 1rem;\n}\n\n.p-auth__input {\n  width: 100%;\n  margin: 0.3rem 0 1.5rem;\n  padding: 0.7rem;\n  border: 1px solid #777;\n  border-radius: 0.3rem;\n  font-size: 0.82rem;\n  font-weight: 600;\n  background-color: #1b1b1b;\n}\n\n.p-auth__error-msg {\n  float: right;\n  font-size: 0.62rem;\n  color: #ff0000;\n}\n\n.p-auth__submit {\n  margin: 1.5rem auto 0;\n  border: none;\n}\n\n.p-form__wrap, .p-form-wrap--min {\n  width: 50%;\n  min-width: 250px;\n  margin: 0 auto;\n}\n\n.p-form-wrap--min {\n  width: 100%;\n  min-width: auto;\n}\n\n.p-form__input-label {\n  display: inline-block;\n  margin-bottom: 0.3rem;\n  font-weight: bold;\n}\n\n.p-form__image-label {\n  display: block;\n  width: -moz-fit-content;\n  width: fit-content;\n  margin: 0.3rem 0 1rem;\n}\n\n.p-form__profile-image-label {\n  overflow: hidden;\n  position: relative;\n  height: 150px;\n  width: 150px;\n  margin: auto;\n  background-color: #333;\n  border-radius: 5rem;\n  font-size: 4rem;\n}\n@media screen and (max-width: 767px) {\n  .p-form__profile-image-label {\n    height: 150px;\n    width: 150px;\n  }\n}\n.p-form__profile-image-label > i {\n  position: absolute;\n}\n.p-form__profile-image-label > img {\n  -o-object-fit: cover;\n     object-fit: cover;\n  height: inherit;\n  width: inherit;\n  z-index: 5;\n}\n\n.p-form__image-label[\\:has\\(\\%2B\\%20.p-form__server-image\\:disabled\\)] {\n  opacity: 0.5;\n}\n\n.p-form__image-label:has(+ .p-form__server-image:disabled) {\n  opacity: 0.5;\n}\n\n.p-form__input {\n  width: 100%;\n  margin-bottom: 1.5rem;\n  padding: 0.7rem;\n  border: 1px solid #777;\n  border-radius: 0.3rem;\n  font-size: 0.82rem;\n  background-color: #1b1b1b;\n}\n\n.p-form__error-msg {\n  float: right;\n  margin-left: 1rem;\n  font-size: 0.72rem;\n  color: #ff0000;\n}\n\n.p-form__submit {\n  margin: 1rem auto 0;\n  border: none;\n}\n\n#p-form__password-visualizer i:last-child {\n  display: none;\n}\n\n.p-form__checkbox-wrap {\n  display: flex;\n  justify-content: space-evenly;\n}\n\n.p-form__checkbox-label {\n  padding: 0.3rem 0.7rem;\n  border-radius: 0.3rem;\n  background-color: #333;\n}\n\n.p-form__checkbox {\n  display: none;\n}\n\n.p-form__checkbox:checked + .p-form__checkbox-label {\n  background-color: #666;\n}\n\n.p-form__input:disabled {\n  text-decoration-line: line-through;\n  background-color: #222;\n}\n\n.p-form__file-block {\n  position: relative;\n  background-color: #222;\n  width: 175px;\n  padding: 0.7rem 0.3rem;\n  border-radius: 0.3rem;\n}\n@media screen and (max-width: 767px) {\n  .p-form__file-block {\n    width: 90px;\n    padding: 0.3rem;\n  }\n}\n\n.p-form__image-wrap {\n  display: flex;\n  z-index: 0;\n  position: relative;\n  height: 160px;\n  margin-bottom: 0.7rem;\n  border-radius: 0.3rem;\n  font-size: 4rem;\n  background-color: #555;\n}\n.p-form__image-wrap > i {\n  position: absolute;\n  top: calc(50% - 2rem);\n  left: calc(50% - 2rem);\n}\n.p-form__image-wrap > img {\n  z-index: 5;\n  height: 100%;\n  width: 100%;\n  -o-object-fit: cover;\n     object-fit: cover;\n}\n@media screen and (max-width: 767px) {\n  .p-form__image-wrap {\n    height: 80px;\n    margin-bottom: 0.3rem;\n  }\n}\n\n.p-form__filename {\n  overflow: hidden;\n  width: 100%;\n  font-size: 0.72rem;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n@media screen and (max-width: 767px) {\n  .p-form__filename {\n    font-size: 0.62rem;\n  }\n}\n\n.p-form__msg-input {\n  background-color: #333;\n  border-radius: 0.5rem;\n}\n\n.p-form__circle-preview-showcase {\n  position: relative;\n  width: -moz-fit-content;\n  width: fit-content;\n  margin: auto;\n}\n.p-form__circle-preview-showcase > .p-form__clear-circle-preview {\n  position: absolute;\n  top: 0;\n  right: -1.5rem;\n  font-size: 1.4rem;\n}\n\n.p-form__preview-showcase {\n  overflow: scroll;\n  margin: 0 0.7rem;\n  padding: 1rem 0.7rem;\n  border-bottom: 0.5px solid #777;\n}\n\nul.p-form__preview-list {\n  display: flex;\n  width: -moz-fit-content;\n  width: fit-content;\n}\nul.p-form__preview-list > li:not(:last-child) {\n  margin-right: 1rem;\n}\n@media screen and (max-width: 767px) {\n  ul.p-form__preview-list > li:not(:last-child) {\n    margin-right: 0.7rem;\n  }\n}\n\n.p-form__file-thumnail {\n  overflow: hidden;\n  border-radius: 1rem;\n  background-color: #1b1b1b;\n  width: -moz-fit-content;\n  width: fit-content;\n}\n\n.p-form__msg-input-bar {\n  padding: 0.5rem 2rem 0.5rem 0;\n}\n\n.p-form__file-opener-wrap {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n}\n\n#p-form__file-opener {\n  height: 1.5rem;\n  width: 1.5rem;\n  background-color: #555;\n  border-radius: 5rem;\n}\n\n.p-form__msg-txtarea {\n  border: none;\n  outline: none;\n  resize: none;\n  max-height: 13.25rem;\n  padding: 0.5rem 0.5rem 0.5rem 0.7rem;\n  border-radius: 0.3rem;\n  background-color: #222;\n  font-size: 1rem;\n  line-height: 1.25rem;\n}\n@media screen and (max-width: 767px) {\n  .p-form__msg-txtarea {\n    max-height: 10.75rem;\n  }\n}\n.p-form__msg-txtarea[\\:not-has\\(\\%2B\\%20input\\)] {\n  min-width: 40vw;\n}\n.p-form__msg-txtarea:not(:has(+ input)) {\n  min-width: 40vw;\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .p-form__msg-txtarea[\\:not-has\\(\\%2B\\%20input\\)] {\n    min-width: 50vw;\n  }\n  .p-form__msg-txtarea:not(:has(+ input)) {\n    min-width: 50vw;\n  }\n}\n@media screen and (max-width: 767px) {\n  .p-form__msg-txtarea[\\:not-has\\(\\%2B\\%20input\\)] {\n    min-width: 65vw;\n  }\n  .p-form__msg-txtarea:not(:has(+ input)) {\n    min-width: 65vw;\n  }\n}\n\n.p-form__msg-txtarea-closer {\n  width: -moz-fit-content;\n  width: fit-content;\n  border-bottom: 0.5px solid #777;\n}\n\n.p-form__file-dumper > i, #p-form__file-opener > i {\n  transition: all 0.15s;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-form__file-dumper:hover > i, #p-form__file-opener:hover > i {\n    scale: 1.2;\n  }\n}\n\n.p-form__search-bar-wrap {\n  position: relative;\n  max-width: 500px;\n  margin: 1.5rem;\n}\n\n.p-form__search-bar {\n  margin: 0;\n  padding-right: 150px;\n}\n@media screen and (max-width: 1024px) {\n  .p-form__search-bar {\n    padding-right: 50px;\n  }\n}\n\n.p-form__search-bar-status {\n  position: absolute;\n  top: 0;\n  right: 0.7rem;\n  bottom: 0;\n  display: flex;\n  align-items: center;\n}\n.p-form__search-bar-status .status-text, .p-form__search-bar-status i {\n  opacity: 0.4;\n}\n\n#p-form__search-bar-status--blank i {\n  font-size: 1rem;\n}\n\n#p-form__search-bar-status--filled {\n  display: contents;\n}\n#p-form__search-bar-status--filled .status-text {\n  margin: 0.3rem;\n  font-size: 0.72rem;\n  cursor: default;\n}\n#p-form__search-bar-status--filled i {\n  font-size: 1.4rem;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  #p-form__search-bar-status--filled i:hover {\n    opacity: 1;\n  }\n}\n\n.p-form__search-bar-result {\n  width: 70%;\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .p-form__search-bar-result {\n    min-width: 500px;\n  }\n}\n@media screen and (max-width: 767px) {\n  .p-form__search-bar-result {\n    min-width: 300px;\n  }\n}\n\n.annotation[\\:has\\(\\%2B\\%20.p-form__server-banner-list\\)] {\n  margin-bottom: 0.7rem;\n}\n\n.annotation:has(+ .p-form__server-banner-list) {\n  margin-bottom: 0.7rem;\n}\n\n.p-form__server-banner-list {\n  overflow: scroll;\n  max-height: 470px;\n  width: 100%;\n}\n.p-form__server-banner-list > li {\n  margin-bottom: 0.7rem;\n}\n@media (pointer: fine) {\n  .p-form__server-banner-list > li:first-child {\n    margin-top: 0.7rem;\n  }\n}\n@media (pointer: none) {\n  .p-form__server-banner-list > li:last-child {\n    margin: 0;\n  }\n}\n\n.p-form__server-banner {\n  display: flex;\n}\n@media (pointer: fine) {\n  .p-form__server-banner {\n    padding-left: 0.5rem;\n  }\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-form__server-banner:hover > .p-form__searched-server-img-wrap {\n    scale: 1.05;\n  }\n}\n\n.p-form__searched-server-img-wrap {\n  transition: all 0.15s;\n  overflow: hidden;\n  width: 180px;\n  height: 110px;\n  margin-right: 0.7rem;\n  border-radius: 0.3rem;\n}\n.p-form__searched-server-img-wrap[\\:not-has\\(img\\)] {\n  background-color: #222;\n}\n.p-form__searched-server-img-wrap:not(:has(img)) {\n  background-color: #222;\n}\n.p-form__searched-server-img-wrap > img {\n  height: inherit;\n  width: inherit;\n  -o-object-fit: cover;\n     object-fit: cover;\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .p-form__searched-server-img-wrap {\n    width: 145px;\n    height: 85px;\n  }\n}\n@media screen and (max-width: 767px) {\n  .p-form__searched-server-img-wrap {\n    width: 100px;\n    height: 65px;\n  }\n}\n\n.p-form__searched-server-info {\n  display: flex;\n  flex-flow: column;\n  justify-content: space-between;\n  overflow: hidden;\n}\n.p-form__searched-server-info .server-name {\n  overflow: hidden;\n  display: -webkit-box;\n  font-size: 1.2rem;\n  font-weight: bold;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 3;\n}\n@media screen and (max-width: 1024px) {\n  .p-form__searched-server-info .server-name {\n    font-size: 1rem;\n  }\n}\n@media screen and (max-width: 767px) {\n  .p-form__searched-server-info .server-name {\n    -webkit-line-clamp: 2;\n  }\n}\n@media screen and (max-width: 1024px) {\n  .p-form__searched-server-info .server-population {\n    font-size: 0.72rem;\n  }\n}\n\n.p-modal {\n  z-index: 7;\n  opacity: 0;\n  transform: scaleY(0);\n  transition: transform 0.2s ease-out, opacity 0.08s ease-in;\n  position: fixed;\n  top: 6%;\n  right: 0;\n  left: 0;\n  width: 75%;\n  margin: auto;\n  padding: 1.5rem 1rem;\n  border-radius: 0.3rem;\n  background-color: #444;\n}\n.p-modal[data-status=on] {\n  opacity: 1;\n  transform: scaleY(1);\n}\n.p-modal[data-status=off] {\n  opacity: 0;\n  transform: scaleY(0);\n}\n\n.p-modal--min {\n  top: 50%;\n  max-width: 420px;\n}\n.p-modal--min[data-status=on] {\n  transform: translateY(-50%);\n}\n\n.p-modal-closer {\n  position: absolute;\n  top: 5px;\n  right: 5px;\n}\n\n.p-modal-wrap {\n  overflow: scroll;\n  max-height: 86vh;\n}\n\n.p-modal-content {\n  justify-content: space-around;\n  margin: 0;\n}\n\n.p-modal-header {\n  text-align: center;\n  font-size: 1.4rem;\n  font-weight: bold;\n  margin-bottom: 1rem;\n}\n\n.p-modal-section {\n  min-width: 250px;\n}\n\n.p-modal-section {\n  width: 50%;\n  margin: 0 auto;\n}\n\n.p-slide-wrap {\n  z-index: 7;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  height: -moz-fit-content;\n  height: fit-content;\n  width: -moz-fit-content;\n  width: fit-content;\n  margin: auto;\n}\n\n.p-slide-closer {\n  position: absolute;\n  top: 0;\n  right: 0.7rem;\n}\n\n.splide {\n  width: 95vw;\n}\n\n.splide__track {\n  overflow: auto;\n}\n\n.splide__slide {\n  display: flex;\n  justify-content: space-around;\n}\n\n.splide__slide img {\n  -o-object-fit: contain;\n     object-fit: contain;\n  max-height: 75vh;\n  max-width: 70vw;\n}\n\n.splide__pagination {\n  bottom: -1.5rem;\n}\n\n.p-management__section-brief {\n  font-size: 1rem;\n}\n\n.p-management__code {\n  background: #222;\n  border-radius: 0.3rem;\n  padding: 0 0.3rem;\n}\n\n.p-management__notice-wrap {\n  width: -moz-fit-content;\n  width: fit-content;\n  margin: 0 auto;\n  padding: 1rem 1.5rem;\n  border-left: 4px solid #777;\n  border-radius: 0.3rem;\n  font-size: 1rem;\n  line-height: 2rem;\n  background-color: #222;\n}\n\n#body {\n  overflow: visible;\n}\n#body[data-status=on] {\n  overflow: hidden;\n}\n\n#overlay {\n  display: none;\n  opacity: 0.9;\n  position: fixed;\n  top: 0;\n  z-index: 6;\n  height: 100%;\n  width: 100%;\n  background-color: #1b1b1b;\n}\n#overlay[data-status=on] {\n  display: block;\n}\n\n#loading {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 7;\n  width: 100vw;\n  height: 100vh;\n  transition: all 1s;\n  background-color: #1b1b1b;\n}\n\n.loader,\n.loader:before,\n.loader:after {\n  background: #ffffff;\n  animation: load1 1s infinite ease-in-out;\n  width: 1em;\n  height: 4em;\n}\n\n.loader {\n  color: #ffffff;\n  text-indent: -9999em;\n  margin: 40vh auto;\n  position: relative;\n  font-size: 11px;\n  transform: translateZ(0);\n  animation-delay: -0.16s;\n}\n\n.loader:before,\n.loader:after {\n  position: absolute;\n  top: 0;\n  content: \"\";\n}\n\n.loader:before {\n  left: -1.5em;\n  animation-delay: -0.32s;\n}\n\n.loader:after {\n  left: 1.5em;\n}\n@keyframes load1 {\n  0%, 80%, 100% {\n    box-shadow: 0 0;\n    height: 4em;\n  }\n  40% {\n    box-shadow: 0 -2em;\n    height: 5em;\n  }\n}\n.loaded {\n  opacity: 0;\n  visibility: hidden;\n}\n\nspan.connecting {\n  position: relative;\n  display: inline-block;\n  color: #159ed0;\n}\n\nspan.connecting span {\n  position: absolute;\n  display: inline-block;\n  left: 0;\n  right: 0;\n  top: 120%;\n  height: 2px;\n  background-position: 0 0;\n  background-repeat: repeat-x;\n  background-size: 10px 100%;\n  background-image: linear-gradient(to right, transparent 5px, #159ed0 5px, #159ed0 10px);\n  animation: connecting 0.7s linear infinite;\n}\n@keyframes connecting {\n  0% {\n    background-position: 0 0;\n  }\n  100% {\n    background-position: 10px 0;\n  }\n}\nspan.connected {\n  position: relative;\n  display: inline-block;\n  color: #159ed0;\n}\n\nspan.connected span {\n  position: absolute;\n  display: inline-block;\n  left: 0;\n  top: 120%;\n  width: 100%;\n  height: 2px;\n  background-position: 0 0;\n  background-image: linear-gradient(to right, #159ed0, transparent);\n  animation: connected 2.5s linear infinite;\n}\n@keyframes connected {\n  0% {\n    width: 0;\n    background-color: transparent;\n  }\n  40% {\n    width: 100%;\n    background-color: transparent;\n  }\n  80% {\n    width: 100%;\n    background-color: #fff;\n  }\n  100% {\n    width: 100%;\n    background-color: #fff;\n  }\n}\n.p-user-list__head-wrap {\n  text-align: center;\n  margin-bottom: 0.5rem;\n}\n\n.p-user-list__head {\n  font-weight: bold;\n  font-size: 1rem;\n}\n\n.p-user-list__user-info-list {\n  align-items: center;\n  margin-bottom: 0.5rem;\n  border-radius: 0.3rem;\n  background-color: #222;\n}\n\n.p-user-list__user-info-wrap {\n  display: flex;\n  padding: 0.3rem 0.7rem;\n}\n@media screen and (max-width: 767px) {\n  .p-user-list__user-info-wrap {\n    padding: 0 0.7rem 0.3rem;\n  }\n  .p-user-list__user-info-wrap:first-child {\n    padding-top: 0.3rem;\n  }\n}\n\n.p-user-list__user-info {\n  margin: 0 auto;\n}\n\n.p-user-list__user-info--name {\n  margin: 0 auto;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-user-list__user-info--name:hover {\n    text-decoration-line: underline;\n  }\n}\n\n.p-user-list__user-delete-btn {\n  margin: 0 auto;\n  padding: 0.3rem 0.7rem;\n  border-radius: 0.3rem;\n  background-color: #1b1b1b;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-user-list__user-delete-btn:hover {\n    background-color: #666;\n  }\n}\n\n.p-entry-top__entry {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 1rem;\n  padding: 1rem;\n  border-radius: 0.3rem;\n}\n\n.p-entry-top__entry-wrap, .p-entry-top__image-wrap {\n  padding: 0 0.5rem;\n}\n\n.p-entry-top__entry-wrap {\n  margin-bottom: 1.5rem;\n}\n\n.p-entry-top__signin-entry {\n  background-color: #222;\n}\n\n.p-entry-top__signup-entry {\n  background-color: #333;\n}\n\n.p-entry-about__news-section-head {\n  margin-bottom: 0.7rem;\n  font-size: 1.4rem;\n  font-style: italic;\n}\n\n.p-entry-about__brief-wrap {\n  display: flex;\n  flex-flow: column;\n  justify-content: space-around;\n  text-align: center;\n  margin-bottom: 3rem;\n}\n\n.p-entry-about__github-entry {\n  padding: 5px;\n  border-radius: 0.3rem;\n  font-size: 1rem;\n  background-color: #333;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-entry-about__github-entry:hover {\n    color: wheat;\n  }\n}\n\n.p-entry-about__news-list {\n  overflow: scroll;\n  max-height: 65vh;\n  padding: 0.3rem 1rem;\n  border: 1px solid;\n  border-radius: 0.3rem;\n}\n@media screen and (max-width: 767px) {\n  .p-entry-about__news-list {\n    max-height: 55vh;\n  }\n}\n\n.p-entry-about__news-wrap {\n  padding: 0.3rem 0 0.5rem;\n  border-bottom: 0.5px solid #777;\n}\n\n.p-entry-about__news-wrap:last-child {\n  border: none;\n}\n\n.p-entry-about__news-header-wrap {\n  display: flex;\n  align-items: center;\n  min-height: 2rem;\n}\n\n.p-entry-about__news-pilar-icon {\n  border-left: 4px solid white;\n  height: 1.5rem;\n  margin-bottom: auto;\n  margin-right: 0.5rem;\n  margin-top: auto;\n  border-radius: 0.3rem;\n}\n\n.p-entry-about__news-header {\n  font-size: 1rem;\n}\n\n.p-entry-about__news-content {\n  line-height: 1rem;\n}\n\n.p-entry-about__news-date {\n  margin: 0.3rem 0;\n  font-size: 0.72rem;\n  color: #777;\n}\n\n.p-entry-func__modal-entry {\n  margin-bottom: 2rem;\n  padding: 0 0.5rem;\n}\n\n.p-entry-func__modal-entry:nth-child(5) {\n  margin: 0;\n}\n\n.p-entry-func__img-wrap {\n  transition: scale 0.2s ease;\n  position: relative;\n  padding-top: 66.666667%;\n  margin-bottom: 1rem;\n  border-radius: 0.3rem;\n  box-shadow: 0.05em 0.15em 0.3em rgba(0, 0, 0, 0.2);\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-entry-func__img-wrap:hover {\n    scale: 1.05;\n    box-shadow: 0.15em 0.45em 0.9em rgba(0, 0, 0, 0.25);\n  }\n}\n\n.p-entry-func__modal-opener {\n  overflow: hidden;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  border-radius: 0.3rem;\n  background-repeat: no-repeat;\n  background-size: cover;\n  background-position: 50% 50%;\n  cursor: pointer;\n}\n\n#p-entry-func__modal-image--channel {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n}\n\n#p-entry-func__modal-image--meeting {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n}\n\n#p-entry-func__modal-image--message {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ");\n}\n\n.p-entry-func__img-txt {\n  text-align: center;\n}\n\n.p-entry-func__modal-txt {\n  overflow: scroll;\n  max-height: 40em;\n  margin-bottom: 1rem;\n}\n@media screen and (max-width: 767px) {\n  .p-entry-func__modal-txt {\n    overflow: visible;\n    overflow: initial;\n    max-height: none;\n  }\n}\n\n.p-entry-func__modal-thumnails {\n  text-align: center;\n}\n.p-entry-func__modal-thumnails > img {\n  width: 75px;\n  height: 75px;\n  margin-right: 0.3rem;\n  margin-bottom: 0.5rem;\n  border-radius: 0.3rem;\n  -o-object-fit: cover;\n     object-fit: cover;\n  cursor: pointer;\n}\n.p-entry-func__modal-thumnails > img[data-status=on] {\n  scale: 1.1;\n  box-shadow: 0.05em 0.15em 0.3em rgba(0, 0, 0, 0.3);\n}\n\n.p-entry-func__modal-mainimage {\n  display: flex;\n  overflow: hidden;\n}\n.p-entry-func__modal-mainimage > img {\n  max-height: 600px;\n  max-width: 100%;\n}\n\n.p-index__server-board {\n  margin-bottom: 1.5rem;\n  padding: 0 1rem;\n}\n\n.p-index__server-thumnail-wrap {\n  transition: scale 0.2s ease;\n  overflow: hidden;\n  position: relative;\n  margin-bottom: 0.3rem;\n  padding-top: 95%;\n  border-radius: 1rem;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index__server-thumnail-wrap:hover {\n    scale: 1.05;\n  }\n}\n\n.p-index__server-thumnail {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  background-color: #333;\n}\n.p-index__server-thumnail > i {\n  font-size: 1.8rem;\n}\n.p-index__server-thumnail > img {\n  height: 100%;\n  width: 100%;\n  -o-object-fit: cover;\n     object-fit: cover;\n}\n\n.p-index__server-edit-btn {\n  position: absolute;\n  top: -0.5rem;\n  right: -0.3rem;\n  padding: 1rem 1rem 0.5rem 0.7rem;\n  border-radius: 0.5rem;\n  background-color: #222;\n}\n@media screen and (max-width: 1024px) {\n  .p-index__server-edit-btn {\n    display: block;\n  }\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index__server-edit-btn:hover > i {\n    scale: 1.4;\n  }\n}\n.p-index__server-edit-btn > i {\n  transition: scale 0.2s ease;\n  scale: 1;\n}\n\n.p-index__server-title {\n  text-align: center;\n  font-size: 1rem;\n}\n\n.p-index__in-server {\n  display: flex;\n  position: fixed;\n  height: calc(100vh - 60px);\n  width: 100vw;\n}\n\n.p-index__sidebar {\n  position: relative;\n  width: 22%;\n  min-width: 250px;\n  padding: 0.5rem;\n  border-top: 1px solid #1b1b1b;\n  border-right: 1px solid #1b1b1b;\n  background-color: #222;\n}\n\n.p-index__channel-list-wrap {\n  overflow: scroll;\n  height: calc(100% - 80px + 0.5rem);\n}\n\n.p-index__channel-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  width: 100%;\n  padding: 0.5rem;\n}\n\n.p-index__channel-wrap {\n  margin-bottom: 0.3rem;\n  padding: 0.5rem 0.3rem;\n  border-radius: 0.3rem;\n  cursor: pointer;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index__channel-wrap:hover {\n    background-color: #333;\n  }\n}\n\n.p-index__channel-name-wrap {\n  display: flex;\n  align-items: center;\n}\n.p-index__channel-name-wrap .hash-mark {\n  text-align: center;\n  margin-right: 0.5rem;\n  font-size: 1rem;\n}\n\n.p-index__new-channel-btn,\n.p-index__channel-invite-btn,\n.p-index__channel-setting-btn {\n  text-align: center;\n  font-size: 0.72rem;\n}\n.p-index__new-channel-btn > i,\n.p-index__channel-invite-btn > i,\n.p-index__channel-setting-btn > i {\n  transition: all 0.15s;\n  vertical-align: middle;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index__new-channel-btn:hover > i,\n  .p-index__channel-invite-btn:hover > i,\n  .p-index__channel-setting-btn:hover > i {\n    scale: 1.4;\n  }\n}\n\n.p-index__side-user-section {\n  position: absolute;\n  bottom: 1rem;\n  width: calc(100% - 1rem);\n  border-top: 1px solid #1b1b1b;\n}\n\n.p-index__user-status-bar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 28px;\n}\n\n.p-index__user-action-list {\n  align-items: center;\n  font-size: 1rem;\n}\n\n.p-index__side-user-image {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  overflow: hidden;\n  height: 35px;\n  width: 35px;\n  margin-right: 0.5rem;\n  border-radius: 5rem;\n  background-color: #333;\n}\n.p-index__side-user-image > img {\n  -o-object-fit: cover;\n     object-fit: cover;\n  height: inherit;\n  width: inherit;\n}\n\n.p-index__user-action-btn > i {\n  transition: all 0.15s;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index__user-action-btn:hover > i {\n    scale: 1.4;\n  }\n}\n\n.p-index__phone-operator {\n  padding: 0.5rem 0;\n}\n.p-index__phone-operator[data-status=off] {\n  display: none;\n}\n\n.p-index__phone-book {\n  height: 220px;\n}\n.p-index__phone-book .note-for-call {\n  display: flex;\n  justify-content: center;\n  align-items: flex-start;\n  height: 18px;\n  font-size: 0.62rem;\n}\n.p-index__phone-book .p-index__callable-user-list {\n  overflow: scroll;\n  height: 202px;\n}\n\n.p-index__callable-user-list .user-list {\n  display: flex;\n  align-items: center;\n  border-radius: 0.3rem;\n  padding: 0.3rem 0.5rem;\n  cursor: pointer;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index__callable-user-list .user-list:hover {\n    background-color: #333;\n  }\n}\n.p-index__callable-user-list .user-list .user-list-image {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  overflow: hidden;\n  height: 30px;\n  width: 30px;\n  margin-right: 0.5rem;\n  border-radius: 5rem;\n  background-color: #333;\n}\n.p-index__callable-user-list .user-list .user-list-image > img {\n  -o-object-fit: cover;\n     object-fit: cover;\n  height: inherit;\n  width: inherit;\n}\n.p-index__callable-user-list .user-list .user-list-name {\n  width: calc(100% - 30px - 0.5rem);\n}\n.p-index__callable-user-list .user-list .user-list-name[\\:has\\(\\%2B\\%20button\\)] {\n  width: calc(100% - 30px - 0.5rem - 1rem);\n}\n.p-index__callable-user-list .user-list .user-list-name:has(+ button) {\n  width: calc(100% - 30px - 0.5rem - 1rem);\n}\n.p-index__callable-user-list .user-list .cancel-call-btn {\n  font-size: 1rem;\n}\n\n.p-index__side-call-monitor {\n  position: relative;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index__side-call-monitor:hover .side-call-menu {\n    opacity: 1;\n  }\n}\n\n.p-index__side-call-monitor .side-user-display {\n  overflow: hidden;\n  position: relative;\n  width: 100%;\n  aspect-ratio: 4/3;\n  border-radius: 0.3rem;\n}\n.p-index__side-call-monitor .side-user-display:first-child {\n  margin-bottom: 0.1rem;\n}\n.p-index__side-call-monitor .side-user-display video {\n  width: inherit;\n  aspect-ratio: 4/3;\n}\n.p-index__side-call-monitor .side-user-display img {\n  width: inherit;\n  aspect-ratio: 4/3;\n  -o-object-fit: cover;\n     object-fit: cover;\n}\n.p-index__side-call-monitor .side-user-display .user-name {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  position: absolute;\n  bottom: 0.3rem;\n  left: 0.3rem;\n  width: calc(100% - 0.6rem);\n  font-size: 0.72rem;\n}\n.p-index__side-call-monitor .side-user-display .user-name p, .p-index__side-call-monitor .side-user-display .user-name i {\n  background-color: rgba(27, 27, 27, 0.7803921569);\n}\n.p-index__side-call-monitor .side-user-display .user-name p {\n  max-width: 80%;\n  padding: 0.3rem 0.5rem;\n  border-radius: 0.3rem;\n}\n.p-index__side-call-monitor .side-user-display .user-name i {\n  text-align: center;\n  height: 1.8rem;\n  width: 1.8rem;\n  line-height: 1.8rem;\n  border-radius: 5rem;\n}\n\n.p-index__side-call-monitor .side-call-menu {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  gap: 0.7rem;\n  position: absolute;\n  top: 0.2rem;\n  right: 0;\n  left: 0;\n  transition: all 0.2s ease-in;\n}\n.p-index__side-call-monitor .side-call-menu .menu-btn {\n  height: 1.5rem;\n  width: 1.5rem;\n  background-color: #555;\n  border-radius: 5rem;\n  box-shadow: 0 3px 3px -2px rgba(0, 0, 0, 0.2), 0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 1px 8px 0 rgba(0, 0, 0, 0.12);\n  transition: all 0.15s;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index__side-call-monitor .side-call-menu .menu-btn:hover {\n    scale: 1.2;\n  }\n}\n\n.mute-btn[\\:has\\(.fa-microphone-slash\\)] {\n  background-color: #159ed0;\n}\n\n.mute-btn:has(.fa-microphone-slash) {\n  background-color: #159ed0;\n}\n\n.p-index__full-call-menu {\n  position: absolute;\n  top: 1rem;\n  right: 0;\n  left: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 1rem;\n}\n.p-index__full-call-menu .menu-btn {\n  height: 50px;\n  width: 50px;\n  background-color: #555;\n  border-radius: 5rem;\n  font-size: 1.4rem;\n  transition: all 0.2s;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index__full-call-menu .menu-btn:hover {\n    scale: 1.2;\n  }\n}\n\n.p-index__full-call-monitor {\n  display: flex;\n  gap: 0.2rem;\n  width: 100%;\n}\n\n.p-index__full-call-monitor .full-user-display {\n  overflow: hidden;\n  position: relative;\n  width: 50%;\n  aspect-ratio: 4/3;\n  border-radius: 0.3rem;\n}\n.p-index__full-call-monitor .full-user-display img {\n  width: 100%;\n  aspect-ratio: 4/3;\n  -o-object-fit: cover;\n     object-fit: cover;\n}\n.p-index__full-call-monitor .full-user-display .user-name {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  position: absolute;\n  bottom: 0.5rem;\n  left: 0.5rem;\n  width: calc(100% - 1rem);\n}\n.p-index__full-call-monitor .full-user-display .user-name p, .p-index__full-call-monitor .full-user-display .user-name i {\n  background-color: rgba(27, 27, 27, 0.7803921569);\n}\n.p-index__full-call-monitor .full-user-display .user-name p {\n  max-width: 80%;\n  padding: 0.3rem 0.5rem;\n  border-radius: 0.3rem;\n}\n.p-index__full-call-monitor .full-user-display .user-name i {\n  text-align: center;\n  height: 1.8rem;\n  width: 1.8rem;\n  line-height: 1.8rem;\n  border-radius: 5rem;\n}\n\n.p-index-main {\n  position: relative;\n  width: 100%;\n}\n\n.p-index-main__date-partition {\n  display: flex;\n  align-items: center;\n  margin: 2rem 0;\n}\n\n.p-index-main__date-partition::before,\n.p-index-main__date-partition::after {\n  content: \"\";\n  height: 1px;\n  flex-grow: 1;\n  background-color: #666;\n}\n\n.p-index-main__date-partition::before {\n  margin-right: 1rem;\n}\n\n.p-index-main__date-partition::after {\n  margin-left: 1rem;\n}\n\n.p-index-main__output {\n  overflow: scroll;\n  height: calc(100% - 67px);\n  padding: 1rem;\n}\n\n.p-index-main__output-header {\n  text-align: center;\n  font-size: 2.4rem;\n  font-weight: bold;\n  font-family: \"Roboto Condensed\", sans-serif;\n}\n\n.p-index-main__msg-list > li {\n  display: flex;\n  margin-bottom: 1rem;\n}\n\n.p-index-main__sender-image-wrap {\n  margin-right: 1rem;\n}\n@media screen and (max-width: 1024px) {\n  .p-index-main__sender-image-wrap {\n    margin-right: 0.7rem;\n  }\n}\n\n.p-index-main__sender-image {\n  overflow: hidden;\n  height: 45px;\n  width: 45px;\n  padding: 0;\n  border-radius: 5rem;\n  background-color: #333;\n  font-size: 1.4rem;\n}\n.p-index-main__sender-image > img {\n  -o-object-fit: cover;\n     object-fit: cover;\n  height: inherit;\n  width: inherit;\n}\n\n.p-index-main__msg-content {\n  display: grid;\n  grid-gap: 0.3rem;\n  gap: 0.3rem;\n  padding-top: 0.5rem;\n}\n\n.p-index-main__msg-posting-info {\n  display: flex;\n  align-items: end;\n}\n.p-index-main__msg-posting-info > .username {\n  max-width: 450px;\n  margin-right: 0.7rem;\n  font-size: 1rem;\n  font-weight: bold;\n}\n@media screen and (max-width: 767px) {\n  .p-index-main__msg-posting-info > .username {\n    max-width: 200px;\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .p-index-main__msg-posting-info > .username {\n    max-width: 350px;\n  }\n}\n.p-index-main__msg-posting-info > .date {\n  margin-right: 0.7rem;\n  font-size: 0.72rem;\n  color: #888;\n}\n\n.p-index-main__msg-manager {\n  display: contents;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index-main__msg-manager:hover > i {\n    transition: all 0.15s;\n    scale: 1.2;\n  }\n}\n@media screen and (min-width: 768px) {\n  .p-index-main__msg-manager {\n    font-size: 1rem;\n  }\n}\n\n.p-index-main__msg-mdl-opener > i {\n  margin-right: 0.5rem;\n}\n\n.p-index-main__msg-text-wrap {\n  font-size: 1rem;\n}\n\n.p-index-main__img-wrap {\n  position: relative;\n}\n\n.p-index-main__dcmnt-wrap {\n  display: flex;\n  width: 40%;\n  min-width: 325px;\n  margin-top: 0.7rem;\n  padding: 0.7rem 3rem 0.7rem 0.7rem;\n  border-radius: 0.3rem;\n  background-color: #333;\n}\n@media screen and (max-width: 767px) {\n  .p-index-main__dcmnt-wrap {\n    min-width: 225px;\n    margin-top: 0.5rem;\n  }\n}\n.p-index-main__dcmnt-wrap > i {\n  margin-right: 0.5rem;\n  font-size: 2rem;\n}\n\n.p-index-main__dcmnt-info > a {\n  color: #159ed0;\n  font-size: 1rem;\n}\n.p-index-main__dcmnt-info > p {\n  font-size: 0.7rem;\n  opacity: 0.5;\n}\n\n.p-index-main__input {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  left: 0;\n  padding: 0.7rem 1.5rem 1rem;\n  background-color: #222;\n}\n\n.p-index-main__user-info-list {\n  display: grid;\n  grid-gap: 1.5rem;\n  gap: 1.5rem;\n  width: 65%;\n  min-width: 250px;\n  margin: auto;\n}\n.p-index-main__user-info-list > li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.p-index-main__user-info-list > li:first-child {\n  justify-content: space-around;\n}\n\n.p-index-main__user-image {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  overflow: hidden;\n  height: 80px;\n  width: 80px;\n  border-radius: 5rem;\n  font-size: 2.4rem;\n  background-color: #333;\n}\n@media (hover: hover) and (pointer: fine) and (min-width: 0px) {\n  .p-index-main__user-image:hover {\n    background-color: #666;\n  }\n}\n.p-index-main__user-image > img {\n  -o-object-fit: cover;\n     object-fit: cover;\n  height: inherit;\n  width: inherit;\n}\n\n.p-index-main__user-info-label {\n  display: grid;\n  grid-gap: 0.3rem;\n  gap: 0.3rem;\n  font-size: 1rem;\n}\n\n@media screen and (max-width: 767px) {\n  .u-dn-sp {\n    display: none !important;\n  }\n}\n\n@media screen and (max-width: 1024px) {\n  .u-dn-tab-max {\n    display: none !important;\n  }\n}\n\n@media screen and (min-width: 768px) {\n  .u-dn-tab-min {\n    display: none !important;\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .u-dn-pc {\n    display: none !important;\n  }\n}\n\n.u-dn {\n  display: none !important;\n}\n\n.u-dn-by-data:not([data-status=on]) {\n  display: none !important;\n}\n\n@media screen and (max-width: 767px) {\n  .u-non-anim-sp {\n    transition: none !important;\n    transform: none !important;\n  }\n}\n\n@media screen and (max-width: 1024px) {\n  .u-non-anim-tab-max {\n    transition: none !important;\n    transform: none !important;\n  }\n}\n\n@media screen and (min-width: 768px) {\n  .u-non-anim-tab-min {\n    transition: none !important;\n    transform: none !important;\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .u-non-anim-pc {\n    transition: none !important;\n    transform: none !important;\n  }\n}\n\n.msg-img-flex-box {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.2rem;\n}\n\n.msg-img-flex-box .flex-item {\n  display: flex;\n  overflow: hidden;\n  border-radius: 0.3rem;\n}\n\n.msg-img-flex-box .flex-item img {\n  -o-object-fit: cover;\n     object-fit: cover;\n  width: 100%;\n}\n\n.msg-img-flex-box .flex-item-wrap--column {\n  display: flex;\n  flex-direction: column;\n  gap: 0.2rem;\n}\n\n@media screen and (min-width: 1025px) {\n  .msg-img-flex-box--1 {\n    width: 360px;\n  }\n  .msg-img-flex-box--1 > .flex-item:nth-child(1) {\n    height: 270px;\n    width: calc(100% - 0.2rem);\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .msg-img-flex-box--1 {\n    width: 270px;\n  }\n  .msg-img-flex-box--1 > .flex-item:nth-child(1) {\n    height: 202.5px;\n    width: calc(100% - 0.2rem);\n  }\n}\n@media screen and (max-width: 767px) {\n  .msg-img-flex-box--1 {\n    width: 180px;\n  }\n  .msg-img-flex-box--1 > .flex-item:nth-child(1) {\n    height: 135px;\n    width: calc(100% - 0.2rem);\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .msg-img-flex-box--2 {\n    width: 540px;\n  }\n  .msg-img-flex-box--2 > .flex-item:nth-child(1) {\n    height: 270px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--2 > .flex-item:nth-child(2) {\n    height: 270px;\n    width: calc(50% - 0.2rem);\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .msg-img-flex-box--2 {\n    width: 405px;\n  }\n  .msg-img-flex-box--2 > .flex-item:nth-child(1) {\n    height: 202.5px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--2 > .flex-item:nth-child(2) {\n    height: 202.5px;\n    width: calc(50% - 0.2rem);\n  }\n}\n@media screen and (max-width: 767px) {\n  .msg-img-flex-box--2 {\n    width: 270px;\n  }\n  .msg-img-flex-box--2 > .flex-item:nth-child(1) {\n    height: 135px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--2 > .flex-item:nth-child(2) {\n    height: 135px;\n    width: calc(50% - 0.2rem);\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .msg-img-flex-box--3 {\n    width: 540px;\n  }\n  .msg-img-flex-box--3 > .flex-item:nth-child(1) {\n    height: 360px;\n    width: calc(66.6666666667% - 0.2rem);\n  }\n  .msg-img-flex-box--3 > .flex-item-wrap--column:nth-child(2) {\n    height: 360px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--3 > .flex-item-wrap--column:nth-child(2) > .flex-item {\n    height: 180px;\n    width: 100%;\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .msg-img-flex-box--3 {\n    width: 405px;\n  }\n  .msg-img-flex-box--3 > .flex-item:nth-child(1) {\n    height: 270px;\n    width: calc(66.6666666667% - 0.2rem);\n  }\n  .msg-img-flex-box--3 > .flex-item-wrap--column:nth-child(2) {\n    height: 270px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--3 > .flex-item-wrap--column:nth-child(2) > .flex-item {\n    height: 135px;\n    width: 100%;\n  }\n}\n@media screen and (max-width: 767px) {\n  .msg-img-flex-box--3 {\n    width: 270px;\n  }\n  .msg-img-flex-box--3 > .flex-item:nth-child(1) {\n    height: 180px;\n    width: calc(66.6666666667% - 0.2rem);\n  }\n  .msg-img-flex-box--3 > .flex-item-wrap--column:nth-child(2) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--3 > .flex-item-wrap--column:nth-child(2) > .flex-item {\n    height: 90px;\n    width: 100%;\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .msg-img-flex-box--4 {\n    width: 540px;\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(1) {\n    height: 180px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(2) {\n    height: 180px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(3) {\n    height: 180px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(4) {\n    height: 180px;\n    width: calc(50% - 0.2rem);\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .msg-img-flex-box--4 {\n    width: 405px;\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(1) {\n    height: 135px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(2) {\n    height: 135px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(3) {\n    height: 135px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(4) {\n    height: 135px;\n    width: calc(50% - 0.2rem);\n  }\n}\n@media screen and (max-width: 767px) {\n  .msg-img-flex-box--4 {\n    width: 270px;\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(1) {\n    height: 90px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(2) {\n    height: 90px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(3) {\n    height: 90px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--4 > .flex-item:nth-child(4) {\n    height: 90px;\n    width: calc(50% - 0.2rem);\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .msg-img-flex-box--5 {\n    width: 540px;\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(1) {\n    height: 270px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(2) {\n    height: 270px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(3) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(4) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(5) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .msg-img-flex-box--5 {\n    width: 405px;\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(1) {\n    height: 202.5px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(2) {\n    height: 202.5px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(3) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(4) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(5) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (max-width: 767px) {\n  .msg-img-flex-box--5 {\n    width: 270px;\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(1) {\n    height: 135px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(2) {\n    height: 135px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(3) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(4) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--5 > .flex-item:nth-child(5) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .msg-img-flex-box--6 {\n    width: 540px;\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(1) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(2) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(3) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(4) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(5) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(6) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .msg-img-flex-box--6 {\n    width: 405px;\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(1) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(2) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(3) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(4) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(5) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(6) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (max-width: 767px) {\n  .msg-img-flex-box--6 {\n    width: 270px;\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(1) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(2) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(3) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(4) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(5) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--6 > .flex-item:nth-child(6) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .msg-img-flex-box--7 {\n    width: 540px;\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(1) {\n    height: 270px;\n    width: calc(100% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(2) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(3) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(4) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(5) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(6) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(7) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .msg-img-flex-box--7 {\n    width: 405px;\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(1) {\n    height: 202.5px;\n    width: calc(100% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(2) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(3) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(4) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(5) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(6) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(7) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (max-width: 767px) {\n  .msg-img-flex-box--7 {\n    width: 270px;\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(1) {\n    height: 135px;\n    width: calc(100% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(2) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(3) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(4) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(5) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(6) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--7 > .flex-item:nth-child(7) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .msg-img-flex-box--8 {\n    width: 540px;\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(1) {\n    height: 270px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(2) {\n    height: 270px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(3) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(4) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(5) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(6) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(7) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(8) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .msg-img-flex-box--8 {\n    width: 405px;\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(1) {\n    height: 202.5px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(2) {\n    height: 202.5px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(3) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(4) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(5) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(6) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(7) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(8) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (max-width: 767px) {\n  .msg-img-flex-box--8 {\n    width: 270px;\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(1) {\n    height: 135px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(2) {\n    height: 135px;\n    width: calc(50% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(3) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(4) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(5) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(6) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(7) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--8 > .flex-item:nth-child(8) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .msg-img-flex-box--9 {\n    width: 540px;\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(1) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(2) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(3) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(4) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(5) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(6) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(7) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(8) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(9) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .msg-img-flex-box--9 {\n    width: 405px;\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(1) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(2) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(3) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(4) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(5) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(6) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(7) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(8) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(9) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (max-width: 767px) {\n  .msg-img-flex-box--9 {\n    width: 270px;\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(1) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(2) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(3) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(4) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(5) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(6) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(7) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(8) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--9 > .flex-item:nth-child(9) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n\n@media screen and (min-width: 1025px) {\n  .msg-img-flex-box--10 {\n    width: 540px;\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(1) {\n    height: 270px;\n    width: calc(100% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(2) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(3) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(4) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(5) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(6) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(7) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(8) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(9) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(10) {\n    height: 180px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1024px) {\n  .msg-img-flex-box--10 {\n    width: 405px;\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(1) {\n    height: 202.5px;\n    width: calc(100% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(2) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(3) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(4) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(5) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(6) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(7) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(8) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(9) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(10) {\n    height: 135px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n@media screen and (max-width: 767px) {\n  .msg-img-flex-box--10 {\n    width: 270px;\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(1) {\n    height: 135px;\n    width: calc(100% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(2) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(3) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(4) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(5) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(6) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(7) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(8) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(9) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n  .msg-img-flex-box--10 > .flex-item:nth-child(10) {\n    height: 90px;\n    width: calc(33.3333333333% - 0.2rem);\n  }\n}\n\n.u-pointer {\n  cursor: pointer;\n}\n\n.u-preload {\n  display: none;\n}\n\n.u-txt-opt {\n  display: flex;\n  align-items: center;\n}\n\n.u-active-item {\n  background-color: #444 !important;\n}\n\n.u-dp-flx {\n  display: flex;\n}\n\n.u-dp-flx--btwn {\n  display: flex;\n  justify-content: end;\n}\n\n.u-dp-flx--center {\n  display: flex;\n  justify-content: center;\n}\n\n.u-dp-inln-blck {\n  display: inline-block;\n}\n\n.u-txt-center {\n  text-align: center;\n}\n\n.u-string-shortener {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.u-f-w--bold {\n  font-weight: bold;\n}\n\n.u-bg--alert {\n  background-color: #ff0000 !important;\n}\n\n.u-mrgn-center--hrzn {\n  margin-right: auto;\n  margin-left: auto;\n}\n\n/*  \n▼ Attention\n - Predictable (予測性)\n\n - Resusable (再利用性)\n\n - Sercurable (保守性)\n\n - Extendable (拡張性)\n\n - ID is only for JavaScript fooks (CLASS is the alternative)\n\n - Priority : !important > class > element > *\n\n - NO emittion (e.g. ○ button -> btn)\n - OK emittion (e.g. information -> info) * long and easy-to-know words\n\n - Based on meaning but not look/location (× text-red  ○ text-attention)\n\n - Apply only necessary styles to element selector (body, a, img)\n\n - Don't depend on html (× .content > div > div)\n\n - Don't complicate stylings (× li.item  ○ .item)\n\n\n▼ CSS structure\n - SMACSS (Scalable and Modular Architecture)\n   - Base : default/reset css (body, a, img)\n   - Layout : header, footer (l-)\n   - Module: reusable components (.button, .title)\n   - State : fooks for js (is-open) \n   - Theme : theme swicher (.theme-dark)\n\n - BEMCSS (Block Element Modifier)\n   - Block__Element–-Modifier (up to preference)\n      -> block-element--modifier\n      -> _ for long naming (* block_name)\n   - (e.g.) header-nav__item--contact\n   - contact(modifer) is set to make itself outstanding\n\nSassを使用している場合は以下のルール\n   ローカル変数を最初に定義します\n   @extendをローカル変数の次に指定します\n   @mixinを@extendの次に指定します\n   @contentを使用している@mixinは最後に指定します\n\nボックスモデルの種類や表示方法を示すプロパティ（box-sizing, display, visibility, floatなど）\n位置情報に関するプロパティ（position, z-indexなど）\nボックスモデルのサイズに関するプロパティ（width, height, margin, padding, borderなど）\nフォント関連のプロパティ（font-size, line-heightなど）\n色に関するプロパティ（color, background-colorなど）\nそれ以外\n\n\n▼ プロパティ宣言順\nmixin\nボックスモデルの種類や表示方法を示すプロパティ（box-sizing, display, visibility, floatなど）\n位置情報に関するプロパティ（position, z-indexなど）\nボックスモデルのサイズに関するプロパティ（width, height, margin, padding, borderなど）\nフォント関連のプロパティ（font-size, line-heightなど）\n色に関するプロパティ（color, background-colorなど）\nそれ以外\n@contentを使用している@mixin\n*/\n/*-------------------------------------------------------------------\n|  Foundation                                                       |\n-------------------------------------------------------------------*/\n/*-------------------------------------------------------------------\n|  Layout                                                           |\n|  ワイヤーフレームに定義されるような大きなコンテナブロック(IDセレクタ指定可)   |\n-------------------------------------------------------------------*/\n/*-------------------------------------------------------------------\n|  Object                                                           |\n-------------------------------------------------------------------*/\n/*  Component  -----------------------------------------*/\n/*   Project   -----------------------------------------*/\n/*    Theme    -----------------------------------------*/\n/*   Utility   -----------------------------------------*/", "",{"version":3,"sources":["webpack://./scss/style.scss","webpack://./scss/object/project/user/_entry.scss","webpack://./scss/foundation/_vendors.scss","webpack://./../node_modules/bootstrap/scss/_grid.scss","webpack://./../node_modules/bootstrap/scss/mixins/_grid.scss","webpack://./../node_modules/bootstrap/scss/mixins/_breakpoints.scss","webpack://./scss/foundation/_reset.scss","webpack://./scss/foundation/tools/_variable.scss","webpack://./scss/foundation/_base.scss","webpack://./scss/layout/_header.scss","webpack://./scss/foundation/tools/_mixin.scss","webpack://./scss/layout/_main.scss","webpack://./scss/layout/_footer.scss","webpack://./scss/object/component/_button.scss","webpack://./scss/object/component/_card.scss","webpack://./scss/object/component/_wrapper.scss","webpack://./scss/object/component/_menu.scss","webpack://./scss/object/component/_partition.scss","webpack://./scss/object/project/_auth.scss","webpack://./scss/object/project/_form.scss","webpack://./scss/object/project/_modal.scss","webpack://./scss/object/project/_slide.scss","webpack://./scss/object/project/_management.scss","webpack://./scss/object/project/_shared.scss","webpack://./scss/object/project/admin/_user.scss","webpack://./scss/object/project/user/_index.scss","webpack://./scss/object/utility/_utility.scss"],"names":[],"mappings":"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AAA;E1BotG5C;E0BrrGU;IACE,aAAA;IACA,yBAAA;E1BurGZ;E0BzrGU;IACE,aAAA;IACA,yBAAA;E1B2rGZ;E0B7rGU;IACE,aAAA;IACA,yBAAA;E1B+rGZ;E0BjsGU;IACE,aAAA;IACA,yBAAA;E1BmsGZ;AACF;AU30GE;EgBmGA;IAG4C,YAAA;E1ByuG5C;E0B1sGU;IACE,YAAA;IACA,yBAAA;E1B4sGZ;E0B9sGU;IACE,YAAA;IACA,yBAAA;E1BgtGZ;E0BltGU;IACE,YAAA;IACA,yBAAA;E1BotGZ;E0BttGU;IACE,YAAA;IACA,yBAAA;E1BwtGZ;AACF;;AUh2GE;EgBmGA;IAG4C,YAAA;E1B+vG5C;E0BxtGY;IACE,aAAA;IACA,yBAAA;E1B0tGd;E0B5tGY;IACE,aAAA;IACA,yBAAA;E1B8tGd;E0B3tGY;IACE,aAAA;IACA,oCAAA;E1B6tGd;E0B/tGY;IACE,aAAA;IACA,oCAAA;E1BiuGd;E0BnuGY;IACE,aAAA;IACA,oCAAA;E1BquGd;AACF;AU13GE;EgBmGA;IAG4C,YAAA;E1BwxG5C;E0BjvGY;IACE,eAAA;IACA,yBAAA;E1BmvGd;E0BrvGY;IACE,eAAA;IACA,yBAAA;E1BuvGd;E0BpvGY;IACE,aAAA;IACA,oCAAA;E1BsvGd;E0BxvGY;IACE,aAAA;IACA,oCAAA;E1B0vGd;E0B5vGY;IACE,aAAA;IACA,oCAAA;E1B8vGd;AACF;AUn5GE;EgBmGA;IAG4C,YAAA;E1BizG5C;E0B1wGY;IACE,aAAA;IACA,yBAAA;E1B4wGd;E0B9wGY;IACE,aAAA;IACA,yBAAA;E1BgxGd;E0B7wGY;IACE,YAAA;IACA,oCAAA;E1B+wGd;E0BjxGY;IACE,YAAA;IACA,oCAAA;E1BmxGd;E0BrxGY;IACE,YAAA;IACA,oCAAA;E1BuxGd;AACF;;AU56GE;EgBmGA;IAG4C,YAAA;E1B20G5C;E0BvxGU;IACE,aAAA;IACA,oCAAA;E1ByxGZ;E0B3xGU;IACE,aAAA;IACA,oCAAA;E1B6xGZ;E0B/xGU;IACE,aAAA;IACA,oCAAA;E1BiyGZ;E0BnyGU;IACE,aAAA;IACA,oCAAA;E1BqyGZ;E0BvyGU;IACE,aAAA;IACA,oCAAA;E1ByyGZ;E0B3yGU;IACE,aAAA;IACA,oCAAA;E1B6yGZ;AACF;AU18GE;EgBmGA;IAG4C,YAAA;E1Bw2G5C;E0BpzGU;IACE,aAAA;IACA,oCAAA;E1BszGZ;E0BxzGU;IACE,aAAA;IACA,oCAAA;E1B0zGZ;E0B5zGU;IACE,aAAA;IACA,oCAAA;E1B8zGZ;E0Bh0GU;IACE,aAAA;IACA,oCAAA;E1Bk0GZ;E0Bp0GU;IACE,aAAA;IACA,oCAAA;E1Bs0GZ;E0Bx0GU;IACE,aAAA;IACA,oCAAA;E1B00GZ;AACF;AUv+GE;EgBmGA;IAG4C,YAAA;E1Bq4G5C;E0Bj1GU;IACE,YAAA;IACA,oCAAA;E1Bm1GZ;E0Br1GU;IACE,YAAA;IACA,oCAAA;E1Bu1GZ;E0Bz1GU;IACE,YAAA;IACA,oCAAA;E1B21GZ;E0B71GU;IACE,YAAA;IACA,oCAAA;E1B+1GZ;E0Bj2GU;IACE,YAAA;IACA,oCAAA;E1Bm2GZ;E0Br2GU;IACE,YAAA;IACA,oCAAA;E1Bu2GZ;AACF;;AUpgHE;EgBmGA;IAG4C,YAAA;E1Bm6G5C;E0Bv2GY;IACE,aAAA;IACA,0BAAA;E1By2Gd;E0Bt2GY;IACE,aAAA;IACA,oCAAA;E1Bw2Gd;E0B12GY;IACE,aAAA;IACA,oCAAA;E1B42Gd;E0B92GY;IACE,aAAA;IACA,oCAAA;E1Bg3Gd;E0Bl3GY;IACE,aAAA;IACA,oCAAA;E1Bo3Gd;E0Bt3GY;IACE,aAAA;IACA,oCAAA;E1Bw3Gd;E0B13GY;IACE,aAAA;IACA,oCAAA;E1B43Gd;AACF;AUtiHE;EgBmGA;IAG4C,YAAA;E1Bo8G5C;E0Bx4GY;IACE,eAAA;IACA,0BAAA;E1B04Gd;E0Bv4GY;IACE,aAAA;IACA,oCAAA;E1By4Gd;E0B34GY;IACE,aAAA;IACA,oCAAA;E1B64Gd;E0B/4GY;IACE,aAAA;IACA,oCAAA;E1Bi5Gd;E0Bn5GY;IACE,aAAA;IACA,oCAAA;E1Bq5Gd;E0Bv5GY;IACE,aAAA;IACA,oCAAA;E1By5Gd;E0B35GY;IACE,aAAA;IACA,oCAAA;E1B65Gd;AACF;AUvkHE;EgBmGA;IAG4C,YAAA;E1Bq+G5C;E0Bz6GY;IACE,aAAA;IACA,0BAAA;E1B26Gd;E0Bx6GY;IACE,YAAA;IACA,oCAAA;E1B06Gd;E0B56GY;IACE,YAAA;IACA,oCAAA;E1B86Gd;E0Bh7GY;IACE,YAAA;IACA,oCAAA;E1Bk7Gd;E0Bp7GY;IACE,YAAA;IACA,oCAAA;E1Bs7Gd;E0Bx7GY;IACE,YAAA;IACA,oCAAA;E1B07Gd;E0B57GY;IACE,YAAA;IACA,oCAAA;E1B87Gd;AACF;;AUxmHE;EgBmGA;IAG4C,YAAA;E1BugH5C;E0B77GY;IACE,aAAA;IACA,yBAAA;E1B+7Gd;E0Bj8GY;IACE,aAAA;IACA,yBAAA;E1Bm8Gd;E0Bh8GY;IACE,aAAA;IACA,oCAAA;E1Bk8Gd;E0Bp8GY;IACE,aAAA;IACA,oCAAA;E1Bs8Gd;E0Bx8GY;IACE,aAAA;IACA,oCAAA;E1B08Gd;E0B58GY;IACE,aAAA;IACA,oCAAA;E1B88Gd;E0Bh9GY;IACE,aAAA;IACA,oCAAA;E1Bk9Gd;E0Bp9GY;IACE,aAAA;IACA,oCAAA;E1Bs9Gd;AACF;AU9oHE;EgBmGA;IAG4C,YAAA;E1B4iH5C;E0Bl+GY;IACE,eAAA;IACA,yBAAA;E1Bo+Gd;E0Bt+GY;IACE,eAAA;IACA,yBAAA;E1Bw+Gd;E0Br+GY;IACE,aAAA;IACA,oCAAA;E1Bu+Gd;E0Bz+GY;IACE,aAAA;IACA,oCAAA;E1B2+Gd;E0B7+GY;IACE,aAAA;IACA,oCAAA;E1B++Gd;E0Bj/GY;IACE,aAAA;IACA,oCAAA;E1Bm/Gd;E0Br/GY;IACE,aAAA;IACA,oCAAA;E1Bu/Gd;E0Bz/GY;IACE,aAAA;IACA,oCAAA;E1B2/Gd;AACF;AUnrHE;EgBmGA;IAG4C,YAAA;E1BilH5C;E0BvgHY;IACE,aAAA;IACA,yBAAA;E1BygHd;E0B3gHY;IACE,aAAA;IACA,yBAAA;E1B6gHd;E0B1gHY;IACE,YAAA;IACA,oCAAA;E1B4gHd;E0B9gHY;IACE,YAAA;IACA,oCAAA;E1BghHd;E0BlhHY;IACE,YAAA;IACA,oCAAA;E1BohHd;E0BthHY;IACE,YAAA;IACA,oCAAA;E1BwhHd;E0B1hHY;IACE,YAAA;IACA,oCAAA;E1B4hHd;E0B9hHY;IACE,YAAA;IACA,oCAAA;E1BgiHd;AACF;;AUxtHE;EgBmGA;IAG4C,YAAA;E1BunH5C;E0BhiHU;IACE,aAAA;IACA,oCAAA;E1BkiHZ;E0BpiHU;IACE,aAAA;IACA,oCAAA;E1BsiHZ;E0BxiHU;IACE,aAAA;IACA,oCAAA;E1B0iHZ;E0B5iHU;IACE,aAAA;IACA,oCAAA;E1B8iHZ;E0BhjHU;IACE,aAAA;IACA,oCAAA;E1BkjHZ;E0BpjHU;IACE,aAAA;IACA,oCAAA;E1BsjHZ;E0BxjHU;IACE,aAAA;IACA,oCAAA;E1B0jHZ;E0B5jHU;IACE,aAAA;IACA,oCAAA;E1B8jHZ;E0BhkHU;IACE,aAAA;IACA,oCAAA;E1BkkHZ;AACF;AUlwHE;EgBmGA;IAG4C,YAAA;E1BgqH5C;E0BzkHU;IACE,aAAA;IACA,oCAAA;E1B2kHZ;E0B7kHU;IACE,aAAA;IACA,oCAAA;E1B+kHZ;E0BjlHU;IACE,aAAA;IACA,oCAAA;E1BmlHZ;E0BrlHU;IACE,aAAA;IACA,oCAAA;E1BulHZ;E0BzlHU;IACE,aAAA;IACA,oCAAA;E1B2lHZ;E0B7lHU;IACE,aAAA;IACA,oCAAA;E1B+lHZ;E0BjmHU;IACE,aAAA;IACA,oCAAA;E1BmmHZ;E0BrmHU;IACE,aAAA;IACA,oCAAA;E1BumHZ;E0BzmHU;IACE,aAAA;IACA,oCAAA;E1B2mHZ;AACF;AU3yHE;EgBmGA;IAG4C,YAAA;E1BysH5C;E0BlnHU;IACE,YAAA;IACA,oCAAA;E1BonHZ;E0BtnHU;IACE,YAAA;IACA,oCAAA;E1BwnHZ;E0B1nHU;IACE,YAAA;IACA,oCAAA;E1B4nHZ;E0B9nHU;IACE,YAAA;IACA,oCAAA;E1BgoHZ;E0BloHU;IACE,YAAA;IACA,oCAAA;E1BooHZ;E0BtoHU;IACE,YAAA;IACA,oCAAA;E1BwoHZ;E0B1oHU;IACE,YAAA;IACA,oCAAA;E1B4oHZ;E0B9oHU;IACE,YAAA;IACA,oCAAA;E1BgpHZ;E0BlpHU;IACE,YAAA;IACA,oCAAA;E1BopHZ;AACF;;AUp1HE;EgBmGA;IAG4C,YAAA;E1BmvH5C;E0BppHY;IACE,aAAA;IACA,0BAAA;E1BspHd;E0BnpHY;IACE,aAAA;IACA,oCAAA;E1BqpHd;E0BvpHY;IACE,aAAA;IACA,oCAAA;E1BypHd;E0B3pHY;IACE,aAAA;IACA,oCAAA;E1B6pHd;E0B/pHY;IACE,aAAA;IACA,oCAAA;E1BiqHd;E0BnqHY;IACE,aAAA;IACA,oCAAA;E1BqqHd;E0BvqHY;IACE,aAAA;IACA,oCAAA;E1ByqHd;E0B3qHY;IACE,aAAA;IACA,oCAAA;E1B6qHd;E0B/qHY;IACE,aAAA;IACA,oCAAA;E1BirHd;E0BnrHY;IACE,aAAA;IACA,oCAAA;E1BqrHd;AACF;AUl4HE;EgBmGA;IAG4C,YAAA;E1BgyH5C;E0BjsHY;IACE,eAAA;IACA,0BAAA;E1BmsHd;E0BhsHY;IACE,aAAA;IACA,oCAAA;E1BksHd;E0BpsHY;IACE,aAAA;IACA,oCAAA;E1BssHd;E0BxsHY;IACE,aAAA;IACA,oCAAA;E1B0sHd;E0B5sHY;IACE,aAAA;IACA,oCAAA;E1B8sHd;E0BhtHY;IACE,aAAA;IACA,oCAAA;E1BktHd;E0BptHY;IACE,aAAA;IACA,oCAAA;E1BstHd;E0BxtHY;IACE,aAAA;IACA,oCAAA;E1B0tHd;E0B5tHY;IACE,aAAA;IACA,oCAAA;E1B8tHd;E0BhuHY;IACE,aAAA;IACA,oCAAA;E1BkuHd;AACF;AU/6HE;EgBmGA;IAG4C,YAAA;E1B60H5C;E0B9uHY;IACE,aAAA;IACA,0BAAA;E1BgvHd;E0B7uHY;IACE,YAAA;IACA,oCAAA;E1B+uHd;E0BjvHY;IACE,YAAA;IACA,oCAAA;E1BmvHd;E0BrvHY;IACE,YAAA;IACA,oCAAA;E1BuvHd;E0BzvHY;IACE,YAAA;IACA,oCAAA;E1B2vHd;E0B7vHY;IACE,YAAA;IACA,oCAAA;E1B+vHd;E0BjwHY;IACE,YAAA;IACA,oCAAA;E1BmwHd;E0BrwHY;IACE,YAAA;IACA,oCAAA;E1BuwHd;E0BzwHY;IACE,YAAA;IACA,oCAAA;E1B2wHd;E0B7wHY;IACE,YAAA;IACA,oCAAA;E1B+wHd;AACF;;A0BlwHA;EAAa,eAAA;A1BswHb;;A0BnwHA;EAAa,aAAA;A1BuwHb;;A0BpwHA;EACE,aAAA;EACA,mBAAA;A1BuwHF;;A0BnwHA;EACE,iCAAA;A1BswHF;;A0BnwHA;EAAY,aAAA;A1BuwHZ;;A0BtwHA;EACE,aAAA;EACA,oBAAA;A1BywHF;;A0BvwHA;EACE,aAAA;EACA,uBAAA;A1B0wHF;;A0BvwHA;EAAkB,qBAAA;A1B2wHlB;;A0BzwHA;EAAgB,kBAAA;A1B6wHhB;;A0B3wHA;EACE,gBAAA;EACA,uBAAA;EACA,mBAAA;A1B8wHF;;A0B3wHA;EAAe,iBAAA;A1B+wHf;;A0B7wHA;EAAe,oCAAA;A1BixHf;;A0B/wHA;EACE,kBAAA;EACA,iBAAA;A1BkxHF;;AApiIA;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;CAAA;AAkEA;;oEAAA;AAgBA;;;oEAAA;AASA;;oEAAA;AAIA,yDAAA;AASA,yDAAA;AAkBA,yDAAA;AAEA,yDAAA","sourcesContent":["/*  \n▼ Attention\n - Predictable (予測性)\n\n - Resusable (再利用性)\n\n - Sercurable (保守性)\n\n - Extendable (拡張性)\n\n - ID is only for JavaScript fooks (CLASS is the alternative)\n\n - Priority : !important > class > element > *\n\n - NO emittion (e.g. ○ button -> btn)\n - OK emittion (e.g. information -> info) * long and easy-to-know words\n\n - Based on meaning but not look/location (× text-red  ○ text-attention)\n\n - Apply only necessary styles to element selector (body, a, img)\n\n - Don't depend on html (× .content > div > div)\n\n - Don't complicate stylings (× li.item  ○ .item)\n\n\n▼ CSS structure\n - SMACSS (Scalable and Modular Architecture)\n   - Base : default/reset css (body, a, img)\n   - Layout : header, footer (l-)\n   - Module: reusable components (.button, .title)\n   - State : fooks for js (is-open) \n   - Theme : theme swicher (.theme-dark)\n\n - BEMCSS (Block Element Modifier)\n   - Block__Element–-Modifier (up to preference)\n      -> block-element--modifier\n      -> _ for long naming (* block_name)\n   - (e.g.) header-nav__item--contact\n   - contact(modifer) is set to make itself outstanding\n\nSassを使用している場合は以下のルール\n   ローカル変数を最初に定義します\n   @extendをローカル変数の次に指定します\n   @mixinを@extendの次に指定します\n   @contentを使用している@mixinは最後に指定します\n\nボックスモデルの種類や表示方法を示すプロパティ（box-sizing, display, visibility, floatなど）\n位置情報に関するプロパティ（position, z-indexなど）\nボックスモデルのサイズに関するプロパティ（width, height, margin, padding, borderなど）\nフォント関連のプロパティ（font-size, line-heightなど）\n色に関するプロパティ（color, background-colorなど）\nそれ以外\n\n\n▼ プロパティ宣言順\nmixin\nボックスモデルの種類や表示方法を示すプロパティ（box-sizing, display, visibility, floatなど）\n位置情報に関するプロパティ（position, z-indexなど）\nボックスモデルのサイズに関するプロパティ（width, height, margin, padding, borderなど）\nフォント関連のプロパティ（font-size, line-heightなど）\n色に関するプロパティ（color, background-colorなど）\nそれ以外\n@contentを使用している@mixin\n*/\n\n/*-------------------------------------------------------------------\n|  Foundation                                                       |\n-------------------------------------------------------------------*/\n\n@use \"foundation/vendors\" with (\n   // bootstrap内の変数の上書き\n   $grid-breakpoints: (\n      sp:    320px,\n      tab:   768px,\n      pc:    1024px\n   ),\n   $grid-columns: 24\n);\n@use \"foundation/reset\";\n@use \"foundation/base\";\n\n/*-------------------------------------------------------------------\n|  Layout                                                           |\n|  ワイヤーフレームに定義されるような大きなコンテナブロック(IDセレクタ指定可)   |\n-------------------------------------------------------------------*/\n\n@use \"layout/header\";\n@use \"layout/main\";\n@use \"layout/footer\";\n\n/*-------------------------------------------------------------------\n|  Object                                                           |\n-------------------------------------------------------------------*/\n\n/*  Component  -----------------------------------------*/\n// Component 再利用できるような小さなモジュール、固有の幅や装飾的なスタイルは極力指定しない\n@use \"object/component/button\";\n@use \"object/component/card\";\n@use \"object/component/wrapper\";\n@use \"object/component/menu\";\n@use \"object/component/partition\";\n\n\n/*   Project   -----------------------------------------*/\n// プロジェクト固有のUI(殆どのスタイルの追加はこのレイヤー)\n@use \"object/project/auth\";\n@use \"object/project/form\";\n@use \"object/project/modal\";\n@use \"object/project/slide\";\n@use \"object/project/management\";\n@use \"object/project/shared\";\n\n@use \"object/project/admin/admin\";\n@use \"object/project/admin/user\";\n@use \"object/project/user/entry\";\n@use \"object/project/user/index\";\n\n\n\n\n\n/*    Theme    -----------------------------------------*/\n\n/*   Utility   -----------------------------------------*/\n@use \"object/utility/utility\";","// _entry.scss\n\n/*\n* --- プロパティ宣言順 ------\n* mixin\n* ボックスモデルの種類や表示方法を示すプロパティ（box-sizing, display, visibility, floatなど）\n* 位置情報に関するプロパティ（position, z-indexなど）\n* ボックスモデルのサイズに関するプロパティ（width, height, margin, padding, borderなど）\n* フォント関連のプロパティ（font-size, line-heightなど）\n* 色に関するプロパティ（color, background-colorなど）\n* それ以外\n* @contentを使用している@mixin\n* --- webpack関連 注意事項 ----\n* background-imageは../img~ (import先のstyle.scssで読み込まれるため)\n* \n* --- その他 注意事項 ----\n* HTMLでimgのaltつけ忘れに用心\n* \n*/\n\n@use \"../../../foundation/tools/global\" as *;\n\n// Top セクション -----------------------------------------------\n// #p-entry-top {}\n\n.p-entry-top__entry {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: $space-md;\n  padding: $space-md;\n  border-radius: map-get($border-radius-size, primary);\n}\n\n.p-entry-top__entry-wrap, .p-entry-top__image-wrap { padding: 0 0.5rem; }\n\n.p-entry-top__entry-wrap { margin-bottom: $space-lg; }\n\n.p-entry-top__signin-entry { background-color: map-get($bg-colors, secondary); }\n\n.p-entry-top__signup-entry { background-color: map-get($bg-colors, tertiary); }\n\n\n// About セクション ---------------------------------------------\n// #p-entry-about { }\n\n@import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');\n\n.p-entry-about__news-section-head{\n  margin-bottom: $space-sm;\n  font-size: map-get($font-size, title-primary);\n  font-style: italic;\n}\n\n.p-entry-about__brief-wrap {\n  display: flex;\n  flex-flow: column;\n  justify-content: space-around;\n  text-align: center;\n  margin-bottom: $space-2xlg;\n}\n\n.p-entry-about__github-entry {\n  padding: 5px;\n  border-radius: 0.3rem;\n  font-size: map-get($font-size, link-primary);\n  background-color: map-get($bg-colors, tertiary);\n  @include hover() {\n    color: wheat;\n  }\n}\n\n.p-entry-about__news-list {\n  overflow: scroll;\n  max-height: 65vh;\n  padding: $space-2xsm $space-md;\n  border: 1px solid;\n  border-radius: map-get($border-radius-size, primary);\n  @include mq(sp) {\n    max-height: 55vh;\n  }\n}\n\n.p-entry-about__news-wrap {\n  padding: $space-2xsm 0 $space-xsm;\n  border-bottom: map-get($border, primary-sm);\n}\n\n.p-entry-about__news-wrap:last-child { border: none; }\n\n.p-entry-about__news-header-wrap {\n  display: flex;\n  align-items: center;\n  min-height: 2rem;\n}\n\n.p-entry-about__news-pilar-icon { //? pilar icon componentならん？ (l-headerにあり)\n  border-left: 4px solid white;\n  height: 1.5rem;\n  margin-bottom: auto;\n  margin-right: $space-xsm;\n  margin-top: auto;\n  border-radius: 0.3rem;\n}\n\n.p-entry-about__news-header { font-size: map-get($font-size, title-tertiary); }\n\n.p-entry-about__news-content { line-height: $lineheight-half; }\n\n.p-entry-about__news-date {\n  margin: $space-2xsm 0;\n  font-size: map-get($font-size, date);\n  color: map-get($font-colors, secondary);\n}\n\n\n// Func セクション ----------------------------------------------\n// #p-entry-func {  }\n\n.p-entry-func__modal-entry {\n  margin-bottom: $space-xlg;\n  padding: 0 $space-xsm;\n}\n\n.p-entry-func__modal-entry:nth-child(5) { margin: 0; }\n\n.p-entry-func__img-wrap {\n  transition: scale 0.2s ease;\n  position: relative;\n  padding-top: 66.666667%;\n  margin-bottom: $space-md;\n  border-radius: map-get($border-radius-size, primary);\n  box-shadow: 0.05em 0.15em 0.3em rgba(0, 0, 0, 0.2);\n  @include hover() {\n    scale: 1.05;\n    box-shadow: 0.15em 0.45em 0.9em rgba(0,0,0,0.25);\n  }\n}\n\n.p-entry-func__modal-opener {\n  overflow: hidden;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  border-radius: map-get($border-radius-size, primary);\n  background-repeat: no-repeat;\n  background-size: cover;\n  background-position: 50% 50%;\n  cursor: pointer;\n}\n\n#p-entry-func__modal-image--channel { background-image: url(../img/channel1.png); }\n\n#p-entry-func__modal-image--meeting { background-image: url(../img/channel1.png); }\n\n#p-entry-func__modal-image--message { background-image: url(../img/message1.png); }\n\n.p-entry-func__img-txt { text-align: center; }\n\n.p-entry-func__modal-txt {\n  overflow: scroll;\n  max-height: 40em;\n  margin-bottom: $space-md;\n  @include mq(sp) {\n    overflow: unset;\n    max-height: none;\n  }\n}\n\n.p-entry-func__modal-thumnails {\n  text-align: center;\n  >img {\n    width: 75px;\n    height: 75px;\n    margin-right: $space-2xsm;\n    margin-bottom: $space-xsm;\n    border-radius: map-get($border-radius-size, primary);\n    object-fit: cover;\n    cursor: pointer;\n    &[data-status=\"on\"] {\n      scale: 1.1;\n      box-shadow: 0.05em 0.15em 0.3em rgba(0, 0, 0, 0.3);\n    }\n  }\n}\n\n.p-entry-func__modal-mainimage {\n  display: flex;\n  overflow: hidden;\n  >img {\n    max-height: 600px;\n    max-width: 100%;\n  }\n}","// _vendors.scss\n\n/*-------------------------------------------------------------------\n|  Bootstrap                                                        |\n-------------------------------------------------------------------*/\n\n// 関数（カラー、SVG、計算などが操作できるように）\n@import \"~bootstrap/scss/functions\";\n\n// 変数\n@import \"~bootstrap/scss/variables\";\n\n// ツール (map, mixin, grid機能など)\n@import \"~bootstrap/scss/maps\";\n@import \"~bootstrap/scss/mixins\";\n@import \"~bootstrap/scss/grid\";\n\n// Bootstrapから輸入したsassを上書き\n.row, .row > * {\n  padding: 0;\n  margin: 0;\n}","// Row\n//\n// Rows contain your columns.\n\n@if $enable-grid-classes {\n  .row {\n    @include make-row();\n\n    > * {\n      @include make-col-ready();\n    }\n  }\n}\n\n@if $enable-cssgrid {\n  .grid {\n    display: grid;\n    grid-template-rows: repeat(var(--#{$prefix}rows, 1), 1fr);\n    grid-template-columns: repeat(var(--#{$prefix}columns, #{$grid-columns}), 1fr);\n    gap: var(--#{$prefix}gap, #{$grid-gutter-width});\n\n    @include make-cssgrid();\n  }\n}\n\n\n// Columns\n//\n// Common styles for small and large grid columns\n\n@if $enable-grid-classes {\n  @include make-grid-columns();\n}\n","// Grid system\n//\n// Generate semantic grid columns with these mixins.\n\n@mixin make-row($gutter: $grid-gutter-width) {\n  --#{$prefix}gutter-x: #{$gutter};\n  --#{$prefix}gutter-y: 0;\n  display: flex;\n  flex-wrap: wrap;\n  // TODO: Revisit calc order after https://github.com/react-bootstrap/react-bootstrap/issues/6039 is fixed\n  margin-top: calc(-1 * var(--#{$prefix}gutter-y)); // stylelint-disable-line function-disallowed-list\n  margin-right: calc(-.5 * var(--#{$prefix}gutter-x)); // stylelint-disable-line function-disallowed-list\n  margin-left: calc(-.5 * var(--#{$prefix}gutter-x)); // stylelint-disable-line function-disallowed-list\n}\n\n@mixin make-col-ready() {\n  // Add box sizing if only the grid is loaded\n  box-sizing: if(variable-exists(include-column-box-sizing) and $include-column-box-sizing, border-box, null);\n  // Prevent columns from becoming too narrow when at smaller grid tiers by\n  // always setting `width: 100%;`. This works because we set the width\n  // later on to override this initial width.\n  flex-shrink: 0;\n  width: 100%;\n  max-width: 100%; // Prevent `.col-auto`, `.col` (& responsive variants) from breaking out the grid\n  padding-right: calc(var(--#{$prefix}gutter-x) * .5); // stylelint-disable-line function-disallowed-list\n  padding-left: calc(var(--#{$prefix}gutter-x) * .5); // stylelint-disable-line function-disallowed-list\n  margin-top: var(--#{$prefix}gutter-y);\n}\n\n@mixin make-col($size: false, $columns: $grid-columns) {\n  @if $size {\n    flex: 0 0 auto;\n    width: percentage(divide($size, $columns));\n\n  } @else {\n    flex: 1 1 0;\n    max-width: 100%;\n  }\n}\n\n@mixin make-col-auto() {\n  flex: 0 0 auto;\n  width: auto;\n}\n\n@mixin make-col-offset($size, $columns: $grid-columns) {\n  $num: divide($size, $columns);\n  margin-left: if($num == 0, 0, percentage($num));\n}\n\n// Row columns\n//\n// Specify on a parent element(e.g., .row) to force immediate children into NN\n// number of columns. Supports wrapping to new lines, but does not do a Masonry\n// style grid.\n@mixin row-cols($count) {\n  > * {\n    flex: 0 0 auto;\n    width: divide(100%, $count);\n  }\n}\n\n// Framework grid generation\n//\n// Used only by Bootstrap to generate the correct number of grid classes given\n// any value of `$grid-columns`.\n\n@mixin make-grid-columns($columns: $grid-columns, $gutter: $grid-gutter-width, $breakpoints: $grid-breakpoints) {\n  @each $breakpoint in map-keys($breakpoints) {\n    $infix: breakpoint-infix($breakpoint, $breakpoints);\n\n    @include media-breakpoint-up($breakpoint, $breakpoints) {\n      // Provide basic `.col-{bp}` classes for equal-width flexbox columns\n      .col#{$infix} {\n        flex: 1 0 0%; // Flexbugs #4: https://github.com/philipwalton/flexbugs#flexbug-4\n      }\n\n      .row-cols#{$infix}-auto > * {\n        @include make-col-auto();\n      }\n\n      @if $grid-row-columns > 0 {\n        @for $i from 1 through $grid-row-columns {\n          .row-cols#{$infix}-#{$i} {\n            @include row-cols($i);\n          }\n        }\n      }\n\n      .col#{$infix}-auto {\n        @include make-col-auto();\n      }\n\n      @if $columns > 0 {\n        @for $i from 1 through $columns {\n          .col#{$infix}-#{$i} {\n            @include make-col($i, $columns);\n          }\n        }\n\n        // `$columns - 1` because offsetting by the width of an entire row isn't possible\n        @for $i from 0 through ($columns - 1) {\n          @if not ($infix == \"\" and $i == 0) { // Avoid emitting useless .offset-0\n            .offset#{$infix}-#{$i} {\n              @include make-col-offset($i, $columns);\n            }\n          }\n        }\n      }\n\n      // Gutters\n      //\n      // Make use of `.g-*`, `.gx-*` or `.gy-*` utilities to change spacing between the columns.\n      @each $key, $value in $gutters {\n        .g#{$infix}-#{$key},\n        .gx#{$infix}-#{$key} {\n          --#{$prefix}gutter-x: #{$value};\n        }\n\n        .g#{$infix}-#{$key},\n        .gy#{$infix}-#{$key} {\n          --#{$prefix}gutter-y: #{$value};\n        }\n      }\n    }\n  }\n}\n\n@mixin make-cssgrid($columns: $grid-columns, $breakpoints: $grid-breakpoints) {\n  @each $breakpoint in map-keys($breakpoints) {\n    $infix: breakpoint-infix($breakpoint, $breakpoints);\n\n    @include media-breakpoint-up($breakpoint, $breakpoints) {\n      @if $columns > 0 {\n        @for $i from 1 through $columns {\n          .g-col#{$infix}-#{$i} {\n            grid-column: auto / span $i;\n          }\n        }\n\n        // Start with `1` because `0` is and invalid value.\n        // Ends with `$columns - 1` because offsetting by the width of an entire row isn't possible.\n        @for $i from 1 through ($columns - 1) {\n          .g-start#{$infix}-#{$i} {\n            grid-column-start: $i;\n          }\n        }\n      }\n    }\n  }\n}\n","// Breakpoint viewport sizes and media queries.\n//\n// Breakpoints are defined as a map of (name: minimum width), order from small to large:\n//\n//    (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px)\n//\n// The map defined in the `$grid-breakpoints` global variable is used as the `$breakpoints` argument by default.\n\n// Name of the next breakpoint, or null for the last breakpoint.\n//\n//    >> breakpoint-next(sm)\n//    md\n//    >> breakpoint-next(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px))\n//    md\n//    >> breakpoint-next(sm, $breakpoint-names: (xs sm md lg xl xxl))\n//    md\n@function breakpoint-next($name, $breakpoints: $grid-breakpoints, $breakpoint-names: map-keys($breakpoints)) {\n  $n: index($breakpoint-names, $name);\n  @if not $n {\n    @error \"breakpoint `#{$name}` not found in `#{$breakpoints}`\";\n  }\n  @return if($n < length($breakpoint-names), nth($breakpoint-names, $n + 1), null);\n}\n\n// Minimum breakpoint width. Null for the smallest (first) breakpoint.\n//\n//    >> breakpoint-min(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px))\n//    576px\n@function breakpoint-min($name, $breakpoints: $grid-breakpoints) {\n  $min: map-get($breakpoints, $name);\n  @return if($min != 0, $min, null);\n}\n\n// Maximum breakpoint width.\n// The maximum value is reduced by 0.02px to work around the limitations of\n// `min-` and `max-` prefixes and viewports with fractional widths.\n// See https://www.w3.org/TR/mediaqueries-4/#mq-min-max\n// Uses 0.02px rather than 0.01px to work around a current rounding bug in Safari.\n// See https://bugs.webkit.org/show_bug.cgi?id=178261\n//\n//    >> breakpoint-max(md, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px))\n//    767.98px\n@function breakpoint-max($name, $breakpoints: $grid-breakpoints) {\n  $max: map-get($breakpoints, $name);\n  @return if($max and $max > 0, $max - .02, null);\n}\n\n// Returns a blank string if smallest breakpoint, otherwise returns the name with a dash in front.\n// Useful for making responsive utilities.\n//\n//    >> breakpoint-infix(xs, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px))\n//    \"\"  (Returns a blank string)\n//    >> breakpoint-infix(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px))\n//    \"-sm\"\n@function breakpoint-infix($name, $breakpoints: $grid-breakpoints) {\n  @return if(breakpoint-min($name, $breakpoints) == null, \"\", \"-#{$name}\");\n}\n\n// Media of at least the minimum breakpoint width. No query for the smallest breakpoint.\n// Makes the @content apply to the given breakpoint and wider.\n@mixin media-breakpoint-up($name, $breakpoints: $grid-breakpoints) {\n  $min: breakpoint-min($name, $breakpoints);\n  @if $min {\n    @media (min-width: $min) {\n      @content;\n    }\n  } @else {\n    @content;\n  }\n}\n\n// Media of at most the maximum breakpoint width. No query for the largest breakpoint.\n// Makes the @content apply to the given breakpoint and narrower.\n@mixin media-breakpoint-down($name, $breakpoints: $grid-breakpoints) {\n  $max: breakpoint-max($name, $breakpoints);\n  @if $max {\n    @media (max-width: $max) {\n      @content;\n    }\n  } @else {\n    @content;\n  }\n}\n\n// Media that spans multiple breakpoint widths.\n// Makes the @content apply between the min and max breakpoints\n@mixin media-breakpoint-between($lower, $upper, $breakpoints: $grid-breakpoints) {\n  $min: breakpoint-min($lower, $breakpoints);\n  $max: breakpoint-max($upper, $breakpoints);\n\n  @if $min != null and $max != null {\n    @media (min-width: $min) and (max-width: $max) {\n      @content;\n    }\n  } @else if $max == null {\n    @include media-breakpoint-up($lower, $breakpoints) {\n      @content;\n    }\n  } @else if $min == null {\n    @include media-breakpoint-down($upper, $breakpoints) {\n      @content;\n    }\n  }\n}\n\n// Media between the breakpoint's minimum and maximum widths.\n// No minimum for the smallest breakpoint, and no maximum for the largest one.\n// Makes the @content apply only to the given breakpoint, not viewports any wider or narrower.\n@mixin media-breakpoint-only($name, $breakpoints: $grid-breakpoints) {\n  $min:  breakpoint-min($name, $breakpoints);\n  $next: breakpoint-next($name, $breakpoints);\n  $max:  breakpoint-max($next, $breakpoints);\n\n  @if $min != null and $max != null {\n    @media (min-width: $min) and (max-width: $max) {\n      @content;\n    }\n  } @else if $max == null {\n    @include media-breakpoint-up($name, $breakpoints) {\n      @content;\n    }\n  } @else if $min == null {\n    @include media-breakpoint-down($next, $breakpoints) {\n      @content;\n    }\n  }\n}\n","/* http://meyerweb.com/eric/tools/css/reset/ \n  v2.0 | 20110126\n  License: none (public domain)\n*/\n\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font: inherit;\n  vertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\n// body {\n// \tline-height: 1;\n// }\nol, ul {\n  list-style: none;\n}\nblockquote, q {\n  quotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n  content: '';\n  content: none;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}","/** #Index ... 各項目に # を付けて検索できます\n  ▼ Bootstrapにて使用される変数の上書き\n * MediaQuery..........メディアクエリ時に使用する変数\n\n  ▼ 自作の変数\n * Color...............色の変数 (font, bg, btn, border)\n * Font................fontの変数(size, family)\n * Line height.........line-heightのサイズを定める変数\n * Border..............borderのサイズを定める変数\n * Spacing.............要素の外/内側に設ける空間を定める変数(margin, padding)\n * Layout..............Layout配下の要素で、操作を受けやすいプロパティ値を変数化\n * Project.............Project配下の要素で、操作を受けやすいプロパティ値を変数化\n * \n * \n * \n * \n * \n * \n * \n**/\n\n\n/*-------------------------------------\n|   #Bootstrapにて使用される変数の上書き   |\n-------------------------------------*/\n\n/*  #MediaQuery  ---------------------------------------------*/\n\n// bootstrapのgrid機能にて使用\n$grid-breakpoints: (\n  sp:    480px,\n  tab:   768px,\n  pc:    1024px\n);\n\n/*  使用方法   //! 要記載\nhtmlでのクラス記載...\n\nrow\nrow-cols-sp-1\nrow-cols-tab-2\nrow-cols-pc-4\n\ncol\n*/\n\n\n\n\n/*---------------\n|   #自作の変数   |\n---------------*/\n\n/*  #Color  ---------------------------------------------*/\n\n// 各色の変数\n$blue:       #0d6efd !default;\n$pink:       #d63384 !default;\n$red:        #ff0000 !default;\n$orange:     #fd7e14 !default;\n$yellow:     #ffc107 !default;\n$green:      #198754 !default;\n$teal:       #20c997 !default;\n$skyblue:    #159ed0 !default;\n$white:      #fff !default;\n$black:      #1b1b1b !default;\n$black-tp:   #1b1b1bc7 !default;\n\n$gray-2xl:   #888 !default;\n$gray-xl:    #777 !default;\n$gray-l:     #666 !default;\n$gray-md:    #555 !default;\n$gray-h:     #444 !default;\n$gray-xh:    #333 !default;\n$gray-2xh:   #222 !default;\n\n// フォントの色\n$font-colors: (\n  \"primary\":       $white,\n  \"secondary\":     $gray-xl,\n  \"white-back\":    $black,\n  \"date\":          $gray-2xl,\n  \"dcmnt\":         $skyblue,\n  \"alert\":         $red,\n  \"outstanding\":   $skyblue\n) !default;\n\n// 背景の色\n$bg-colors: (\n  \"primary\":        $black,\n  \"primary-tp\":     $black-tp,\n  \"secondary\":      $gray-2xh,\n  \"tertiary\":       $gray-xh,\n  \"quaternary\":     $gray-h,\n  \"quinary\":        $gray-md,\n  \"active\":         $gray-h,\n  \"loading\":        $white,\n  \"modal\":          $gray-h,\n  \"alert\":          $red\n) !default;\n\n// ボタンの色\n$btn-bg-colors: (\n  \"primary\":        $gray-xh,\n  \"secondary\":      $gray-l,\n  \"white-back\":     $black,\n  \"outstanding\":    $skyblue\n) !default;\n\n$border-colors: (\n  \"primary\":       $gray-xl,\n  \"secondary\":     $gray-2xl,\n  \"white-back\":    $black\n) !default;\n\n\n/*  #Font  ---------------------------------------------*/\n$font-size-base:           1rem !default;\n$font-size-2xsm:           $font-size-base * 0.62 !default;\n$font-size-xsm:            $font-size-base * 0.72 !default;\n$font-size-sm:             $font-size-base * 0.82 !default;\n$font-size-md:             $font-size-base * 1 !default;\n$font-size-lg:             $font-size-base * 1.2 !default;\n$font-size-xlg:            $font-size-base * 1.4 !default;\n$font-size-2xlg:           $font-size-base * 1.8 !default;\n$font-size-3xlg:           $font-size-base * 2.4 !default;\n$font-size-exlg:           $font-size-base * 4 !default;\n\n$font-size: (\n  \"primary\":               $font-size-sm,\n  \"secondary\":             $font-size-xsm,\n  \"tertiary\":              $font-size-2xsm,\n  \"title-primary\":         $font-size-xlg,\n  \"title-secondary\":       $font-size-lg,\n  \"title-tertiary\":        $font-size-md,\n  \"title-quaternary\":      $font-size-sm,\n  \"title-output\":          $font-size-3xlg,\n  \"link-primary\":          $font-size-md,\n  \"table-label-primary\":   $font-size-md,\n  \"table-label-secondary\": $font-size-sm,\n  \"card\":                  $font-size-md,\n  \"btn-icon\":              $font-size-sm,\n  \"btn-icon-sm\":           $font-size-xsm,\n  \"btn-icon-md\":           $font-size-md,\n  \"btn-icon-lg\":           $font-size-xlg,\n  \"btn-icon-xlg\":          $font-size-2xlg,\n  \"btn-icon-2xlg\":         $font-size-3xlg,\n  \"btn-icon-exlg\":         $font-size-exlg,\n  \"label\":                 $font-size-md,\n  \"input\":                 $font-size-sm,\n  \"msg-input\":             $font-size-md,\n  \"note\":                  $font-size-2xsm,\n  \"error\":                 $font-size-xsm,\n  \"date\":                  $font-size-xsm,\n  \"copy-right\":            $font-size-xsm,\n  \"brieftxt-sm\":           $font-size-xsm,\n  \"brieftxt-pc\":           $font-size-sm,\n  \"placeholder-secondary\": $font-size-xsm,\n) !default;\n\n/*  #Line height  ---------------------------------------------*/\n$lineheight-base:          1rem !default;\n$lineheight-half:         $lineheight-base * 1 !default;\n$lineheight-sm:         $lineheight-base * 1.25 !default;\n$lineheight-md:           $lineheight-base * 1.5 !default;\n$lineheight-double:       $lineheight-base * 2 !default;\n$lineheight-size: (\n  \"half\":                  1.5rem,\n  \"double\":                $lineheight-double,\n  \"msg-input\":             $lineheight-sm,\n) !default;\n\n\n/*  #Border  ---------------------------------------------*/\n$border-size-base:      1px !default;\n$border-size-sm:        $border-size-base * 0.5 !default;\n$border-size-md:        $border-size-base * 1 !default;\n$border-size-lg:        $border-size-base * 2 !default;\n$border-size-xlg:        $border-size-base * 4 !default;\n\n\n$border: (\n  \"primary\":            $border-size-md solid map-get($border-colors, primary),\n  \"primary-sm\":         $border-size-sm solid map-get($border-colors, primary),\n  \"secondary\":          $border-size-md solid map-get($border-colors, secondary),\n  \"secondary-sm\":       $border-size-sm solid map-get($border-colors, secondary),\n  \"white-back\":         $border-size-md solid map-get($border-colors, white-back),\n  \"notice-card\":        $border-size-xlg solid map-get($border-colors, primary),\n) !default;\n\n\n$border-radius-base:    1rem !default;\n$border-radius-xsm:      $border-radius-base * 0.3 !default;\n$border-radius-sm:      $border-radius-base * 0.5 !default;\n$border-radius-md:      $border-radius-base;\n$border-radius-lg:      $border-radius-base * 2 !default;\n\n$prsnt-border-radius-base:    10% !default;\n$prsnt-border-radius-sm:      $border-radius-base * 0.3 !default;\n$prsnt-border-radius-md:      $border-radius-base;\n$prsnt-border-radius-lg:      $border-radius-base * 2 !default;\n$prsnt-border-radius-full:    $border-radius-base * 5 !default;\n\n$border-radius-size: (\n  \"primary\":            $border-radius-xsm,\n  \"secondary\":          $border-radius-sm,\n  \"tertiary\":           $border-radius-md,\n  \"p-primary\":          $prsnt-border-radius-sm,\n  \"p-secondary\":        $prsnt-border-radius-md,\n  \"full\":               $prsnt-border-radius-full,\n\n) !default;\n\n\n\n/*  #Space (padding / margin)  ---------------------------------------------*/\n$space-base:          1rem !default;\n$space-exsm:          $space-base * 0.1 !default;\n$space-3xsm:          $space-base * 0.2 !default;\n$space-2xsm:          $space-base * 0.3 !default;\n$space-xsm:           $space-base * 0.5 !default;\n$space-sm:            $space-base * 0.7 !default;\n$space-md:            $space-base * 1 !default;\n$space-lg:            $space-base * 1.5 !default;\n$space-xlg:           $space-base * 2 !default;\n$space-2xlg:          $space-base * 3 !default;\n$space-3xlg:          $space-base * 4 !default;\n$space-auto:          auto !default;\n\n\n/*  #Layout  -----------------------------------------------------------------*/\n// Header\n$header-height:          60px !default;\n$l-header: (\n  \"height\":              $header-height,\n) !default;\n\n// Main\n$main-content-width:          85% !default;\n$l-main: (\n  \"content-width\": $main-content-width,\n) !default;\n\n// Footer\n$l-footer: (\n  \"height\":                   60px,\n  \"padding\":                  0 $space-2xlg,\n) !default;\n\n/*  #Project   ---------------------------------------------------------------*/\n// modal\n$p-modal-height-base:     100% !default;\n$p-modal-maxheight:       $p-modal-height-base * 0.88 !default;\n$p-modal-top-pos:         ($p-modal-height-base - $p-modal-maxheight) / 2;\n$p-modal: (\n  \"bg-color\":                 map-get($bg-colors, entry-modal),\n  \"modal-maxheight\":          $p-modal-maxheight,\n  \"modal-top-pos\":            $p-modal-top-pos,\n) !default;\n\n// entry\n$p-entry: (\n  \"header-font-size\":         $font-size-2xlg,\n  \"txt-font-size\":            $font-size-sm,\n) !default;\n\n$p-entry-top: (\n\n) !default;\n\n$p-entry-about: (\n  \"bg-color\":                 $gray-md,\n) !default;\n\n// index\n$p-index-sidebar: (\n  \"width\":                 245px,\n) !default;","/*--------\n|  Base  | - default/reset\n--------*/\n\n@use 'tools/global' as *;\n\n* {\n  box-sizing: border-box;\n  color: inherit;\n}\n\n// html, body {\n//   height: 100%;\n// }\n\nbody {\n  margin: auto;\n  color: map-get($font-colors, primary);\n  background-color: $black;\n  font-size: map-get($font-size, primary);\n  font-family: \"Helvetica Neue\", \"Helvetica\", Helvetica, Arial, sans-serif;\n  -webkit-font-smoothing: antialiased; \n  -webkit-text-size-adjust: none;\n}\n\na {\n  outline: none;\n  text-decoration: none;\n  color: inherit;\n  cursor: pointer;\n}\n\np { overflow-wrap: break-word; }\n\nbutton, input {\n  padding: 0;\n  border: none;\n  outline: none;\n  font: inherit;\n}\n\nbutton {\n  background-color: inherit;\n  cursor: pointer;\n}\n\nlabel { cursor: pointer; }\n\ntextarea {\n  font-family: \"Helvetica Neue\", \"Helvetica\", Helvetica, Arial, sans-serif;\n}","// _header.scss\n\n@use \"../foundation/tools/global\" as *;\n\n.l-header__submenu-toggler,\n.l-header__main-layer-entry, .l-header__sub-layer-entry {\n  display: flex;\n  align-items: center;\n  height: 46px;\n  cursor: pointer;\n  @include hover() {\n    background-color: map-get($bg-colors, tertiary);\n  }\n  @include mq(pc) {\n    padding: 0 $space-sm;\n    border-radius: map-get($border-radius-size, primary);\n  }\n}\n\n.l-header__sub-layer-entry { \n  display: flex;\n  align-items: center;\n  width: 100%;\n}\n\n#l-header {\n  align-items: center;\n  z-index: 5;\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: map-get($l-header, height);\n  background-color: map-get($bg-colors, secondary);\n}\n\n/* --------------------------------------------------------------------\n|  height, background-colorは                                          |\n|  l-header-wrapの裏からスライド表示されるl-header-menuの透過を隠す目的       |\n----------------------------------------------------------------------*/\n.l-header__wrap {\n  display: flex;\n  flex: 1;\n  flex-flow: row;\n  align-items: center;\n  z-index: 4;\n  height: 100%;\n  width: 100%;\n  padding: 0 $space-lg;\n  background-color: map-get($bg-colors, secondary);\n  @include mq(tab-max) {\n    flex: none;\n  }\n}\n\n\n/* --------------------------------------------------------------------\n|  left menu                                                           |\n----------------------------------------------------------------------*/\n\n\n.l-header__leftmenu {\n  display: flex;\n  position: relative;\n  width: 50vw;\n  margin-right: auto;\n  font-size: map-get($font-size, link-primary);\n  @include mq(tab-max) {\n    width: 80vw;\n  }\n}\n\n.l-header__home-entry, .l-header__home-entry--arrow,\n#l-header__server-banner, .l-header__channel-banner {\n  display: flex;\n  align-items: center;\n  height: 45px;\n  padding: 0 $space-sm;\n  border-radius: map-get($border-radius-size, primary);\n  @include hover() {\n    background-color: map-get($bg-colors, tertiary);\n  }\n}\n.l-header__home-entry { width: fit-content; }\n.l-header__home-entry--arrow { padding: 0; }\n\n#l-header__server-banner, .l-header__channel-banner {\n  @include mq(sp) {\n    padding: 0 $space-xsm;\n  }\n}\n\n// サーバーバナー押下での挙動が現在ないためhoverでのbg変更を相殺\n#l-header__server-banner {\n  background-color: transparent !important;\n}\n\n.l-header__home-entry--arrow {\n  position: relative;\n  display: inline-block;\n  &::before{\n    content: '';\n    position: absolute;\n    top: 57.5%;\n    right: 0;\n    left: 0;\n    transform: rotate(225deg);\n    width: 7px;\n    height: 7px;\n    margin: auto;\n    margin-top: -0.5rem;\n    border-right: solid 1.5px map-get($font-colors, primary);\n    border-top: solid 1.5px map-get($font-colors, primary);\n  }\n}\n\n// #l-header__server-banner {}\n\n.l-header__server-img {\n  width: 30px;\n  height: 30px;\n  margin-right: $space-xsm;\n  border-radius: map-get($border-radius-size, primary);\n  object-fit: cover;\n}\n\n.l-header__server-name { max-width: 350px; }\n\n.l-header__server-name, .l-header__channel-name {\n  @include mq(sp) {\n    max-width: 125px;\n  }\n}\n\n.l-header__channel-banner {\n  // margin-left: $space-sm;\n  background-color: map-get($bg-colors, primary);\n}\n\n.l-header__channel-name { margin-left: $space-xsm }\n\n.l-header__channel-list {\n  display: none;\n  position: absolute;\n  top: 45px;\n  right: 0;\n  min-width: 250px;\n  max-width: 300px;\n  padding: $space-2xsm;\n  border: map-get($border, primary);\n  border-radius: map-get($border-radius-size, primary);\n  background-color: map-get($bg-colors, primary);\n  &[data-status=\"on\"] {\n    display: block;\n  }\n}\n\nbutton#p-modal-opener--new-channel{\n  @include hover {\n    background-color: map-get($bg-colors, tertiary);\n  }\n}\n\n\n/* --------------------------------------------------------------------\n|  main menu                                                           |\n----------------------------------------------------------------------*/\n\n\n#l-header__mainmenu-toggler {\n  position: relative;\n}\n\n#l-header__mainmenu-opener {\n  transform: scale(1);\n  position: absolute;\n  top: -17px;\n  right: 0;\n  border: none;\n  font-size: map-get($font-size, btn-icon);\n  > i {\n    margin: auto 0;\n  }\n  &[data-status=\"on\"] {\n    transition: transform 0.15s 0s ease;\n    transform: scale(0);\n  }\n  &[data-status=\"off\"] {\n    transition: transform 0.15s 0.15s ease;\n    transform: scale(1);\n  }\n}\n\n#l-header__mainmenu-closer {\n  transform: scale(0);\n  position: absolute;\n  top: -17px;\n  right: 0;\n  &[data-status=\"on\"] {\n    transition: transform 0.15s 0.15s ease;\n    transform: scale(1);\n  }\n  &[data-status=\"off\"] {\n    transition: transform 0.15s 0s ease;\n    transform: scale(0);\n  }\n}\n\n#l-header__mainmenu {\n  transition: transform 0.3s 0s ease;\n  display: flex;\n  flex-flow: row;\n  align-items: center;\n  z-index: 4;\n  padding: 0 $space-xlg;\n  background-color: map-get($bg-colors, secondary);\n  @include mq(tab-max) {\n    flex-flow: column;\n    align-items: initial;\n    z-index: 3;\n    position: absolute;\n    bottom: 1.5px;\n    width: 100%;\n  }\n  &[data-status=\"on\"] {\n    transform: translateY(100%);\n  }\n  &[data-status=\"off\"] {\n    transform: translateY(-60px);\n  }\n}\n\n.l-header__mainmenu-item {\n  position: relative;\n  @include hover(pc) {\n    .l-header__submenu {\n      display: block;\n    }\n  }\n}\n\n.l-header__submenu {\n  display: none;\n  @include mq(pc) {\n    position: absolute;\n    top: 38px;\n    right: 0;\n    width: max-content;\n    min-width: 220px;\n    max-width: 250px;\n    padding: $space-2xsm;\n    border: map-get($border, primary);\n    border-radius: map-get($border-radius-size, primary);\n    background-color: map-get($bg-colors, secondary);\n  }\n  @include mq(tab-max) {\n    &[data-status=\"on\"] {\n      display: block;\n    }\n    &[data-status=\"off\"] {\n      display: none;\n    }\n  }\n}\n\n.l-header__submenu-toggler {\n  display: flex;\n  justify-content: space-between;\n  width: 100%;\n  cursor: pointer;\n}\n\n.l-header__submenu-arrow {\n  position: relative;\n  display: inline-block;\n  &::before{\n    content: '';\n    position: absolute;\n    top: 50%;\n    right: 0.3rem;\n    transform: rotate(135deg);\n    width: 7px;\n    height: 7px;\n    margin-top: -0.5rem;\n    border-right: solid 1.5px map-get($font-colors, primary);\n    border-top: solid 1.5px map-get($font-colors, primary);\n  }\n}\n\n.l-header__submenu-pilar-icon { //? pilar icon componentならん？ (p-index-aboutにあり)\n  height: 2rem;\n  border-left: 4px solid white;\n  margin: auto $space-md auto 0;\n}\n\n.l-header__submenu-item-title {\n  font-size: map-get($font-size, title-quaternary);\n}\n\n.l-header__submenu-item-detail {\n  font-size: map-get($font-size, note);\n  margin-top: $space-xsm;\n  word-wrap: break-word;\n}\n\n.l-header__flash-wrap {\n  display: flex;\n  position: fixed;\n  top: map-get($l-header, height);\n}\n\n.l-header__flash-message {\n  display: flex;\n  justify-content: space-between;\n  width: 100vw;\n  padding: $space-2xsm $space-xlg;\n  background-color: map-get($bg-colors, secondary);\n}","// _mixin.scss\n\n@use \"sass:meta\";\n\n// メディアクエリ ---------------------------------------------------------\n$breakpoints: (\n  sp:         'screen and (max-width: 767px)',\n  tab-max:    'screen and (max-width: 1024px)',\n  tab:        'screen and (min-width: 768px) and (max-width: 1024px)',\n  tab-min:    'screen and (min-width: 768px)',\n  pc:         'screen and (min-width: 1025px)'\n);\n\n@mixin mq($bp) {\n  @media #{map-get($breakpoints, $bp)} {\n    @content;\n  }\n}\n\n// 対象画面を絞るmin-width (al->allの意, spは指定なし)\n$frame-min-widths: (\n  al:    'min-width: 0px',\n  tab:   'min-width: 768px',\n  pc:    'min-width: 1025px'\n);\n\n// Hoverを設定 (対象デバイスがhover可能およびポインターデバイスを使用している場合に機能します)\n@mixin hover ($frame: null) {\n  $frame-min-width: \"\";\n  @if $frame == pc {\n    $frame-min-width: map-get($frame-min-widths, pc);\n  } @else if $frame == tab {\n    $frame-min-width: map-get($frame-min-widths, tab);\n  } @else {\n    $frame-min-width: map-get($frame-min-widths, al);\n  }\n  @media (hover: hover) and (pointer: fine) and ($frame-min-width) {\n    &:hover {\n      @content;\n    }\n  }\n}\n\n// ポインターデバイスを使用している場合に機能します\n@mixin pointer () {\n  @media (pointer: fine) {\n    @content;\n  }\n}\n\n// ポインターデバイスを使用していない場合に機能します\n@mixin non-pointer () {\n  @media (pointer: none) {\n    @content;\n  }\n}\n\n// Link(aタグ etc.)用のサイズ適正化\n@mixin optimized-link {\n  display: flex;\n  align-items: center;\n}","// _main.scss\n\n@use \"../foundation/tools/global\" as *;\n\n.l-main {\n  padding-top: map-get($l-header, height);\n}\n\n.l-main--app {\n  @extend .l-main;\n  display: flex;\n  width: 100%;\n}\n\n.l-main__section, .l-main__app-section, .l-main__fixed-section {\n  display: flex;\n  min-height: calc(100vh - map-get($l-header, height));\n  width: 100vw;\n  > .content, .wide-content, .app-content {\n    height: fit-content;\n    width: map-get($l-main, content-width);\n    padding: $space-xlg 0;\n  }\n  > .content, .wide-content {\n    margin: auto;\n    @include mq(tab-min) { padding: $space-2xlg 0; }\n  }\n  > .content, .app-content { max-width: map-get($l-main, 1000px); }\n  > .wide-content { max-width: map-get($l-main, 1200px); }\n  > .app-content {\n    margin: 0 auto;\n  }\n}\n\n.l-main__fixed-section {\n  position: fixed;\n  top: 0;\n  z-index: 6;\n  height: 100%;\n  width: 100%;\n  background-color: map-get($bg-colors, primary);\n  &:not([data-status=\"on\"]) {\n    display: none;\n  }\n}\n.l-main__fixed-section-closer {\n  position: absolute;\n  top: $space-3xlg;\n  right: $space-2xlg;\n  font-size: map-get($font-size, btn-icon-2xlg);\n}\n\n.l-main__section:last-child {\n  min-height: calc(100vh - (map-get($l-header, height) + (map-get($l-footer, height))));\n}\n\n.l-main:nth-child(1) { // headerが存在しない場合に画角を調節する\n  padding: 0;\n  .l-main__section { min-height: calc(100vh - (map-get($l-footer, height))); }\n}\n\n.l-main__section-header {\n  text-align: center;\n  margin-bottom: $space-lg;\n  font-size: map-get($p-entry, header-font-size);\n  @include mq(sp) {\n    font-size: map-get($font-size, title-secondary);\n  }\n}\n\n.l-main__section-brief {\n  text-align: center;\n  margin-bottom: $space-xlg;\n  font-size: map-get($font-size, brieftxt-pc);\n  line-height: map-get($lineheight-size, double);\n  @include mq(sp) {\n    font-size: map-get($font-size, brieftxt-sm);\n  }\n}\n\n.l-main__link-section {\n  display: flex;\n  justify-content: space-between;\n  width: 100%;\n  margin-bottom: 1.5rem;\n  font-size: 1rem;\n}\n\n.l-main__link-section-text { margin: 0 $space-2xsm; }","// _footer.scss\n\n@use \"../foundation/tools/global\" as *;\n\n.l-footer {\n  height: map-get($l-footer, height);\n  padding: map-get($l-footer, padding);\n  line-height: map-get($l-footer, height);\n}\n\n.l-footer__copy-light-txt {\n  font-size: map-get($font-size, copy-right);\n}","// _button.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n// ボタンのベースです\n.c-btn {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  padding: 0 $space-2xsm;\n  color: inherit;\n  cursor: pointer;\n  > i { // FontAwesome経由のiconを中央に\n    margin: auto;\n  }\n}\n\n// background-color付きのボタンです\n@each $key, $value in $btn-bg-colors {\n  .c-btn--bg-#{$key} {\n    background-color: $value;\n  }\n  .c-btn--hover-bg-#{$key} {\n    border: map-get($border, \"#{$key}\");\n    @include hover() {\n      background-color: $value;\n      @if $key == \"white-back\" {\n        color: map-get($font-colors, primary);\n      }\n    }\n  }\n}\n\n// 四角形のボタンです\n.c-btn--quad {\n  @extend .c-btn;\n  min-height: 34px;\n  min-width: 34px;\n  border-radius: map-get($border-radius-size, primary);\n}\n\n.c-btn--xquad {\n  @extend .c-btn--quad, .c-btn--hover-bg-white-back;\n}\n\n.c-btn--submit {\n  @extend .c-btn--quad, .c-btn--bg-primary, .c-btn--hover-bg-secondary;\n  padding: 0 4rem;\n}\n\n.c-btn--submit-full {\n  @extend .c-btn--quad, .c-btn--bg-primary, .c-btn--hover-bg-secondary;\n  width: 100%;\n}\n\n.c-btn--min-rect {\n  @extend .c-btn--quad;\n  min-width: 65px;\n  background-color: map-get($bg-colors, tertiary);\n  @include hover {\n    background-color: map-get($btn-bg-colors, secondary);\n  }\n}\n\n.c-btn--outstanding-rect {\n  @extend .c-btn--quad;\n  padding: $space-xsm $space-sm;\n  background-color: map-get($btn-bg-colors, outstanding);\n  @include hover {\n    background-color: lighten(map-get($btn-bg-colors, outstanding), 10%);\n  }\n}","// _card.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n.card {\n  width: fit-content;\n  padding: $space-md $space-lg;\n  border-left: map-get($border, notice-card);\n  border-radius: map-get($border-radius-size, primary);\n  font-size: map-get($font-size, card);\n  line-height: map-get($lineheight-size, double);\n  background-color: map-get($bg-colors, secondary);\n}","// _wrapper.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n.c-flex-wrapper { display: flex; }\n\n.c-flex-wrapper--center {\n  display: flex;\n  align-items: center;\n}\n\n.c-flex-wrapper--column {\n  display: flex;\n  flex-flow: column;\n}\n\n.c-flex-wrapper--row {\n  display: flex;\n  flex-flow: row;\n}","// _menu.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n.c-menu-wrap {\n  overflow: hidden;\n  position: relative;\n}\n\n.c-menu-wrap > .c-corner-icon-menu {\n  display: flex;\n  overflow: hidden;\n  position: absolute;\n  top: -0.3rem;\n  right: -0.3rem;\n  padding: 0.3rem 0.3rem 0 0;\n  border-radius: 0.3rem;\n  background-color: map-get($bg-colors, secondary);\n  > .c-menu-elm {\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n    position: relative;\n    width: 32px;\n    height: 30px;\n    &:not(:last-child)::after {\n      content: \"\";\n      position: absolute;\n      right: 0;\n      height: 15px;\n      border-right: map-get($border, primary);\n    }\n  }\n}","// _partition.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n.c-patition { border-top: map-get($border, secondary); }\n\n.c-partition--full {\n  @extend .c-patition;\n  width: 100%;\n  margin: $space-md auto;\n}\n\n.c-partition--modal {\n  @extend .c-patition;\n  width: 65%;\n  min-width: 250px;\n  margin: $space-lg auto;\n}","// _auth.scss //! No Use\n\n@use \"../../foundation/tools/global\" as *;\n\n.p-auth__form {\n  width: 50%;\n  min-width: 250px;\n  margin: 0 auto;\n}\n\n.p-auth__input-label { font-size: map-get($font-size, label); }\n\n.p-auth__input {\n  width: 100%;\n  margin: $space-2xsm 0 $space-lg;\n  padding: $space-sm;\n  border: map-get($border, primary);\n  border-radius: map-get($border-radius-size, primary);\n  font-size: map-get($font-size, input);\n  font-weight: 600;\n  background-color: map-get($bg-colors, primary);\n}\n\n.p-auth__error-msg {\n  float: right;\n  font-size: map-get($font-size, note);\n  color: map-get($font-colors, alert);\n}\n\n.p-auth__submit {\n  margin: 1.5rem auto 0;\n  border: none;\n}","// _auth.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n.p-form__wrap {\n  width: 50%;\n  min-width: 250px;\n  margin: 0 auto;\n}\n\n.p-form-wrap--min {\n  @extend .p-form__wrap;\n  width: 100%;\n  min-width: auto;\n}\n\n.p-form__input-label {\n  display: inline-block;\n  margin-bottom: $space-2xsm;\n  font-weight: bold;\n}\n\n.p-form__image-label {\n  display: block;\n  width: fit-content;\n  margin: $space-2xsm 0 $space-md;\n}\n.p-form__profile-image-label {\n  overflow: hidden;\n  position: relative;\n  height: 150px;\n  width: 150px;\n  margin: auto;\n  background-color: map-get($bg-colors, tertiary);\n  border-radius: map-get($border-radius-size, full);\n  font-size: map-get($font-size, btn-icon-exlg);\n  @include mq(sp) {\n    height: 150px;\n    width: 150px;\n  }\n  > i { position: absolute; }\n  > img {\n    object-fit: cover;\n    height: inherit;\n    width: inherit;\n    z-index: 5;\n  }\n}\n\n.p-form__image-label:has(+ .p-form__server-image:disabled) {\n  opacity: 0.5;\n}\n\n.p-form__input {\n  width: 100%;\n  margin-bottom: $space-lg;\n  padding: $space-sm;\n  border: map-get($border, primary);\n  border-radius: map-get($border-radius-size, primary);\n  font-size: map-get($font-size, input);\n  background-color: map-get($bg-colors, primary);\n}\n\n.p-form__error-msg {\n  float: right;\n  margin-left: $space-md;\n  font-size: map-get($font-size, error);\n  color: map-get($font-colors, alert);\n}\n\n.p-form__submit {\n  margin: $space-md auto 0;\n  border: none;\n}\n\n#p-form__password-visualizer {\n  i:last-child { display: none; }\n}\n\n.p-form__checkbox-wrap {\n  display: flex;\n  justify-content: space-evenly;\n}\n\n.p-form__checkbox-label {\n  padding: $space-2xsm $space-sm;\n  border-radius: map-get($border-radius-size, primary);\n  background-color: map-get($btn-bg-colors, primary);\n}\n\n.p-form__checkbox { display: none; }\n\n.p-form__checkbox:checked + .p-form__checkbox-label {\n  background-color: map-get($btn-bg-colors, secondary);\n}\n\n.p-form__input:disabled {\n  text-decoration-line: line-through;\n  background-color: map-get($bg-colors, secondary);\n}\n\n.p-form__file-block {\n  position: relative;\n  background-color: #222;\n  width: 175px;\n  padding: $space-sm $space-2xsm;\n  border-radius: map-get($border-radius-size, primary);\n  @include mq(sp) {\n    width: 90px;\n    padding: $space-2xsm\n  }\n}\n\n.p-form__image-wrap {\n  display: flex;\n  z-index: 0;\n  position: relative;\n  height: 160px;\n  margin-bottom: $space-sm;\n  border-radius: map-get($border-radius-size, primary);\n  font-size: map-get($font-size, btn-icon-exlg);\n  background-color: map-get($bg-colors, quinary);\n  > i {\n    position: absolute;\n    top: calc(50% - map-get($font-size, btn-icon-exlg) / 2);\n    left: calc(50% - map-get($font-size, btn-icon-exlg) / 2);\n  }\n  > img {\n    z-index: 5;\n    height: 100%;\n    width: 100%;\n    object-fit: cover;\n  }\n  @include mq(sp) {\n    height: 80px;\n    margin-bottom: $space-2xsm\n  }\n}\n\n.p-form__filename {\n  overflow: hidden;\n  width: 100%;\n  font-size: map-get($font-size, secondary);\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  @include mq(sp) {\n    font-size: map-get($font-size, tertiary);\n  }\n}\n\n\n\n.p-form__msg-input {\n  background-color: map-get($bg-colors, tertiary);\n  border-radius: map-get($border-radius-size, secondary);\n}\n\n.p-form__circle-preview-showcase {\n  position: relative;\n  width: fit-content;\n  margin: auto;\n  > .p-form__clear-circle-preview {\n    position: absolute;\n    top: 0;\n    right: -$space-lg;\n    font-size: map-get($font-size, btn-icon-lg);\n  }\n}\n\n.p-form__preview-showcase {\n  overflow: scroll;\n  margin: 0 $space-sm;\n  padding: $space-md $space-sm;\n  border-bottom: map-get($border, primary-sm);\n}\n\nul.p-form__preview-list {\n  display: flex;\n  width: fit-content;\n  > li:not(:last-child) {\n    margin-right: $space-md;\n    @include mq(sp) {\n      margin-right: $space-sm;\n    }\n  }\n}\n\n.p-form__file-thumnail {\n  overflow: hidden;\n  border-radius: 1rem;\n  background-color: map-get($bg-colors, primary);\n  width: fit-content;\n}\n\n.p-form__msg-input-bar { padding: $space-xsm $space-xlg $space-xsm 0; }\n\n.p-form__file-opener-wrap {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n}\n\n#p-form__file-opener {\n  height: 1.5rem;\n  width: 1.5rem;\n  background-color: map-get($bg-colors, quinary);\n  border-radius: map-get($border-radius-size, full);\n}\n\n.p-form__msg-txtarea {\n  border: none;\n  outline: none;\n  resize: none;\n  // ▼ padding上下 + line-height*(行数-1) + font-size\n  max-height: calc($space-xsm * 2 + map-get($lineheight-size, msg-input) * 9 + map-get($font-size, msg-input));\n  padding: $space-xsm $space-xsm $space-xsm $space-sm;\n  border-radius: map-get($border-radius-size, primary);\n  background-color: map-get($bg-colors, secondary);\n  font-size: map-get($font-size, msg-input);\n  line-height: map-get($lineheight-size, msg-input);\n  @include mq(sp) {\n    max-height: calc($space-xsm * 2 + map-get($lineheight-size, msg-input) * 7 + map-get($font-size, msg-input));\n  }\n  &:not(:has(+ input)) {\n    min-width: 40vw;\n    @include mq(tab) { min-width: 50vw; }\n    @include mq(sp) { min-width: 65vw; }\n  }\n}\n.p-form__msg-txtarea-closer {\n  width: fit-content;\n  border-bottom: map-get($border, primary-sm);\n}\n\n.p-form__file-dumper, #p-form__file-opener {\n  > i { transition: all 0.15s; }\n  @include hover {\n    > i { scale: 1.2; }\n  }\n}\n\n.p-form__search-bar-wrap {\n  position: relative;\n  max-width: 500px;\n  margin: $space-lg;\n}\n.p-form__search-bar {\n  margin: 0;\n  padding-right: 150px;\n  @include mq(tab-max) { padding-right: 50px; }\n}\n.p-form__search-bar-status {\n  position: absolute;\n  top: 0;\n  right: $space-sm;\n  bottom: 0;\n  display: flex;\n  align-items: center;\n  .status-text, i { opacity: 0.4; }\n}\n#p-form__search-bar-status--blank {\n  i { font-size: map-get($font-size, btn-icon-md); }\n}\n#p-form__search-bar-status--filled {\n  display: contents;\n  .status-text {\n    margin: $space-2xsm;\n    font-size: map-get($font-size, placeholder-secondary);\n    cursor: default;\n  }\n  i { \n    font-size: map-get($font-size, btn-icon-lg); \n    @include hover { opacity: 1; }\n  }\n}\n\n.p-form__search-bar-result {\n  width: 70%;\n  @include mq(tab) { min-width: 500px; }\n  @include mq(sp) { min-width: 300px; }\n}\n.annotation:has(+.p-form__server-banner-list) { \n  margin-bottom: $space-sm; \n}\n.p-form__server-banner-list {\n  overflow: scroll;\n  max-height: 470px;\n  width: 100%;\n  > li {\n    margin-bottom: $space-sm;\n    &:first-child { @include pointer { margin-top: $space-sm; } }\n    &:last-child { @include non-pointer { margin: 0; } }\n  }\n}\n.p-form__server-banner {\n  display: flex;\n  @include pointer { padding-left: $space-xsm; }\n  @include hover {\n    > .p-form__searched-server-img-wrap { scale: 1.05; }\n  }\n}\n.p-form__searched-server-img-wrap {\n  transition: all 0.15s;\n  overflow: hidden;\n  width: 180px;\n  height: 110px;\n  margin-right: $space-sm;\n  border-radius: map-get($border-radius-size, primary);\n  &:not(:has(img)) { background-color: map-get($bg-colors, secondary); }\n  > img {\n    height: inherit;\n    width: inherit;\n    object-fit: cover;\n  }\n  @include mq(tab) {\n    width: 145px;\n    height: 85px;\n  } \n  @include mq(sp) {\n    width: 100px;\n    height: 65px;\n  }\n}\n.p-form__searched-server-info {\n  display: flex;\n  flex-flow: column;\n  justify-content: space-between;\n  overflow: hidden;\n  .server-name {\n    overflow: hidden;\n    display: -webkit-box;\n    font-size: map-get($font-size, title-secondary);\n    font-weight: bold;\n    -webkit-box-orient: vertical;\n    -webkit-line-clamp: 3;\n    @include mq(tab-max) {\n      font-size: map-get($font-size, title-tertiary);\n    }\n    @include mq(sp) { -webkit-line-clamp: 2;}\n  }\n  .server-population {\n    @include mq(tab-max) { font-size: map-get($font-size, secondary); }\n  }\n}","// _modal.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n// jsのフックとしての役割あり\n.p-modal {\n  z-index: 7;\n  opacity: 0;\n  transform: scaleY(0);\n  transition: transform 0.2s ease-out, opacity 0.08s ease-in;\n  position: fixed;\n  top: map-get($p-modal, modal-top-pos);\n  right: 0;\n  left: 0;\n  width: 75%;\n  margin: auto;\n  padding: $space-lg $space-md;\n  border-radius: map-get($border-radius-size, primary);\n  background-color: map-get($bg-colors, modal);\n  &[data-status=\"on\"] {\n    opacity: 1;\n    transform: scaleY(1);\n  }\n  &[data-status=\"off\"] {\n    opacity: 0;\n    transform: scaleY(0);\n  }\n}\n\n.p-modal--min {\n  top: 50%;\n  max-width: 420px;\n  &[data-status=\"on\"] {\n    transform: translateY(-50%);\n  }\n}\n\n.p-modal-closer {\n  position: absolute;\n  top: 5px;\n  right: 5px;\n}\n\n.p-modal-wrap{\n  overflow: scroll;\n  max-height: 86vh;\n  // padding: 4% 1%;\n}\n\n.p-modal-content{\n  justify-content: space-around;\n  margin: 0;\n}\n\n// .p-modal-block { padding: $space-sm; }\n\n.p-modal-header {\n  text-align: center;\n  font-size: map-get($font-size, title-primary);\n  font-weight: bold;\n  margin-bottom: $space-md;\n}\n\n.p-modal-section { min-width: 250px; }\n\n.p-modal-section {\n  width: 50%;\n  margin: 0 auto;\n}","// _slide.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n.p-slide-wrap {\n  z-index: 7;\n  position: fixed;\n  inset: 0;\n  height: fit-content;\n  width: fit-content;\n  margin: auto;\n}\n\n.p-slide-closer {\n  position: absolute;\n  top: 0;\n  right: $space-sm;\n}\n\n\n// Splide jsから生成されたスライドの装飾\n\n.splide {\n  width: 95vw;\n}\n\n.splide__track {\n  overflow: auto;\n}\n\n.splide__slide {\n  display: flex;\n  justify-content: space-around;\n}\n\n.splide__slide img {\n  object-fit: contain;\n  max-height: 75vh;\n  max-width: 70vw;\n}\n\n.splide__pagination { bottom: -$space-lg; }","// _management.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n.p-management__section-brief { font-size: map-get($font-size, title-tertiary); }\n\n.p-management__code {\n  background: map-get($bg-colors, secondary);\n  border-radius: map-get($border-radius-size, primary);\n  padding: 0 $space-2xsm;\n}\n\n.p-management__notice-wrap {\n  width: fit-content;\n  margin: 0 auto;\n  padding: $space-md $space-lg;\n  border-left: map-get($border, notice-card);\n  border-radius: map-get($border-radius-size, primary);\n  font-size: map-get($font-size, card);\n  line-height: map-get($lineheight-size, double);\n  background-color: map-get($bg-colors, secondary);\n}","// _shared.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n// モーダル起動時用のスタイルです ----------------------------------------\n#body {\n  overflow: visible;\n  &[data-status=\"on\"] {\n    overflow: hidden;\n  }\n}\n\n#overlay {\n  display: none;\n  opacity: 0.9;\n  position: fixed;\n  top: 0;\n  z-index: 6;\n  height: 100%;\n  width: 100%;\n  background-color: $black;\n  &[data-status=\"on\"] {\n    display: block;\n  }\n}\n\n#loading {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 7;\n  width: 100vw;\n  height: 100vh;\n  transition: all 1s;\n  background-color: map-get($bg-colors, primary);\n}\n\n.loader,\n.loader:before,\n.loader:after {\n  background: #ffffff;\n  -webkit-animation: load1 1s infinite ease-in-out;\n  animation: load1 1s infinite ease-in-out;\n  width: 1em;\n  height: 4em;\n}\n.loader {\n  color: #ffffff;\n  text-indent: -9999em;\n  margin: calc(40vh) auto;\n  position: relative;\n  font-size: 11px;\n  -webkit-transform: translateZ(0);\n  -ms-transform: translateZ(0);\n  transform: translateZ(0);\n  -webkit-animation-delay: -0.16s;\n  animation-delay: -0.16s;\n}\n.loader:before,\n.loader:after {\n  position: absolute;\n  top: 0;\n  content: '';\n}\n.loader:before {\n  left: -1.5em;\n  -webkit-animation-delay: -0.32s;\n  animation-delay: -0.32s;\n}\n.loader:after {\n  left: 1.5em;\n}\n@-webkit-keyframes load1 {\n  0%,\n  80%,\n  100% {\n    box-shadow: 0 0;\n    height: 4em;\n  }\n  40% {\n    box-shadow: 0 -2em;\n    height: 5em;\n  }\n}\n@keyframes load1 {\n  0%,\n  80%,\n  100% {\n    box-shadow: 0 0;\n    height: 4em;\n  }\n  40% {\n    box-shadow: 0 -2em;\n    height: 5em;\n  }\n}\n\n.loaded {\n  opacity: 0;\n  visibility: hidden;\n}\n\n\n\n// ビデオ通話statusの Connecting を装飾します -----------------------------------------\n\nspan.connecting {\n  position: relative;\n  display: inline-block;\n  color: map-get($font-colors, outstanding);\n}\n  span.connecting span {\n    position: absolute;\n    display: inline-block;\n    left: 0;\n    right: 0;\n    top: 120%;\n    height: 2px;\n\n    background-position: 0 0;\n    background-repeat: repeat-x;\n    background-size: 10px 100%;\n    background-image: linear-gradient(to right,transparent 5px, map-get($font-colors, outstanding) 5px, map-get($font-colors, outstanding) 10px);\n    animation: connecting 0.7s linear infinite;\n  }\n\n@-webkit-keyframes connecting {\n  0% {\n    background-position: 0 0;\n  }\n  100% {\n    background-position: 10px 0;\n  }\n}\n\n@keyframes connecting {\n  0% {\n    background-position: 0 0;\n  }\n  100% {\n    background-position: 10px 0;\n  }\n}\n\n\n\n// ビデオ通話statusの Connected を装飾します -----------------------------------------\n\nspan.connected {\n  position: relative;\n  display: inline-block;\n  color: map-get($font-colors, outstanding);\n}\n  span.connected span {\n    position: absolute;\n    display: inline-block;\n    left: 0;\n    top: 120%;\n    width: 100%;\n    height: 2px;\n\n    background-position: 0 0;\n    background-image: linear-gradient(to right, map-get($font-colors, outstanding), transparent);\n    animation: connected 2.5s linear infinite;\n  }\n\n@-webkit-keyframes connected {\n  0% {\n    width: 0;\n    background-color: transparent;\n  }\n  40% {\n    width: 100%;\n    background-color: transparent;\n  }\n  80% {\n    width: 100%;\n    background-color: $white;\n  }\n  100% {\n    width: 100%;\n    background-color: $white;\n  }\n}\n\n@keyframes connected {\n  0% {\n    width: 0;\n    background-color: transparent;\n  }\n  40% {\n    width: 100%;\n    background-color: transparent;\n  }\n  80% {\n    width: 100%;\n    background-color: $white;\n  }\n  100% {\n    width: 100%;\n    background-color: $white;\n  }\n}","// _user.scss\n\n@use \"../../../foundation/tools/global\" as *;\n\n// User List ---------------------------------------------\n// #p-user-list { }\n\n// .p-user-list__table {}\n\n.p-user-list__head-wrap {\n  text-align: center;\n  margin-bottom: $space-xsm;\n}\n\n.p-user-list__head {\n  font-weight: bold;\n  font-size: map-get($font-size, table-label-primary);\n}\n\n.p-user-list__user-info-list {\n  align-items: center;\n  margin-bottom: $space-xsm;\n  border-radius: map-get($border-radius-size, primary);\n  background-color: map-get($bg-colors, secondary)\n}\n\n.p-user-list__user-info-wrap {\n  display: flex;\n  padding: $space-2xsm $space-sm;\n  @include mq(sp) {\n    padding: 0 $space-sm $space-2xsm ;\n    &:first-child {\n      padding-top: $space-2xsm;\n    }\n  }\n}\n\n.p-user-list__user-info { margin: 0 auto; }\n\n.p-user-list__user-info--name {\n  margin: 0 auto;\n  @include hover() {\n    text-decoration-line: underline;\n  }\n}\n\n.p-user-list__user-delete-btn {\n  margin: 0 auto;\n  padding: $space-2xsm $space-sm;\n  border-radius: map-get($border-radius-size, primary);\n  background-color: map-get($btn-bg-colors, white-back);\n  @include hover {\n    background-color: map-get($btn-bg-colors, secondary);\n  }\n}","@use \"../../../foundation/tools/global\" as *;\n\n\n// Server --------------------------------------------------------\n.p-index__server-board {\n  margin-bottom: $space-lg;\n  padding: 0 $space-md;\n}\n\n.p-index__server-thumnail-wrap {\n  transition: scale 0.2s ease;\n  overflow: hidden;\n  position: relative;\n  margin-bottom: $space-2xsm;\n  padding-top: 95%;\n  border-radius: map-get($border-radius-size, p-secondary);\n  @include hover() {\n    scale: 1.05;\n  }\n}\n\n.p-index__server-thumnail {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  background-color: map-get($bg-colors, tertiary);\n  > i {\n    font-size: map-get($font-size, btn-icon-xlg);\n  }\n  > img {\n    height: 100%;\n    width: 100%;\n    object-fit: cover;\n  }\n}\n\n.p-index__server-edit-btn {\n  position: absolute;\n  top: -0.5rem;\n  right: -0.3rem;\n  padding: 1rem 1rem 0.5rem 0.7rem;\n  border-radius: 0.5rem;\n  background-color: map-get($bg-colors, secondary);\n  @include mq(tab-max) {\n    display: block;\n  }\n  @include hover {\n    > i {\n      scale: 1.4;\n    }\n  }\n  > i {\n    transition: scale 0.2s ease;\n    scale: 1;\n  }\n}\n\n.p-index__server-title {\n  text-align: center;\n  font-size: map-get($font-size, title-tertiary);\n}\n\n\n\n\n// in_server --------------------------------------------------------\n\n.p-index__in-server {\n  display: flex;\n  position: fixed;\n  height: calc(100vh - map-get($l-header, height));\n  width: 100vw;\n}\n\n\n\n// side bar\n\n.p-index__sidebar {\n  position: relative;\n  width: 22%;\n  min-width: 250px;\n  padding: $space-xsm;\n  border-top: map-get($border, white-back);\n  border-right: map-get($border, white-back);\n  background-color: map-get($bg-colors, secondary);\n}\n.p-index__channel-list-wrap {\n  overflow: scroll;\n  height: calc(100% - 80px + $space-xsm);\n}\n.p-index__channel-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  width: 100%;\n  padding: $space-xsm;\n}\n.p-index__channel-wrap {\n  margin-bottom: $space-2xsm;\n  padding: $space-xsm $space-2xsm;\n  border-radius: map-get($border-radius-size, primary);\n  cursor: pointer;\n  @include hover {\n    background-color: map-get($bg-colors, tertiary);\n  }\n}\n.p-index__channel-name-wrap {\n  display: flex;\n  align-items: center;\n  .hash-mark {\n    text-align: center;\n    margin-right: $space-xsm;\n    font-size: map-get($font-size, btn-icon-md);\n  }\n}\n.p-index__new-channel-btn, \n.p-index__channel-invite-btn, \n.p-index__channel-setting-btn {\n  text-align: center;\n  font-size: map-get($font-size, btn-icon-sm);\n  > i {\n    transition: all 0.15s;\n    vertical-align: middle;\n  }\n  @include hover {\n    > i { scale: 1.4; }\n  }\n}\n\n.p-index__side-user-section {\n  position: absolute;\n  bottom: $space-md;\n  width: calc(100% - $space-md);\n  border-top: map-get($border, white-back);\n}\n.p-index__user-status-bar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 28px;\n}\n.p-index__user-action-list {\n  align-items: center;\n  font-size: map-get($font-size, btn-icon-md);\n}\n.p-index__side-user-image {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  overflow: hidden;\n  height: 35px;\n  width: 35px;\n  margin-right: $space-xsm;\n  border-radius: map-get($border-radius-size, full);\n  background-color: map-get($bg-colors, tertiary);\n  > img {\n    object-fit: cover;\n    height: inherit;\n    width: inherit;\n  }\n}\n.p-index__user-action-btn {\n  > i { transition: all 0.15s; }\n  @include hover {\n    > i { scale: 1.4; }\n  }\n}\n\n// 通話セクション\n.p-index__phone-operator {\n  padding: $space-xsm 0;\n  &[data-status=\"off\"] { display: none; }\n}\n// 電話帳\n.p-index__phone-book {\n  height: 220px;\n  .note-for-call {\n    display: flex;\n    justify-content: center;\n    align-items: flex-start;\n    height: 18px;\n    font-size: map-get($font-size, note);\n  }\n  .p-index__callable-user-list {\n    overflow: scroll;\n    height: 202px;\n  }\n}\n.p-index__callable-user-list .user-list {\n  display: flex;\n  align-items: center;\n  border-radius: map-get($border-radius-size, primary);\n  padding: $space-2xsm $space-xsm;\n  cursor: pointer;\n  @include hover {\n    background-color: map-get($bg-colors, tertiary);\n  }\n  .user-list-image {\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n    overflow: hidden;\n    height: 30px;\n    width: 30px;\n    margin-right: $space-xsm;\n    border-radius: map-get($border-radius-size, full);\n    background-color: map-get($bg-colors, tertiary);\n    > img {\n      object-fit: cover;\n      height: inherit;\n      width: inherit;\n    }\n  }\n  .user-list-name {\n    width: calc(100% - 30px - $space-xsm);\n    &:has(+ button){\n      width: calc(100% - 30px - $space-xsm - map-get($font-size, btn-icon-md));\n    }\n  }\n  .cancel-call-btn { font-size: map-get($font-size, btn-icon-md); }\n}\n// 通話中ビデオディスプレイ\n.p-index__side-call-monitor {\n  position: relative;\n  @include hover {\n    .side-call-menu { opacity: 1; }\n  }\n}\n.p-index__side-call-monitor .side-user-display {\n  overflow: hidden;\n  position: relative;\n  width: 100%;\n  aspect-ratio: 4 / 3;\n  border-radius: 0.3rem;\n  &:first-child { margin-bottom: $space-exsm; }\n  video {\n    width: inherit;\n    aspect-ratio: 4 / 3;\n  }\n  img {\n    width: inherit;\n    aspect-ratio: 4 / 3;\n    object-fit: cover;\n  }\n  .user-name {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    position: absolute;\n    bottom: $space-2xsm;\n    left: $space-2xsm;\n    width: calc(100% - $space-2xsm * 2);\n    font-size: map-get($font-size, secondary);\n    p, i { background-color: map-get($bg-colors, primary-tp); }\n    p {\n      max-width: 80%;\n      padding: $space-2xsm $space-xsm;\n      border-radius: map-get($border-radius-size, primary);\n    }\n    i {\n      text-align: center;\n      height: map-get($font-size, btn-icon-xlg);\n      width: map-get($font-size, btn-icon-xlg);\n      line-height: map-get($font-size, btn-icon-xlg);\n      border-radius: map-get($border-radius-size, full);\n    }\n  }\n}\n.p-index__side-call-monitor .side-call-menu {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  gap: $space-sm;\n  position: absolute;\n  top: $space-3xsm;\n  right: 0;\n  left: 0;\n  transition: all 0.2s ease-in;\n  .menu-btn {\n    height: 1.5rem;\n    width: 1.5rem;\n    background-color: map-get($bg-colors, quinary);\n    border-radius: map-get($border-radius-size, full);\n    box-shadow: \n      0 3px 3px -2px rgba(0,0,0,.2),\n      0 3px 4px 0 rgba(0,0,0,.14),\n      0 1px 8px 0 rgba(0,0,0,.12);\n    transition: all 0.15s;\n    @include hover { scale: 1.2; }\n  }\n}\n.mute-btn:has( .fa-microphone-slash ) {\n  background-color: map-get($btn-bg-colors, outstanding);\n}\n// 通話中ビデオディスプレイ (full screen)\n.p-index__full-call-menu {\n  position: absolute;\n  top: $space-md;\n  right: 0;\n  left: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: $space-md;\n  .menu-btn {\n    height: 50px;\n    width: 50px;\n    background-color: map-get($bg-colors, quinary);\n    border-radius: map-get($border-radius-size, full);\n    font-size: map-get($font-size, btn-icon-lg);\n    transition: all 0.2s;\n    @include hover { scale: 1.2; }\n  }\n}\n.p-index__full-call-monitor {\n  display: flex;\n  gap: $space-3xsm;\n  width: 100%;\n}\n.p-index__full-call-monitor .full-user-display {\n  overflow: hidden;\n  position: relative;\n  width: 50%;\n  aspect-ratio: 4 / 3;\n  border-radius: map-get($border-radius-size, primary);\n  img {\n    width: 100%;\n    aspect-ratio: 4 / 3;\n    object-fit: cover;\n  }\n  .user-name {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    position: absolute;\n    bottom: $space-xsm;\n    left: $space-xsm;\n    width: calc(100% - $space-xsm * 2);\n    p, i { background-color: map-get($bg-colors, primary-tp); }\n    p {\n      max-width: 80%;\n      padding: $space-2xsm $space-xsm;\n      border-radius: map-get($border-radius-size, primary);\n    }\n    i {\n      text-align: center;\n      height: map-get($font-size, btn-icon-xlg);\n      width: map-get($font-size, btn-icon-xlg);\n      line-height: map-get($font-size, btn-icon-xlg);\n      border-radius: map-get($border-radius-size, full);\n    }\n  }\n}\n\n\n\n\n// main\n\n.p-index-main {\n  position: relative;\n  width: 100%;\n}\n\n.p-index-main__date-partition {\n  display: flex;\n  align-items: center;\n  margin: $space-xlg 0;\n}\n.p-index-main__date-partition::before, \n.p-index-main__date-partition::after {\n  content: \"\";\n  height: 1px;\n  flex-grow: 1;\n  background-color: #666;\n}\n.p-index-main__date-partition::before {\n  margin-right: 1rem;\n}\n.p-index-main__date-partition::after {\n  margin-left: 1rem;\n}\n\n.p-index-main__output {\n  overflow: scroll;\n  height: calc(100% - 67px);\n  padding: $space-md;\n}\n.p-index-main__output-header {\n  text-align: center;\n  font-size: map-get($font-size, title-output);\n  font-weight: bold;\n  font-family: 'Roboto Condensed', sans-serif;\n}\n\n.p-index-main__msg-list > li {\n  display: flex;\n  margin-bottom: $space-md;\n}\n.p-index-main__sender-image-wrap {\n  margin-right: $space-md;\n  @include mq(tab-max) {\n    margin-right: $space-sm;\n  }\n}\n.p-index-main__sender-image {\n  overflow: hidden;\n  height: 45px;\n  width: 45px;\n  padding: 0;\n  border-radius: map-get($border-radius-size, full);\n  background-color: map-get($bg-colors, tertiary);\n  font-size: map-get($font-size, btn-icon-lg);\n  > img {\n    object-fit: cover;\n    height: inherit;\n    width: inherit;\n  }\n}\n\n.p-index-main__msg-content {\n  display: grid;\n  gap: 0.3rem;\n  padding-top: $space-xsm;\n}\n.p-index-main__msg-posting-info {\n  display: flex;\n  align-items: end;\n  > .username {\n    max-width: 450px;\n    margin-right: $space-sm;\n    font-size: map-get($font-size, msg-input);\n    font-weight: bold;\n    @include mq(sp) { max-width: 200px; }\n    @include mq(tab) { max-width: 350px; }\n  }\n  > .date {\n    margin-right: $space-sm;\n    font-size: map-get($font-size, date);\n    color: map-get($font-colors, date);\n  }\n}\n.p-index-main__msg-manager {\n  display: contents;\n  @include hover {\n    > i {\n      transition: all 0.15s;\n      scale: 1.2;\n    }\n  }\n  @include mq(tab-min) {\n    font-size: map-get($font-size, btn-icon-md);\n  }\n}\n.p-index-main__msg-mdl-opener { \n  > i { margin-right: $space-xsm }\n}\n\n.p-index-main__msg-text-wrap {\n  font-size: map-get($font-size, msg-input);\n}\n\n.p-index-main__img-wrap {\n  position: relative;\n}\n\n.p-index-main__dcmnt-wrap {\n  display: flex;\n  width: 40%;\n  min-width: 325px;\n  margin-top: 0.7rem;\n  padding: 0.7rem $space-2xlg 0.7rem 0.7rem;\n  border-radius: 0.3rem;\n  background-color: map-get($bg-colors, tertiary);\n  @include mq(sp) {\n    min-width: 225px;\n    margin-top: 0.5rem;\n  }\n  > i {\n    margin-right: 0.5rem;\n    font-size: 2rem;\n  }\n}\n.p-index-main__dcmnt-info {\n  > a {\n    color: map-get($font-colors, dcmnt);\n    font-size: 1rem;\n  }\n  > p {\n    font-size: 0.7rem;\n    opacity: 0.5;\n  }\n}\n\n.p-index-main__input {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  left: 0;\n  padding: $space-sm $space-lg $space-md;\n  background-color: map-get($bg-colors, secondary);\n}\n\n.p-index-main__user-info-list {\n  display: grid;\n  gap: $space-lg;\n  width: 65%;\n  min-width: 250px;\n  margin: auto;\n  > li {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n  }\n  > li:first-child {\n    justify-content: space-around;\n  }\n}\n\n.p-index-main__user-image {\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  overflow: hidden;\n  height: 80px;\n  width: 80px;\n  border-radius: map-get($border-radius-size, full);\n  font-size: map-get($font-size, btn-icon-2xlg);\n  background-color: map-get($bg-colors, tertiary);\n  @include hover { background-color: map-get($btn-bg-colors, secondary); }\n  > img {\n    object-fit: cover;\n    height: inherit;\n    width: inherit;\n  }\n}\n.p-index-main__user-info-label {\n  display: grid;\n  gap: $space-2xsm;\n  font-size: map-get($font-size, label);\n}","//_utility.scss\n\n@use \"../../foundation/tools/global\" as *;\n\n// 該当のデバイス画角に対応するdisplay:noneです -------------------------------------\n\n// Smartphone(sp)\n.u-dn-sp {\n  @include mq(sp) {\n    display: none !important;\n  }\n}\n\n// Tablet(tab以下)\n.u-dn-tab-max {\n  @include mq(tab-max) {\n    display: none !important;\n  }\n}\n\n// Tablet(tab以上)\n.u-dn-tab-min {\n  @include mq(tab-min) {\n    display: none !important;\n  }\n}\n\n// PC(pc)\n.u-dn-pc {\n  @include mq(pc) {\n    display: none !important;\n  }\n}\n\n// シンプルに非表示\n.u-dn { display: none !important; }\n\n// data属性による切り替え\n.u-dn-by-data:not([data-status=\"on\"]) { display: none !important; }\n\n\n// 該当のデバイス画角に対応してアニメーションを無効にします -----------------------------\n\n//Smartphone(sp)\n.u-non-anim-sp {\n  @include mq(sp) {\n    transition: none !important;\n    transform: none !important;\n  }\n}\n\n//Tablet(tab)\n.u-non-anim-tab-max {\n  @include mq(tab-max) {\n    transition: none !important;\n    transform: none !important;\n  }\n}\n\n.u-non-anim-tab-min {\n  @include mq(tab-min) {\n    transition: none !important;\n    transform: none !important;\n  }\n}\n\n// PC(pc)\n.u-non-anim-pc {\n  @include mq(pc) {\n    transition: none !important;\n    transform: none !important;\n  }\n}\n\n\n// Flex Box ------------------------------------------------------------------\n\n// flex item の縦横を定めるライン\n$min-line-base:  90px;\n$min-line-pc:    $min-line-base;\n$min-line-tab:   $min-line-base * 0.75;\n$min-line-sp:    $min-line-base * 0.5;\n$min-line-list: $min-line-pc, $min-line-tab, $min-line-sp;\n$bp-list: pc, tab, sp;\n\n.msg-img-flex-box {\n  display: flex;\n  flex-wrap: wrap;\n  gap: $space-3xsm;\n}\n\n.msg-img-flex-box .flex-item {\n  display: flex;\n  overflow: hidden;\n  border-radius: map-get($border-radius-size, primary);\n}\n\n.msg-img-flex-box .flex-item img {\n  object-fit: cover;\n  width: 100%;\n}\n\n.msg-img-flex-box .flex-item-wrap--column {\n  display: flex;\n  flex-direction: column;\n  gap: $space-3xsm;\n}\n\n@function devidedWidth($value) {\n  @return calc(100% / $value - $space-3xsm)\n}\n\n@for $i from 1 through 10 {\n  .msg-img-flex-box--#{$i} {\n    @each $ln in $min-line-list {\n      @include mq( nth($bp-list, index($min-line-list,$ln)) ) {\n        @if $i == 1 { width: $ln*4; } @else { width: $ln*6; }\n\n        @if $i == 1 {\n          > .flex-item:nth-child(1) {\n            height: $ln*3;\n            width: devidedWidth(1);\n          }\n        } @else if $i == 2 {\n          @for $ii from 1 through 2 {\n            > .flex-item:nth-child(#{$ii}) {\n              height: $ln*3;\n              width: devidedWidth(2);\n            }\n          }\n        // 3つ画像がある時のみ要素の構成が特殊で、\n        // 1つ目の画像は左に、2・3の画像は縦並びにするwrapに包み右配置する\n        } @else if $i == 3 {\n          > .flex-item:nth-child(1) {\n            height: $ln*4;\n            width: devidedWidth(1.5);\n          }\n          > .flex-item-wrap--column:nth-child(2) {\n            height: $ln*4;\n            width: devidedWidth(3);\n            > .flex-item {\n              height: $ln*2;\n              width: 100%;\n            }\n          }\n        } @else if $i == 4 {\n          @for $ii from 1 through 4 {\n            > .flex-item:nth-child(#{$ii}) {\n              height: $ln*2;\n              width: devidedWidth(2);\n            }\n          }\n        } @else if $i == 5 {\n          @for $ii from 1 through 5 {\n            @if $ii == 1 or $ii == 2 {\n              > .flex-item:nth-child(#{$ii}) {\n                height: $ln*3;\n                width: devidedWidth(2);\n              }\n            } @else {\n              > .flex-item:nth-child(#{$ii}) {\n                height: $ln*2;\n                width: devidedWidth(3);\n              }\n            }\n          }\n        } @else if $i == 6 {\n          @for $ii from 1 through 6 {\n            > .flex-item:nth-child(#{$ii}) {\n              height: $ln*2;\n              width: devidedWidth(3);\n            }\n          }\n        } @else if $i == 7 {\n          @for $ii from 1 through 7 {\n            @if $ii == 1 {\n              > .flex-item:nth-child(#{$ii}) {\n                height: $ln*3;\n                width: devidedWidth(1);\n              }\n            } @else {\n              > .flex-item:nth-child(#{$ii}) {\n                height: $ln*2;\n                width: devidedWidth(3);\n              }\n            }\n          }\n        } @else if $i == 8 {\n          @for $ii from 1 through 8 {\n            @if $ii == 1 or $ii == 2 {\n              > .flex-item:nth-child(#{$ii}) {\n                height: $ln*3;\n                width: devidedWidth(2);\n              }\n            } @else {\n              > .flex-item:nth-child(#{$ii}) {\n                height: $ln*2;\n                width: devidedWidth(3);\n              }\n            }\n          }\n        } @else if $i == 9 {\n          @for $ii from 1 through 9 {\n            > .flex-item:nth-child(#{$ii}) {\n              height: $ln*2;\n              width: devidedWidth(3);\n            }\n          }\n        } @else if $i == 10 {\n          @for $ii from 1 through 10 {\n            @if $ii == 1 {\n              > .flex-item:nth-child(#{$ii}) {\n                height: $ln*3;\n                width: devidedWidth(1);\n              }\n            } @else {\n              > .flex-item:nth-child(#{$ii}) {\n                height: $ln*2;\n                width: devidedWidth(3);\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n\n\n// その他 ----------------------------------------------------------------------\n\n// マウスカーソルの形をポインター型にします //! つかってない\n.u-pointer { cursor: pointer; }\n\n// 画面更新後に起こる、アニメーションの誤挙動を制御します(src/js/preloadm.jsありき)\n.u-preload { display: none; }\n\n// アイコン等を含むテキストの並びを並行にします\n.u-txt-opt {\n  display: flex;\n  align-items: center;\n}\n\n// active状態の項目の背景を設定します\n.u-active-item {\n  background-color: map-get($bg-colors, active) !important;\n}\n\n.u-dp-flx { display: flex; }\n.u-dp-flx--btwn {\n  display: flex;\n  justify-content: end;\n}\n.u-dp-flx--center {\n  display: flex;\n  justify-content: center;\n}\n\n.u-dp-inln-blck { display: inline-block; }\n\n.u-txt-center { text-align: center; }\n\n.u-string-shortener {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.u-f-w--bold { font-weight: bold; }\n\n.u-bg--alert { background-color: map-get($bg-colors, alert) !important; }\n\n.u-mrgn-center--hrzn {\n  margin-right: auto;\n  margin-left: auto;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "../node_modules/css-loader/dist/runtime/api.js":
/*!******************************************************!*\
  !*** ../node_modules/css-loader/dist/runtime/api.js ***!
  \******************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "../node_modules/css-loader/dist/runtime/getUrl.js":
/*!*********************************************************!*\
  !*** ../node_modules/css-loader/dist/runtime/getUrl.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),

/***/ "../node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!*************************************************************!*\
  !*** ../node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "../node_modules/jquery/dist/jquery.js":
/*!*********************************************!*\
  !*** ../node_modules/jquery/dist/jquery.js ***!
  \*********************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery JavaScript Library v3.7.1
 * https://jquery.com/
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2023-08-28T13:37Z
 */
( function( global, factory ) {

	"use strict";

	if (  true && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket trac-14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var flat = arr.flat ? function( array ) {
	return arr.flat.call( array );
} : function( array ) {
	return arr.concat.apply( [], array );
};


var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

		// Support: Chrome <=57, Firefox <=52
		// In some browsers, typeof returns "function" for HTML <object> elements
		// (i.e., `typeof document.createElement( "object" ) === "function"`).
		// We don't want to classify *any* DOM node as a function.
		// Support: QtWeb <=3.8.5, WebKit <=534.34, wkhtmltopdf tool <=0.12.5
		// Plus for old WebKit, typeof returns "function" for HTML collections
		// (e.g., `typeof document.getElementsByTagName("div") === "function"`). (gh-4756)
		return typeof obj === "function" && typeof obj.nodeType !== "number" &&
			typeof obj.item !== "function";
	};


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};


var document = window.document;



	var preservedScriptAttributes = {
		type: true,
		src: true,
		nonce: true,
		noModule: true
	};

	function DOMEval( code, node, doc ) {
		doc = doc || document;

		var i, val,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {

				// Support: Firefox 64+, Edge 18+
				// Some browsers don't support the "nonce" property on scripts.
				// On the other hand, just using `getAttribute` is not enough as
				// the `nonce` attribute is reset to an empty string whenever it
				// becomes browsing-context connected.
				// See https://github.com/whatwg/html/issues/2369
				// See https://html.spec.whatwg.org/#nonce-attributes
				// The `node.getAttribute` check was added for the sake of
				// `jQuery.globalEval` so that it can fake a nonce-containing node
				// via an object.
				val = node[ i ] || node.getAttribute && node.getAttribute( i );
				if ( val ) {
					script.setAttribute( i, val );
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var version = "3.7.1",

	rhtmlSuffix = /HTML$/i,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	even: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return ( i + 1 ) % 2;
		} ) );
	},

	odd: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return i % 2;
		} ) );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a provided context; falls back to the global one
	// if not specified.
	globalEval: function( code, options, doc ) {
		DOMEval( code, { nonce: options && options.nonce }, doc );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},


	// Retrieve the text value of an array of DOM nodes
	text: function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {

			// If no nodeType, this is expected to be an array
			while ( ( node = elem[ i++ ] ) ) {

				// Do not traverse comment nodes
				ret += jQuery.text( node );
			}
		}
		if ( nodeType === 1 || nodeType === 11 ) {
			return elem.textContent;
		}
		if ( nodeType === 9 ) {
			return elem.documentElement.textContent;
		}
		if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}

		// Do not include comment or processing instruction nodes

		return ret;
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
						[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	isXMLDoc: function( elem ) {
		var namespace = elem && elem.namespaceURI,
			docElem = elem && ( elem.ownerDocument || elem ).documentElement;

		// Assume HTML when documentElement doesn't yet exist, such as inside
		// document fragments.
		return !rhtmlSuffix.test( namespace || docElem && docElem.nodeName || "HTML" );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return flat( ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( _i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}


function nodeName( elem, name ) {

	return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

}
var pop = arr.pop;


var sort = arr.sort;


var splice = arr.splice;


var whitespace = "[\\x20\\t\\r\\n\\f]";


var rtrimCSS = new RegExp(
	"^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$",
	"g"
);




// Note: an element does not contain itself
jQuery.contains = function( a, b ) {
	var bup = b && b.parentNode;

	return a === bup || !!( bup && bup.nodeType === 1 && (

		// Support: IE 9 - 11+
		// IE doesn't have `contains` on SVG.
		a.contains ?
			a.contains( bup ) :
			a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
	) );
};




// CSS string/identifier serialization
// https://drafts.csswg.org/cssom/#common-serializing-idioms
var rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;

function fcssescape( ch, asCodePoint ) {
	if ( asCodePoint ) {

		// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
		if ( ch === "\0" ) {
			return "\uFFFD";
		}

		// Control characters and (dependent upon position) numbers get escaped as code points
		return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
	}

	// Other potentially-special ASCII characters get backslash-escaped
	return "\\" + ch;
}

jQuery.escapeSelector = function( sel ) {
	return ( sel + "" ).replace( rcssescape, fcssescape );
};




var preferredDoc = document,
	pushNative = push;

( function() {

var i,
	Expr,
	outermostContext,
	sortInput,
	hasDuplicate,
	push = pushNative,

	// Local document vars
	document,
	documentElement,
	documentIsHTML,
	rbuggyQSA,
	matches,

	// Instance-specific data
	expando = jQuery.expando,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	nonnativeSelectorCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|" +
		"loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
	identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
		"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

	// Attribute selectors: https://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +

		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
		whitespace + "*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +

		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rleadingCombinator = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" +
		whitespace + "*" ),
	rdescend = new RegExp( whitespace + "|>" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		ID: new RegExp( "^#(" + identifier + ")" ),
		CLASS: new RegExp( "^\\.(" + identifier + ")" ),
		TAG: new RegExp( "^(" + identifier + "|[*])" ),
		ATTR: new RegExp( "^" + attributes ),
		PSEUDO: new RegExp( "^" + pseudos ),
		CHILD: new RegExp(
			"^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
				whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
				whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		bool: new RegExp( "^(?:" + booleans + ")$", "i" ),

		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		needsContext: new RegExp( "^" + whitespace +
			"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
			"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// https://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace +
		"?|\\\\([^\\r\\n\\f])", "g" ),
	funescape = function( escape, nonHex ) {
		var high = "0x" + escape.slice( 1 ) - 0x10000;

		if ( nonHex ) {

			// Strip the backslash prefix from a non-hex escape sequence
			return nonHex;
		}

		// Replace a hexadecimal escape sequence with the encoded Unicode code point
		// Support: IE <=11+
		// For values outside the Basic Multilingual Plane (BMP), manually construct a
		// surrogate pair
		return high < 0 ?
			String.fromCharCode( high + 0x10000 ) :
			String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes; see `setDocument`.
	// Support: IE 9 - 11+, Edge 12 - 18+
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE/Edge.
	unloadHandler = function() {
		setDocument();
	},

	inDisabledFieldset = addCombinator(
		function( elem ) {
			return elem.disabled === true && nodeName( elem, "fieldset" );
		},
		{ dir: "parentNode", next: "legend" }
	);

// Support: IE <=9 only
// Accessing document.activeElement can throw unexpectedly
// https://bugs.jquery.com/ticket/13393
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		( arr = slice.call( preferredDoc.childNodes ) ),
		preferredDoc.childNodes
	);

	// Support: Android <=4.0
	// Detect silently failing push.apply
	// eslint-disable-next-line no-unused-expressions
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = {
		apply: function( target, els ) {
			pushNative.apply( target, slice.call( els ) );
		},
		call: function( target ) {
			pushNative.apply( target, slice.call( arguments, 1 ) );
		}
	};
}

function find( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {
		setDocument( context );
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && ( match = rquickExpr.exec( selector ) ) ) {

				// ID selector
				if ( ( m = match[ 1 ] ) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( ( elem = context.getElementById( m ) ) ) {

							// Support: IE 9 only
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								push.call( results, elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE 9 only
						// getElementById can match elements by name instead of ID
						if ( newContext && ( elem = newContext.getElementById( m ) ) &&
							find.contains( context, elem ) &&
							elem.id === m ) {

							push.call( results, elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[ 2 ] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( ( m = match[ 3 ] ) && context.getElementsByClassName ) {
					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( !nonnativeSelectorCache[ selector + " " ] &&
				( !rbuggyQSA || !rbuggyQSA.test( selector ) ) ) {

				newSelector = selector;
				newContext = context;

				// qSA considers elements outside a scoping root when evaluating child or
				// descendant combinators, which is not what we want.
				// In such cases, we work around the behavior by prefixing every selector in the
				// list with an ID selector referencing the scope context.
				// The technique has to be used as well when a leading combinator is used
				// as such selectors are not recognized by querySelectorAll.
				// Thanks to Andrew Dupont for this technique.
				if ( nodeType === 1 &&
					( rdescend.test( selector ) || rleadingCombinator.test( selector ) ) ) {

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;

					// We can use :scope instead of the ID hack if the browser
					// supports it & if we're not changing the context.
					// Support: IE 11+, Edge 17 - 18+
					// IE/Edge sometimes throw a "Permission denied" error when
					// strict-comparing two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					if ( newContext != context || !support.scope ) {

						// Capture the context ID, setting it first if necessary
						if ( ( nid = context.getAttribute( "id" ) ) ) {
							nid = jQuery.escapeSelector( nid );
						} else {
							context.setAttribute( "id", ( nid = expando ) );
						}
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
							toSelector( groups[ i ] );
					}
					newSelector = groups.join( "," );
				}

				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch ( qsaError ) {
					nonnativeSelectorCache( selector, true );
				} finally {
					if ( nid === expando ) {
						context.removeAttribute( "id" );
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrimCSS, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {

		// Use (key + " ") to avoid collision with native prototype properties
		// (see https://github.com/jquery/sizzle/issues/157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {

			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return ( cache[ key + " " ] = value );
	}
	return cache;
}

/**
 * Mark a function for special use by jQuery selector module
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement( "fieldset" );

	try {
		return !!fn( el );
	} catch ( e ) {
		return false;
	} finally {

		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}

		// release memory in IE
		el = null;
	}
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		return nodeName( elem, "input" ) && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		return ( nodeName( elem, "input" ) || nodeName( elem, "button" ) ) &&
			elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11+
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					elem.isDisabled !== !disabled &&
						inDisabledFieldset( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction( function( argument ) {
		argument = +argument;
		return markFunction( function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
					seed[ j ] = !( matches[ j ] = seed[ j ] );
				}
			}
		} );
	} );
}

/**
 * Checks a node for validity as a jQuery selector context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [node] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
function setDocument( node ) {
	var subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( doc == document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	documentElement = document.documentElement;
	documentIsHTML = !jQuery.isXMLDoc( document );

	// Support: iOS 7 only, IE 9 - 11+
	// Older browsers didn't support unprefixed `matches`.
	matches = documentElement.matches ||
		documentElement.webkitMatchesSelector ||
		documentElement.msMatchesSelector;

	// Support: IE 9 - 11+, Edge 12 - 18+
	// Accessing iframe documents after unload throws "permission denied" errors
	// (see trac-13936).
	// Limit the fix to IE & Edge Legacy; despite Edge 15+ implementing `matches`,
	// all IE 9+ and Edge Legacy versions implement `msMatchesSelector` as well.
	if ( documentElement.msMatchesSelector &&

		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		preferredDoc != document &&
		( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {

		// Support: IE 9 - 11+, Edge 12 - 18+
		subWindow.addEventListener( "unload", unloadHandler );
	}

	// Support: IE <10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert( function( el ) {
		documentElement.appendChild( el ).id = jQuery.expando;
		return !document.getElementsByName ||
			!document.getElementsByName( jQuery.expando ).length;
	} );

	// Support: IE 9 only
	// Check to see if it's possible to do matchesSelector
	// on a disconnected node.
	support.disconnectedMatch = assert( function( el ) {
		return matches.call( el, "*" );
	} );

	// Support: IE 9 - 11+, Edge 12 - 18+
	// IE/Edge don't support the :scope pseudo-class.
	support.scope = assert( function() {
		return document.querySelectorAll( ":scope" );
	} );

	// Support: Chrome 105 - 111 only, Safari 15.4 - 16.3 only
	// Make sure the `:has()` argument is parsed unforgivingly.
	// We include `*` in the test to detect buggy implementations that are
	// _selectively_ forgiving (specifically when the list includes at least
	// one valid selector).
	// Note that we treat complete lack of support for `:has()` as if it were
	// spec-compliant support, which is fine because use of `:has()` in such
	// environments will fail in the qSA path and fall back to jQuery traversal
	// anyway.
	support.cssHas = assert( function() {
		try {
			document.querySelector( ":has(*,:jqfake)" );
			return false;
		} catch ( e ) {
			return true;
		}
	} );

	// ID filter and find
	if ( support.getById ) {
		Expr.filter.ID = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute( "id" ) === attrId;
			};
		};
		Expr.find.ID = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter.ID =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode( "id" );
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find.ID = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode( "id" );
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( ( elem = elems[ i++ ] ) ) {
						node = elem.getAttributeNode( "id" );
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find.TAG = function( tag, context ) {
		if ( typeof context.getElementsByTagName !== "undefined" ) {
			return context.getElementsByTagName( tag );

		// DocumentFragment nodes don't have gEBTN
		} else {
			return context.querySelectorAll( tag );
		}
	};

	// Class
	Expr.find.CLASS = function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	rbuggyQSA = [];

	// Build QSA regex
	// Regex strategy adopted from Diego Perini
	assert( function( el ) {

		var input;

		documentElement.appendChild( el ).innerHTML =
			"<a id='" + expando + "' href='' disabled='disabled'></a>" +
			"<select id='" + expando + "-\r\\' disabled='disabled'>" +
			"<option selected=''></option></select>";

		// Support: iOS <=7 - 8 only
		// Boolean attributes and "value" are not treated correctly in some XML documents
		if ( !el.querySelectorAll( "[selected]" ).length ) {
			rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
		}

		// Support: iOS <=7 - 8 only
		if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
			rbuggyQSA.push( "~=" );
		}

		// Support: iOS 8 only
		// https://bugs.webkit.org/show_bug.cgi?id=136851
		// In-page `selector#id sibling-combinator selector` fails
		if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
			rbuggyQSA.push( ".#.+[+~]" );
		}

		// Support: Chrome <=105+, Firefox <=104+, Safari <=15.4+
		// In some of the document kinds, these selectors wouldn't work natively.
		// This is probably OK but for backwards compatibility we want to maintain
		// handling them through jQuery traversal in jQuery 3.x.
		if ( !el.querySelectorAll( ":checked" ).length ) {
			rbuggyQSA.push( ":checked" );
		}

		// Support: Windows 8 Native Apps
		// The type and name attributes are restricted during .innerHTML assignment
		input = document.createElement( "input" );
		input.setAttribute( "type", "hidden" );
		el.appendChild( input ).setAttribute( "name", "D" );

		// Support: IE 9 - 11+
		// IE's :disabled selector does not pick up the children of disabled fieldsets
		// Support: Chrome <=105+, Firefox <=104+, Safari <=15.4+
		// In some of the document kinds, these selectors wouldn't work natively.
		// This is probably OK but for backwards compatibility we want to maintain
		// handling them through jQuery traversal in jQuery 3.x.
		documentElement.appendChild( el ).disabled = true;
		if ( el.querySelectorAll( ":disabled" ).length !== 2 ) {
			rbuggyQSA.push( ":enabled", ":disabled" );
		}

		// Support: IE 11+, Edge 15 - 18+
		// IE 11/Edge don't find elements on a `[name='']` query in some cases.
		// Adding a temporary attribute to the document before the selection works
		// around the issue.
		// Interestingly, IE 10 & older don't seem to have the issue.
		input = document.createElement( "input" );
		input.setAttribute( "name", "" );
		el.appendChild( input );
		if ( !el.querySelectorAll( "[name='']" ).length ) {
			rbuggyQSA.push( "\\[" + whitespace + "*name" + whitespace + "*=" +
				whitespace + "*(?:''|\"\")" );
		}
	} );

	if ( !support.cssHas ) {

		// Support: Chrome 105 - 110+, Safari 15.4 - 16.3+
		// Our regular `try-catch` mechanism fails to detect natively-unsupported
		// pseudo-classes inside `:has()` (such as `:has(:contains("Foo"))`)
		// in browsers that parse the `:has()` argument as a forgiving selector list.
		// https://drafts.csswg.org/selectors/#relational now requires the argument
		// to be parsed unforgivingly, but browsers have not yet fully adjusted.
		rbuggyQSA.push( ":has" );
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join( "|" ) );

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			( !support.sortDetached && b.compareDocumentPosition( a ) === compare ) ) {

			// Choose the first element that is related to our preferred document
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( a === document || a.ownerDocument == preferredDoc &&
				find.contains( preferredDoc, a ) ) {
				return -1;
			}

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( b === document || b.ownerDocument == preferredDoc &&
				find.contains( preferredDoc, b ) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	};

	return document;
}

find.matches = function( expr, elements ) {
	return find( expr, null, null, elements );
};

find.matchesSelector = function( elem, expr ) {
	setDocument( elem );

	if ( documentIsHTML &&
		!nonnativeSelectorCache[ expr + " " ] &&
		( !rbuggyQSA || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||

					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch ( e ) {
			nonnativeSelectorCache( expr, true );
		}
	}

	return find( expr, document, null, [ elem ] ).length > 0;
};

find.contains = function( context, elem ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( context.ownerDocument || context ) != document ) {
		setDocument( context );
	}
	return jQuery.contains( context, elem );
};


find.attr = function( elem, name ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( elem.ownerDocument || elem ) != document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],

		// Don't get fooled by Object.prototype properties (see trac-13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	if ( val !== undefined ) {
		return val;
	}

	return elem.getAttribute( name );
};

find.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
jQuery.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	//
	// Support: Android <=4.0+
	// Testing for detecting duplicates is unpredictable so instead assume we can't
	// depend on duplicate detection in all browsers without a stable sort.
	hasDuplicate = !support.sortStable;
	sortInput = !support.sortStable && slice.call( results, 0 );
	sort.call( results, sortOrder );

	if ( hasDuplicate ) {
		while ( ( elem = results[ i++ ] ) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			splice.call( results, duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

jQuery.fn.uniqueSort = function() {
	return this.pushStack( jQuery.uniqueSort( slice.apply( this ) ) );
};

Expr = jQuery.expr = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		ATTR: function( match ) {
			match[ 1 ] = match[ 1 ].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[ 3 ] = ( match[ 3 ] || match[ 4 ] || match[ 5 ] || "" )
				.replace( runescape, funescape );

			if ( match[ 2 ] === "~=" ) {
				match[ 3 ] = " " + match[ 3 ] + " ";
			}

			return match.slice( 0, 4 );
		},

		CHILD: function( match ) {

			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[ 1 ] = match[ 1 ].toLowerCase();

			if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

				// nth-* requires argument
				if ( !match[ 3 ] ) {
					find.error( match[ 0 ] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[ 4 ] = +( match[ 4 ] ?
					match[ 5 ] + ( match[ 6 ] || 1 ) :
					2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" )
				);
				match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

			// other types prohibit arguments
			} else if ( match[ 3 ] ) {
				find.error( match[ 0 ] );
			}

			return match;
		},

		PSEUDO: function( match ) {
			var excess,
				unquoted = !match[ 6 ] && match[ 2 ];

			if ( matchExpr.CHILD.test( match[ 0 ] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[ 3 ] ) {
				match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&

				// Get excess from tokenize (recursively)
				( excess = tokenize( unquoted, true ) ) &&

				// advance to the next closing parenthesis
				( excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length ) ) {

				// excess is a negative index
				match[ 0 ] = match[ 0 ].slice( 0, excess );
				match[ 2 ] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		TAG: function( nodeNameSelector ) {
			var expectedNodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() {
					return true;
				} :
				function( elem ) {
					return nodeName( elem, expectedNodeName );
				};
		},

		CLASS: function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				( pattern = new RegExp( "(^|" + whitespace + ")" + className +
					"(" + whitespace + "|$)" ) ) &&
				classCache( className, function( elem ) {
					return pattern.test(
						typeof elem.className === "string" && elem.className ||
							typeof elem.getAttribute !== "undefined" &&
								elem.getAttribute( "class" ) ||
							""
					);
				} );
		},

		ATTR: function( name, operator, check ) {
			return function( elem ) {
				var result = find.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				if ( operator === "=" ) {
					return result === check;
				}
				if ( operator === "!=" ) {
					return result !== check;
				}
				if ( operator === "^=" ) {
					return check && result.indexOf( check ) === 0;
				}
				if ( operator === "*=" ) {
					return check && result.indexOf( check ) > -1;
				}
				if ( operator === "$=" ) {
					return check && result.slice( -check.length ) === check;
				}
				if ( operator === "~=" ) {
					return ( " " + result.replace( rwhitespace, " " ) + " " )
						.indexOf( check ) > -1;
				}
				if ( operator === "|=" ) {
					return result === check || result.slice( 0, check.length + 1 ) === check + "-";
				}

				return false;
			};
		},

		CHILD: function( type, what, _argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, _context, xml ) {
					var cache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( ( node = node[ dir ] ) ) {
									if ( ofType ?
										nodeName( node, name ) :
										node.nodeType === 1 ) {

										return false;
									}
								}

								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || ( parent[ expando ] = {} );
							cache = outerCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( ( node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								( diff = nodeIndex = 0 ) || start.pop() ) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {

							// Use previously-cached element index if available
							if ( useCache ) {
								outerCache = elem[ expando ] || ( elem[ expando ] = {} );
								cache = outerCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {

								// Use the same loop as above to seek `elem` from the start
								while ( ( node = ++nodeIndex && node && node[ dir ] ||
									( diff = nodeIndex = 0 ) || start.pop() ) ) {

									if ( ( ofType ?
										nodeName( node, name ) :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] ||
												( node[ expando ] = {} );
											outerCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		PSEUDO: function( pseudo, argument ) {

			// pseudo-class names are case-insensitive
			// https://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					find.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as jQuery does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction( function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[ i ] );
							seed[ idx ] = !( matches[ idx ] = matched[ i ] );
						}
					} ) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {

		// Potentially complex pseudos
		not: markFunction( function( selector ) {

			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrimCSS, "$1" ) );

			return matcher[ expando ] ?
				markFunction( function( seed, matches, _context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( ( elem = unmatched[ i ] ) ) {
							seed[ i ] = !( matches[ i ] = elem );
						}
					}
				} ) :
				function( elem, _context, xml ) {
					input[ 0 ] = elem;
					matcher( input, null, xml, results );

					// Don't keep the element
					// (see https://github.com/jquery/sizzle/issues/299)
					input[ 0 ] = null;
					return !results.pop();
				};
		} ),

		has: markFunction( function( selector ) {
			return function( elem ) {
				return find( selector, elem ).length > 0;
			};
		} ),

		contains: markFunction( function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || jQuery.text( elem ) ).indexOf( text ) > -1;
			};
		} ),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// https://www.w3.org/TR/selectors/#lang-pseudo
		lang: markFunction( function( lang ) {

			// lang value must be a valid identifier
			if ( !ridentifier.test( lang || "" ) ) {
				find.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( ( elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
				return false;
			};
		} ),

		// Miscellaneous
		target: function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		root: function( elem ) {
			return elem === documentElement;
		},

		focus: function( elem ) {
			return elem === safeActiveElement() &&
				document.hasFocus() &&
				!!( elem.type || elem.href || ~elem.tabIndex );
		},

		// Boolean properties
		enabled: createDisabledPseudo( false ),
		disabled: createDisabledPseudo( true ),

		checked: function( elem ) {

			// In CSS3, :checked should return both checked and selected elements
			// https://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			return ( nodeName( elem, "input" ) && !!elem.checked ) ||
				( nodeName( elem, "option" ) && !!elem.selected );
		},

		selected: function( elem ) {

			// Support: IE <=11+
			// Accessing the selectedIndex property
			// forces the browser to treat the default option as
			// selected when in an optgroup.
			if ( elem.parentNode ) {
				// eslint-disable-next-line no-unused-expressions
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		empty: function( elem ) {

			// https://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		parent: function( elem ) {
			return !Expr.pseudos.empty( elem );
		},

		// Element/input types
		header: function( elem ) {
			return rheader.test( elem.nodeName );
		},

		input: function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		button: function( elem ) {
			return nodeName( elem, "input" ) && elem.type === "button" ||
				nodeName( elem, "button" );
		},

		text: function( elem ) {
			var attr;
			return nodeName( elem, "input" ) && elem.type === "text" &&

				// Support: IE <10 only
				// New HTML5 attribute values (e.g., "search") appear
				// with elem.type === "text"
				( ( attr = elem.getAttribute( "type" ) ) == null ||
					attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		first: createPositionalPseudo( function() {
			return [ 0 ];
		} ),

		last: createPositionalPseudo( function( _matchIndexes, length ) {
			return [ length - 1 ];
		} ),

		eq: createPositionalPseudo( function( _matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		} ),

		even: createPositionalPseudo( function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		odd: createPositionalPseudo( function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		lt: createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i;

			if ( argument < 0 ) {
				i = argument + length;
			} else if ( argument > length ) {
				i = length;
			} else {
				i = argument;
			}

			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		gt: createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} )
	}
};

Expr.pseudos.nth = Expr.pseudos.eq;

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
			if ( match ) {

				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[ 0 ].length ) || soFar;
			}
			groups.push( ( tokens = [] ) );
		}

		matched = false;

		// Combinators
		if ( ( match = rleadingCombinator.exec( soFar ) ) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,

				// Cast descendant combinators to space
				type: match[ 0 ].replace( rtrimCSS, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( ( match = matchExpr[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
				( match = preFilters[ type ]( match ) ) ) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	if ( parseOnly ) {
		return soFar.length;
	}

	return soFar ?
		find.error( selector ) :

		// Cache the tokens
		tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[ i ].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?

		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( ( elem = elem[ dir ] ) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || ( elem[ expando ] = {} );

						if ( skip && nodeName( elem, skip ) ) {
							elem = elem[ dir ] || elem;
						} else if ( ( oldCache = outerCache[ key ] ) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return ( newCache[ 2 ] = oldCache[ 2 ] );
						} else {

							// Reuse newcache so results back-propagate to previous elements
							outerCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[ i ]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[ 0 ];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		find( selector, contexts[ i ], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( ( elem = unmatched[ i ] ) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction( function( seed, results, context, xml ) {
		var temp, i, elem, matcherOut,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed ||
				multipleContexts( selector || "*",
					context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems;

		if ( matcher ) {

			// If we have a postFinder, or filtered seed, or non-seed postFilter
			// or preexisting results,
			matcherOut = postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

				// ...intermediate processing is necessary
				[] :

				// ...otherwise use results directly
				results;

			// Find primary matches
			matcher( matcherIn, matcherOut, context, xml );
		} else {
			matcherOut = matcherIn;
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( ( elem = temp[ i ] ) ) {
					matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {

					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( ( elem = matcherOut[ i ] ) ) {

							// Restore matcherIn since elem is not yet a final match
							temp.push( ( matcherIn[ i ] = elem ) );
						}
					}
					postFinder( null, ( matcherOut = [] ), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( ( elem = matcherOut[ i ] ) &&
						( temp = postFinder ? indexOf.call( seed, elem ) : preMap[ i ] ) > -1 ) {

						seed[ temp ] = !( results[ temp ] = elem );
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	} );
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[ 0 ].type ],
		implicitRelative = leadingRelative || Expr.relative[ " " ],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			var ret = ( !leadingRelative && ( xml || context != outermostContext ) ) || (
				( checkContext = context ).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );

			// Avoid hanging onto element
			// (see https://github.com/jquery/sizzle/issues/299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( ( matcher = Expr.relative[ tokens[ i ].type ] ) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = Expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {

				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[ j ].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(

						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 )
							.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
					).replace( rtrimCSS, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,

				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find.TAG( "*", outermost ),

				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 ),
				len = elems.length;

			if ( outermost ) {

				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				outermostContext = context == document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: iOS <=7 - 9 only
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching
			// elements by id. (see trac-14142)
			for ( ; i !== len && ( elem = elems[ i ] ) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;

					// Support: IE 11+, Edge 17 - 18+
					// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
					// two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					if ( !context && elem.ownerDocument != document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( ( matcher = elementMatchers[ j++ ] ) ) {
						if ( matcher( elem, context || document, xml ) ) {
							push.call( results, elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {

					// They will have gone through all possible matchers
					if ( ( elem = !matcher && elem ) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( ( matcher = setMatchers[ j++ ] ) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {

					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
								setMatched[ i ] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					jQuery.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

function compile( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {

		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[ i ] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector,
			matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
}

/**
 * A low-level selection function that works with jQuery's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with jQuery selector compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( ( selector = compiled.selector || selector ) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[ 0 ] = match[ 0 ].slice( 0 );
		if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[ 1 ].type ] ) {

			context = ( Expr.find.ID(
				token.matches[ 0 ].replace( runescape, funescape ),
				context
			) || [] )[ 0 ];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr.needsContext.test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[ i ];

			// Abort if we hit a combinator
			if ( Expr.relative[ ( type = token.type ) ] ) {
				break;
			}
			if ( ( find = Expr.find[ type ] ) ) {

				// Search, expanding context for leading sibling combinators
				if ( ( seed = find(
					token.matches[ 0 ].replace( runescape, funescape ),
					rsibling.test( tokens[ 0 ].type ) &&
						testContext( context.parentNode ) || context
				) ) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
}

// One-time assignments

// Support: Android <=4.0 - 4.1+
// Sort stability
support.sortStable = expando.split( "" ).sort( sortOrder ).join( "" ) === expando;

// Initialize against the default document
setDocument();

// Support: Android <=4.0 - 4.1+
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert( function( el ) {

	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement( "fieldset" ) ) & 1;
} );

jQuery.find = find;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.unique = jQuery.uniqueSort;

// These have always been private, but they used to be documented as part of
// Sizzle so let's maintain them for now for backwards compatibility purposes.
find.compile = compile;
find.select = select;
find.setDocument = setDocument;
find.tokenize = tokenize;

find.escape = jQuery.escapeSelector;
find.getText = jQuery.text;
find.isXML = jQuery.isXMLDoc;
find.selectors = jQuery.expr;
find.support = jQuery.support;
find.uniqueSort = jQuery.uniqueSort;

	/* eslint-enable */

} )();


var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (trac-9521)
	// Strict HTML recognition (trac-11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to jQuery#find
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, _i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, _i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, _i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		if ( elem.contentDocument != null &&

			// Support: IE 11+
			// <object> elements with no `data` attribute has an object
			// `contentDocument` with a `null` prototype.
			getProto( elem.contentDocument ) ) {

			return elem.contentDocument;
		}

		// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
		// Treat the template element as a regular one in browsers that
		// don't support it.
		if ( nodeName( elem, "template" ) ) {
			elem = elem.content || elem;
		}

		return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( _i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.error );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the error, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getErrorHook ) {
									process.error = jQuery.Deferred.getErrorHook();

								// The deprecated alias of the above. While the name suggests
								// returning the stack, not an error instance, jQuery just passes
								// it directly to `console.warn` so both will work; an instance
								// just better cooperates with source maps.
								} else if ( jQuery.Deferred.getStackHook ) {
									process.error = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the primary Deferred
			primary = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						primary.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, primary.done( updateFunc( i ) ).resolve, primary.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( primary.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return primary.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), primary.reject );
		}

		return primary.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

// If `jQuery.Deferred.getErrorHook` is defined, `asyncError` is an error
// captured before the async barrier to get the original error cause
// which may otherwise be hidden.
jQuery.Deferred.exceptionHook = function( error, asyncError ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message,
			error.stack, asyncError );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See trac-6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, _key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( _all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (trac-9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see trac-8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (trac-14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var documentElement = document.documentElement;



	var isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem );
		},
		composed = { composed: true };

	// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
	// Check attachment across shadow DOM boundaries when possible (gh-3504)
	// Support: iOS 10.0-10.2 only
	// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
	// leading to errors. We need to check for `getRootNode`.
	if ( documentElement.getRootNode ) {
		isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem ) ||
				elem.getRootNode( composed ) === elem.ownerDocument;
		};
	}
var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			isAttached( elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = elem.nodeType &&
			( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (trac-11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (trac-14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// Support: IE <=9 only
	// IE <=9 replaces <option> tags with their contents when inserted outside of
	// the select element.
	div.innerHTML = "<option></option>";
	support.option = !!div.lastChild;
} )();


// We have to close these tags to support XHTML (trac-13200)
var wrapMap = {

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: IE <=9 only
if ( !support.option ) {
	wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
}


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (trac-15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, attached, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (trac-12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		attached = isAttached( elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( attached ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


var rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Only attach events to objects that accept data
		if ( !acceptData( elem ) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = Object.create( null );
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( nativeEvent ),

			handlers = (
				dataPriv.get( this, "events" ) || Object.create( null )
			)[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (trac-13208)
				// Don't process clicks on disabled elements (trac-6911, trac-8165, trac-11382, trac-11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (trac-13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
						return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
						return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {

			// Utilize native event to ensure correct state for checkable inputs
			setup: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Claim the first handler
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					// dataPriv.set( el, "click", ... )
					leverageNative( el, "click", true );
				}

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Force setup before triggering a click
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					leverageNative( el, "click" );
				}

				// Return non-false to allow normal event-path propagation
				return true;
			},

			// For cross-browser consistency, suppress native .click() on links
			// Also prevent it if we're currently inside a leveraged native-event stack
			_default: function( event ) {
				var target = event.target;
				return rcheckableType.test( target.type ) &&
					target.click && nodeName( target, "input" ) &&
					dataPriv.get( target, "click" ) ||
					nodeName( target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

// Ensure the presence of an event listener that handles manually-triggered
// synthetic events by interrupting progress until reinvoked in response to
// *native* events that it fires directly, ensuring that state changes have
// already occurred before other listeners are invoked.
function leverageNative( el, type, isSetup ) {

	// Missing `isSetup` indicates a trigger call, which must force setup through jQuery.event.add
	if ( !isSetup ) {
		if ( dataPriv.get( el, type ) === undefined ) {
			jQuery.event.add( el, type, returnTrue );
		}
		return;
	}

	// Register the controller as a special universal handler for all event namespaces
	dataPriv.set( el, type, false );
	jQuery.event.add( el, type, {
		namespace: false,
		handler: function( event ) {
			var result,
				saved = dataPriv.get( this, type );

			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

				// Interrupt processing of the outer synthetic .trigger()ed event
				if ( !saved ) {

					// Store arguments for use when handling the inner native event
					// There will always be at least one argument (an event object), so this array
					// will not be confused with a leftover capture object.
					saved = slice.call( arguments );
					dataPriv.set( this, type, saved );

					// Trigger the native event and capture its result
					this[ type ]();
					result = dataPriv.get( this, type );
					dataPriv.set( this, type, false );

					if ( saved !== result ) {

						// Cancel the outer synthetic event
						event.stopImmediatePropagation();
						event.preventDefault();

						return result;
					}

				// If this is an inner synthetic event for an event with a bubbling surrogate
				// (focus or blur), assume that the surrogate already propagated from triggering
				// the native event and prevent that from happening again here.
				// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
				// bubbling surrogate propagates *after* the non-bubbling base), but that seems
				// less bad than duplication.
				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
					event.stopPropagation();
				}

			// If this is a native event triggered above, everything is now in order
			// Fire an inner synthetic event with the original arguments
			} else if ( saved ) {

				// ...and capture the result
				dataPriv.set( this, type, jQuery.event.trigger(
					saved[ 0 ],
					saved.slice( 1 ),
					this
				) );

				// Abort handling of the native event by all jQuery handlers while allowing
				// native handlers on the same element to run. On target, this is achieved
				// by stopping immediate propagation just on the jQuery event. However,
				// the native event is re-wrapped by a jQuery one on each level of the
				// propagation so the only way to stop it for jQuery is to stop it for
				// everyone via native `stopPropagation()`. This is not a problem for
				// focus/blur which don't bubble, but it does also stop click on checkboxes
				// and radios. We accept this limitation.
				event.stopPropagation();
				event.isImmediatePropagationStopped = returnTrue;
			}
		}
	} );
}

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (trac-504, trac-13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	code: true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,
	which: true
}, jQuery.event.addProp );

jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {

	function focusMappedHandler( nativeEvent ) {
		if ( document.documentMode ) {

			// Support: IE 11+
			// Attach a single focusin/focusout handler on the document while someone wants
			// focus/blur. This is because the former are synchronous in IE while the latter
			// are async. In other browsers, all those handlers are invoked synchronously.

			// `handle` from private data would already wrap the event, but we need
			// to change the `type` here.
			var handle = dataPriv.get( this, "handle" ),
				event = jQuery.event.fix( nativeEvent );
			event.type = nativeEvent.type === "focusin" ? "focus" : "blur";
			event.isSimulated = true;

			// First, handle focusin/focusout
			handle( nativeEvent );

			// ...then, handle focus/blur
			//
			// focus/blur don't bubble while focusin/focusout do; simulate the former by only
			// invoking the handler at the lower level.
			if ( event.target === event.currentTarget ) {

				// The setup part calls `leverageNative`, which, in turn, calls
				// `jQuery.event.add`, so event handle will already have been set
				// by this point.
				handle( event );
			}
		} else {

			// For non-IE browsers, attach a single capturing handler on the document
			// while someone wants focusin/focusout.
			jQuery.event.simulate( delegateType, nativeEvent.target,
				jQuery.event.fix( nativeEvent ) );
		}
	}

	jQuery.event.special[ type ] = {

		// Utilize native event if possible so blur/focus sequence is correct
		setup: function() {

			var attaches;

			// Claim the first handler
			// dataPriv.set( this, "focus", ... )
			// dataPriv.set( this, "blur", ... )
			leverageNative( this, type, true );

			if ( document.documentMode ) {

				// Support: IE 9 - 11+
				// We use the same native handler for focusin & focus (and focusout & blur)
				// so we need to coordinate setup & teardown parts between those events.
				// Use `delegateType` as the key as `type` is already used by `leverageNative`.
				attaches = dataPriv.get( this, delegateType );
				if ( !attaches ) {
					this.addEventListener( delegateType, focusMappedHandler );
				}
				dataPriv.set( this, delegateType, ( attaches || 0 ) + 1 );
			} else {

				// Return false to allow normal processing in the caller
				return false;
			}
		},
		trigger: function() {

			// Force setup before trigger
			leverageNative( this, type );

			// Return non-false to allow normal event-path propagation
			return true;
		},

		teardown: function() {
			var attaches;

			if ( document.documentMode ) {
				attaches = dataPriv.get( this, delegateType ) - 1;
				if ( !attaches ) {
					this.removeEventListener( delegateType, focusMappedHandler );
					dataPriv.remove( this, delegateType );
				} else {
					dataPriv.set( this, delegateType, attaches );
				}
			} else {

				// Return false to indicate standard teardown should be applied
				return false;
			}
		},

		// Suppress native focus or blur if we're currently inside
		// a leveraged native-event stack
		_default: function( event ) {
			return dataPriv.get( event.target, type );
		},

		delegateType: delegateType
	};

	// Support: Firefox <=44
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
	//
	// Support: IE 9 - 11+
	// To preserve relative focusin/focus & focusout/blur event order guaranteed on the 3.x branch,
	// attach a single handler for both events in IE.
	jQuery.event.special[ delegateType ] = {
		setup: function() {

			// Handle: regular nodes (via `this.ownerDocument`), window
			// (via `this.document`) & document (via `this`).
			var doc = this.ownerDocument || this.document || this,
				dataHolder = document.documentMode ? this : doc,
				attaches = dataPriv.get( dataHolder, delegateType );

			// Support: IE 9 - 11+
			// We use the same native handler for focusin & focus (and focusout & blur)
			// so we need to coordinate setup & teardown parts between those events.
			// Use `delegateType` as the key as `type` is already used by `leverageNative`.
			if ( !attaches ) {
				if ( document.documentMode ) {
					this.addEventListener( delegateType, focusMappedHandler );
				} else {
					doc.addEventListener( type, focusMappedHandler, true );
				}
			}
			dataPriv.set( dataHolder, delegateType, ( attaches || 0 ) + 1 );
		},
		teardown: function() {
			var doc = this.ownerDocument || this.document || this,
				dataHolder = document.documentMode ? this : doc,
				attaches = dataPriv.get( dataHolder, delegateType ) - 1;

			if ( !attaches ) {
				if ( document.documentMode ) {
					this.removeEventListener( delegateType, focusMappedHandler );
				} else {
					doc.removeEventListener( type, focusMappedHandler, true );
				}
				dataPriv.remove( dataHolder, delegateType );
			} else {
				dataPriv.set( dataHolder, delegateType, attaches );
			}
		}
	};
} );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,

	rcleanScript = /^\s*<!\[CDATA\[|\]\]>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.get( src );
		events = pdataOld.events;

		if ( events ) {
			dataPriv.remove( dest, "handle events" );

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = flat( args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (trac-8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Re-enable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl && !node.noModule ) {
								jQuery._evalUrl( node.src, {
									nonce: node.nonce || node.getAttribute( "nonce" )
								}, doc );
							}
						} else {

							// Unwrap a CDATA section containing script contents. This shouldn't be
							// needed as in XML documents they're already not visible when
							// inspecting element contents and in HTML documents they have no
							// meaning but we're preserving that logic for backwards compatibility.
							// This will be removed completely in 4.0. See gh-4904.
							DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && isAttached( node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html;
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = isAttached( elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew jQuery#find here for performance reasons:
			// https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var rcustomProp = /^--/;


var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (trac-15098, trac-14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var swap = function( elem, options, callback ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.call( elem );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		// Support: Chrome <=64
		// Don't get tricked when zoom affects offsetWidth (gh-4029)
		div.style.position = "absolute";
		scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableTrDimensionsVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (trac-8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		},

		// Support: IE 9 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Behavior in IE 9 is more subtle than in newer versions & it passes
		// some versions of this test; make sure not to make it pass there!
		//
		// Support: Firefox 70+
		// Only Firefox includes border widths
		// in computed dimensions. (gh-4529)
		reliableTrDimensions: function() {
			var table, tr, trChild, trStyle;
			if ( reliableTrDimensionsVal == null ) {
				table = document.createElement( "table" );
				tr = document.createElement( "tr" );
				trChild = document.createElement( "div" );

				table.style.cssText = "position:absolute;left:-11111px;border-collapse:separate";
				tr.style.cssText = "box-sizing:content-box;border:1px solid";

				// Support: Chrome 86+
				// Height set through cssText does not get applied.
				// Computed height then comes back as 0.
				tr.style.height = "1px";
				trChild.style.height = "9px";

				// Support: Android 8 Chrome 86+
				// In our bodyBackground.html iframe,
				// display for all div elements is set to "inline",
				// which causes a problem only in Android 8 Chrome 86.
				// Ensuring the div is `display: block`
				// gets around this issue.
				trChild.style.display = "block";

				documentElement
					.appendChild( table )
					.appendChild( tr )
					.appendChild( trChild );

				trStyle = window.getComputedStyle( tr );
				reliableTrDimensionsVal = ( parseInt( trStyle.height, 10 ) +
					parseInt( trStyle.borderTopWidth, 10 ) +
					parseInt( trStyle.borderBottomWidth, 10 ) ) === tr.offsetHeight;

				documentElement.removeChild( table );
			}
			return reliableTrDimensionsVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		isCustomProp = rcustomProp.test( name ),

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, trac-12537)
	//   .css('--customProperty) (gh-3144)
	if ( computed ) {

		// Support: IE <=9 - 11+
		// IE only supports `"float"` in `getPropertyValue`; in computed styles
		// it's only available as `"cssFloat"`. We no longer modify properties
		// sent to `.css()` apart from camelCasing, so we need to check both.
		// Normally, this would create difference in behavior: if
		// `getPropertyValue` returns an empty string, the value returned
		// by `.css()` would be `undefined`. This is usually the case for
		// disconnected elements. However, in IE even disconnected elements
		// with no styles return `"none"` for `getPropertyValue( "float" )`
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( isCustomProp && ret ) {

			// Support: Firefox 105+, Chrome <=105+
			// Spec requires trimming whitespace for custom properties (gh-4926).
			// Firefox only trims leading whitespace. Chrome just collapses
			// both leading & trailing whitespace to a single space.
			//
			// Fall back to `undefined` if empty string returned.
			// This collapses a missing definition with property defined
			// and set to an empty string but there's no standard API
			// allowing us to differentiate them without a performance penalty
			// and returning `undefined` aligns with older jQuery.
			//
			// rtrimCSS treats U+000D CARRIAGE RETURN and U+000C FORM FEED
			// as whitespace while CSS does not, but this is not a problem
			// because CSS preprocessing replaces them with U+000A LINE FEED
			// (which *is* CSS whitespace)
			// https://www.w3.org/TR/css-syntax-3/#input-preprocessing
			ret = ret.replace( rtrimCSS, "$1" ) || undefined;
		}

		if ( ret === "" && !isAttached( elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style,
	vendorProps = {};

// Return a vendor-prefixed property or undefined
function vendorPropName( name ) {

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a potentially-mapped jQuery.cssProps or vendor prefixed property
function finalPropName( name ) {
	var final = jQuery.cssProps[ name ] || vendorProps[ name ];

	if ( final ) {
		return final;
	}
	if ( name in emptyStyle ) {
		return name;
	}
	return vendorProps[ name ] = vendorPropName( name ) || name;
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	};

function setPositiveNumber( _elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0,
		marginDelta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		// Count margin delta separately to only add it after scroll gutter adjustment.
		// This is needed to make negative margins work with `outerHeight( true )` (gh-3982).
		if ( box === "margin" ) {
			marginDelta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5

		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
		// Use an explicit zero to avoid NaN (gh-3964)
		) ) || 0;
	}

	return delta + marginDelta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),

		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
		// Fake content-box until we know it's needed to know the true value.
		boxSizingNeeded = !support.boxSizingReliable() || extra,
		isBorderBox = boxSizingNeeded &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox,

		val = curCSS( elem, dimension, styles ),
		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}


	// Support: IE 9 - 11 only
	// Use offsetWidth/offsetHeight for when box sizing is unreliable.
	// In those cases, the computed value can be trusted to be border-box.
	if ( ( !support.boxSizingReliable() && isBorderBox ||

		// Support: IE 10 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Interestingly, in some cases IE 9 doesn't suffer from this issue.
		!support.reliableTrDimensions() && nodeName( elem, "tr" ) ||

		// Fall back to offsetWidth/offsetHeight when value is "auto"
		// This happens for inline elements with no explicit setting (gh-3571)
		val === "auto" ||

		// Support: Android <=4.1 - 4.3 only
		// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&

		// Make sure the element is visible & connected
		elem.getClientRects().length ) {

		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
		// retrieved value as a content box dimension.
		valueIsBorderBox = offsetProp in elem;
		if ( valueIsBorderBox ) {
			val = elem[ offsetProp ];
		}
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		animationIterationCount: true,
		aspectRatio: true,
		borderImageSlice: true,
		columnCount: true,
		flexGrow: true,
		flexShrink: true,
		fontWeight: true,
		gridArea: true,
		gridColumn: true,
		gridColumnEnd: true,
		gridColumnStart: true,
		gridRow: true,
		gridRowEnd: true,
		gridRowStart: true,
		lineHeight: true,
		opacity: true,
		order: true,
		orphans: true,
		scale: true,
		widows: true,
		zIndex: true,
		zoom: true,

		// SVG-related
		fillOpacity: true,
		floodOpacity: true,
		stopOpacity: true,
		strokeMiterlimit: true,
		strokeOpacity: true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (trac-7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug trac-9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (trac-7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
			// "px" to a few hardcoded values.
			if ( type === "number" && !isCustomProp ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( _i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
					swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, dimension, extra );
					} ) :
					getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),

				// Only read styles.position if the test has a chance to fail
				// to avoid forcing a reflow.
				scrollboxSizeBuggy = !support.scrollboxSize() &&
					styles.position === "absolute",

				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
				boxSizingNeeded = scrollboxSizeBuggy || extra,
				isBorderBox = boxSizingNeeded &&
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra ?
					boxModelAdjustment(
						elem,
						dimension,
						extra,
						isBorderBox,
						styles
					) :
					0;

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && scrollboxSizeBuggy ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 && (
				jQuery.cssHooks[ tween.prop ] ||
					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

				/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (trac-12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
					animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};

		doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( _i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// Use proper attribute retrieval (trac-12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classNames, cur, curValue, className, i, finalValue;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classNames = classesToArray( value );

		if ( classNames.length ) {
			return this.each( function() {
				curValue = getClass( this );
				cur = this.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					for ( i = 0; i < classNames.length; i++ ) {
						className = classNames[ i ];
						if ( cur.indexOf( " " + className + " " ) < 0 ) {
							cur += className + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						this.setAttribute( "class", finalValue );
					}
				}
			} );
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, cur, curValue, className, i, finalValue;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classNames = classesToArray( value );

		if ( classNames.length ) {
			return this.each( function() {
				curValue = getClass( this );

				// This expression is here for better compressibility (see addClass)
				cur = this.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					for ( i = 0; i < classNames.length; i++ ) {
						className = classNames[ i ];

						// Remove *all* instances
						while ( cur.indexOf( " " + className + " " ) > -1 ) {
							cur = cur.replace( " " + className + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						this.setAttribute( "class", finalValue );
					}
				}
			} );
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var classNames, className, i, self,
			type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		classNames = classesToArray( value );

		return this.each( function() {
			if ( isValidValue ) {

				// Toggle individual class names
				self = jQuery( this );

				for ( i = 0; i < classNames.length; i++ ) {
					className = classNames[ i ];

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (trac-14686, trac-14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (trac-2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion
var location = window.location;

var nonce = { guid: Date.now() };

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, parserErrorElem;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {}

	parserErrorElem = xml && xml.getElementsByTagName( "parsererror" )[ 0 ];
	if ( !xml || parserErrorElem ) {
		jQuery.error( "Invalid XML: " + (
			parserErrorElem ?
				jQuery.map( parserErrorElem.childNodes, function( el ) {
					return el.textContent;
				} ).join( "\n" ) :
				data
		) );
	}
	return xml;
};


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (trac-9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (trac-9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || Object.create( null ) )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (trac-6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	if ( a == null ) {
		return "";
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} ).filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} ).map( function( _i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// trac-7653, trac-8125, trac-8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (trac-10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );

originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes trac-9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
										.concat( match[ 2 ] );
							}
						}
						match = responseHeaders[ key.toLowerCase() + " " ];
					}
					return match == null ? null : match.join( ", " );
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (trac-10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket trac-12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (trac-15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// trac-9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce.guid++ ) +
					uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Use a noop converter for missing script but not if jsonp
			if ( !isSuccess &&
				jQuery.inArray( "script", s.dataTypes ) > -1 &&
				jQuery.inArray( "json", s.dataTypes ) < 0 ) {
				s.converters[ "text script" ] = function() {};
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( _i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );

jQuery.ajaxPrefilter( function( s ) {
	var i;
	for ( i in s.headers ) {
		if ( i.toLowerCase() === "content-type" ) {
			s.contentType = s.headers[ i ] || "";
		}
	}
} );


jQuery._evalUrl = function( url, options, doc ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (trac-11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,

		// Only evaluate the response if it is successful (gh-4126)
		// dataFilter is not invoked for failure responses, so using it instead
		// of the default converter is kludgy but it works.
		converters: {
			"text script": function() {}
		},
		dataFilter: function( response ) {
			jQuery.globalEval( response, options, doc );
		}
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// trac-1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see trac-8605, trac-14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// trac-14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain or forced-by-attrs requests
	if ( s.crossDomain || s.scriptAttrs ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" )
					.attr( s.scriptAttrs || {} )
					.prop( { charset: s.scriptCharset, src: s.url } )
					.on( "load error", callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					} );

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( _i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( {
		padding: "inner" + name,
		content: type,
		"": "outer" + name
	}, function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( _i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},

	hover: function( fnOver, fnOut ) {
		return this
			.on( "mouseenter", fnOver )
			.on( "mouseleave", fnOut || fnOver );
	}
} );

jQuery.each(
	( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( _i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	}
);




// Support: Android <=4.0 only
// Make sure we trim BOM and NBSP
// Require that the "whitespace run" starts from a non-whitespace
// to avoid O(N^2) behavior when the engine would try matching "\s+$" at each space position.
var rtrim = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};

jQuery.trim = function( text ) {
	return text == null ?
		"" :
		( text + "" ).replace( rtrim, "$1" );
};



// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( true ) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
		return jQuery;
	}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (trac-7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (trac-13566)
if ( typeof noGlobal === "undefined" ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );


/***/ }),

/***/ "./scss/style.scss":
/*!*************************!*\
  !*** ./scss/style.scss ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "../node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "../node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "../node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "../node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_node_modules_sass_loader_dist_cjs_js_node_modules_import_glob_loader_index_js_style_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].use[1]!../../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!../../node_modules/sass-loader/dist/cjs.js!../../node_modules/import-glob-loader/index.js!./style.scss */ "../node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].use[1]!../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/import-glob-loader/index.js!./scss/style.scss");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_node_modules_sass_loader_dist_cjs_js_node_modules_import_glob_loader_index_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_node_modules_sass_loader_dist_cjs_js_node_modules_import_glob_loader_index_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_node_modules_sass_loader_dist_cjs_js_node_modules_import_glob_loader_index_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_1_use_2_node_modules_sass_loader_dist_cjs_js_node_modules_import_glob_loader_index_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "../node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!*********************************************************************!*\
  !*** ../node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "../node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!***********************************************************************!*\
  !*** ../node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \***********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \***********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "../node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!****************************************************************!*\
  !*** ../node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \****************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "../node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!**********************************************************************!*\
  !*** ../node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./img/channel1.png":
/*!**************************!*\
  !*** ./img/channel1.png ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "img/channel1.png'";

/***/ }),

/***/ "./img/message1.png":
/*!**************************!*\
  !*** ./img/message1.png ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "img/message1.png'";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl + "../";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*********************!*\
  !*** ./js/index.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _scss_style_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scss/style.scss */ "./scss/style.scss");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ui_load__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ui/load */ "./js/ui/load.js");
/* harmony import */ var _ui_load__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_ui_load__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _ui_utility__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ui/utility */ "./js/ui/utility.js");
/* harmony import */ var _ui_utility__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_ui_utility__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _ui_preload__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ui/preload */ "./js/ui/preload.js");
/* harmony import */ var _ui_preload__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_ui_preload__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _ui_toggle__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ui/toggle */ "./js/ui/toggle.js");
/* harmony import */ var _ui_toggle__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_ui_toggle__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _ui_scroll__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ui/scroll */ "./js/ui/scroll.js");
/* harmony import */ var _ui_scroll__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_ui_scroll__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _ui_flash__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ui/flash */ "./js/ui/flash.js");
/* harmony import */ var _ui_flash__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_ui_flash__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _ui_confirm__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ui/confirm */ "./js/ui/confirm.js");
/* harmony import */ var _ui_confirm__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_ui_confirm__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _ui_modal__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ui/modal */ "./js/ui/modal.js");
/* harmony import */ var _ui_modal__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_ui_modal__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _ui_form__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ui/form */ "./js/ui/form.js");
/* harmony import */ var _ui_form__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_ui_form__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _ui_file__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./ui/file */ "./js/ui/file.js");
/* harmony import */ var _ui_file__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_ui_file__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var _ui_banner__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ui/banner */ "./js/ui/banner.js");
/* harmony import */ var _ui_banner__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_ui_banner__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var _ui_slide__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./ui/slide */ "./js/ui/slide.js");
/* harmony import */ var _ui_slide__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(_ui_slide__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var _ajax__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./ajax */ "./js/ajax.js");
/* harmony import */ var _ajax__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(_ajax__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var _webrtc__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./webrtc */ "./js/webrtc.js");
/* harmony import */ var _webrtc__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(_webrtc__WEBPACK_IMPORTED_MODULE_15__);
// SCSS / CSS


// ajax.jsで使用するjQueryをimport


// JavaScript














})();

/******/ })()
;
//# sourceMappingURL=main.js.map