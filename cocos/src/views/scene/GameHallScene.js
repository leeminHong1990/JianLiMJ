// cc.loader.loadJs("src/views/uimanager/LoginSceneUIManager.js")

var GameHallScene = cc.Scene.extend({
    className: "GameHallScene",
    onEnter: function () {
        this._super();
        this.loadUIManager();
        cutil.unlock_ui();

        if (cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.stopMusic();
        }
        cc.audioEngine.playMusic("res/sound/music/sound_bgm.mp3", true);
    },

    loadUIManager: function () {
        var curUIManager = new GameHallSceneUIManager();
        curUIManager.setAnchorPoint(0, 0);
        curUIManager.setPosition(0, 0);
        this.addChild(curUIManager, const_val.curUIMgrZOrder);
        h1global.curUIMgr = curUIManager;

        // curUIManager.gamehall_ui.show(function(){
        //     if(h1global.reconnect){
        //         h1global.reconnect = false;
        //         h1global.runScene(new GameRoomScene());
        //     }
        // });
        curUIManager.gamehall_ui.show();

        if (!onhookMgr) {
            onhookMgr = new OnHookManager();
        }

        onhookMgr.init(this);
        this.scheduleUpdateWithPriority(0);
    },

    update: function (delta) {
        onhookMgr.update(delta);
    }
});
