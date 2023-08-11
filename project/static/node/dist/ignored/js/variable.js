const TGL_TARGET_LIST = {
    "l-header__mainmenu-toggler" : ["#l-header__mainmenu", "#l-header__mainmenu-opener", "#l-header__mainmenu-closer"],

    // project/entry funcセクション
    "p-entry-func__modal-opener--channel" : ["#p-entry-func__modal--channel", "#p-entry-func__modal-closer--channel", "#modal-overlay", "#body"],
    "p-entry-func__modal-opener--meeting" : ["#p-entry-func__modal--meeting", "#p-entry-func__modal-closer--meeting", "#modal-overlay", "#body"],
    "p-entry-func__modal-opener--message" : ["#p-entry-func__modal--message", "#p-entry-func__modal-closer--message", "#modal-overlay", "#body"],
    "p-entry-func__modal-closer--channel" : ["#p-entry-func__modal--channel", "#p-entry-func__modal-opener--channel", "#modal-overlay", "#body"],
    "p-entry-func__modal-closer--meeting" : ["#p-entry-func__modal--meeting", "#p-entry-func__modal-opener--meeting", "#modal-overlay", "#body"],
    "p-entry-func__modal-closer--message" : ["#p-entry-func__modal--message", "#p-entry-func__modal-opener--message", "#modal-overlay", "#body"],

    "p-index__modal-opener--new-server" : ["#p-index__modal--new-server", "#p-index__modal-closer--new-server", "#modal-overlay", "#body"],
    "p-index__modal-closer--new-server" : ["#p-index__modal--new-server", "#p-index__modal-opener--new-server", "#modal-overlay", "#body"],

    "modal-overlay" : [ "#p-entry-func__modal--channel", "#p-entry-func__modal-opener--channel", "#p-entry-func__modal-closer--channel",
                        "#p-entry-func__modal--meeting", "#p-entry-func__modal-opener--meeting", "#p-entry-func__modal-closer--meeting",
                        "#p-entry-func__modal--message", "#p-entry-func__modal-opener--message", "#p-entry-func__modal-closer--message",
                        "#p-index__modal--new-server", "#p-index__modal-opener--new-server", "#p-index__modal-closer--new-server",
                        "#body" ],
};