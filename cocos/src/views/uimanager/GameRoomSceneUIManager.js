var GameRoomSceneUIManager = UIManagerBase.extend({
    onCreate:function(){
    	this.gameroom_ui = new GameRoomUI();
        this.gameroomprepare_ui = new GameRoomPrepareUI();
        this.gameroominfo_ui = new GameRoomInfoUI();
    	this.audiorecord_ui = new AudioRecordUI();
        this.settlement_ui = new SettlementUI();
        this.result_ui = new ResultUI();
        this.help_ui = new HelpUI();
        this.gameconfig_ui = new GameConfigUI();
        this.gameplayerinfo_ui = new GamePlayerInfoUI();
        this.communicate_ui = new CommunicateUI();
        this.share_ui = new ShareUI();
    	this.applyclose_ui = new ApplyCloseUI();

		this.ui_list.push(this.gameroom_ui);
        this.ui_list.push(this.gameroomprepare_ui);
        this.ui_list.push(this.gameroominfo_ui);
		this.ui_list.push(this.audiorecord_ui);
        this.ui_list.push(this.settlement_ui);
        this.ui_list.push(this.result_ui);
        this.ui_list.push(this.help_ui);
        this.ui_list.push(this.gameconfig_ui);
        this.ui_list.push(this.gameplayerinfo_ui);
        this.ui_list.push(this.communicate_ui);
        this.ui_list.push(this.share_ui);
		this.ui_list.push(this.applyclose_ui);
    }
});