const TGL_TARGET_LIST = {
    // ヘッダーメニュー開閉のフック
    "l-header__mainmenu-toggler" : ["#l-header__mainmenu", "#l-header__mainmenu-opener", "#l-header__mainmenu-closer"],
    // モーダルを枠外を押下して閉める際のフック
    "overlay" : [ 
        ".modal", ".modal-opener", ".modal-closer",
        ".p-slide-wrap",
        "#body" 
    ],
    "phone-operator-opener" : ["#phone-operator"]
};

const OVERLAY = document.getElementById("overlay");
const BODY = document.getElementById("body");