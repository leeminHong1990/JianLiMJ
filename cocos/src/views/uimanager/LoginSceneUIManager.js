var LoginSceneUIManager = UIManagerBase.extend({
    onCreate: function () {
        this.login_ui = new LoginUI();

        this.ui_list.push(this.login_ui);
    }
});