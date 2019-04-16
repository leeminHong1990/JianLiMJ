var GameHallSceneUIManager = UIManagerBase.extend({
    onCreate: function () {
        this.gamehall_ui = new GameHallUI();
        this.createroom_ui = new CreateRoomUI();
        this.joinroom_ui = new JoinRoomUI();
        this.help_ui = new HelpUI();
        this.feedback_ui = new FeedBackUI();
        this.playerinfo_ui = new PlayerInfoUI();
        this.record_ui = new RecordUI();
        this.config_ui = new ConfigUI();

        this.ui_list.push(this.gamehall_ui);
        this.ui_list.push(this.createroom_ui);
        this.ui_list.push(this.joinroom_ui);
        this.ui_list.push(this.help_ui);
        this.ui_list.push(this.feedback_ui);
        this.ui_list.push(this.playerinfo_ui);
        this.ui_list.push(this.record_ui);
        this.ui_list.push(this.config_ui);
    }
});