// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var CreateRoomUI = UIBase.extend({
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/CreateRoomUI.json";
    },

    initUI: function () {
        this.gameRound = 8;   // 0:8局  1:16局
        this.roomMode = 0;  //1 经典模式 （能胡点炮 能接热冲）2 自摸（只能自摸 不能胡热冲）3 抓马只能自摸 

        this.createroom_panel = this.rootUINode.getChildByName("createroom_panel");
        this.initCreateRoomPanel();

        this.initCreateRoom();
    },

    initCreateRoomPanel: function () {
        var self = this;
        var return_btn = ccui.helper.seekWidgetByName(this.createroom_panel, "return_btn");

        function return_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.hide()
            }
        }

        return_btn.addTouchEventListener(return_btn_event);

        //局数
        var round_chx_1 = ccui.helper.seekWidgetByName(this.createroom_panel, "round_chx_1");
        var round_chx_2 = ccui.helper.seekWidgetByName(this.createroom_panel, "round_chx_2");
        this.game_round_chx_list = [round_chx_1, round_chx_2];
        function game_round_event(sender, eventType) {
            if (eventType === ccui.CheckBox.EVENT_SELECTED || eventType === ccui.CheckBox.EVENT_UNSELECTED) {
                for (var i = 0; i < self.game_round_chx_list.length; i++) {
                    if (sender !== self.game_round_chx_list[i]) {
                        self.game_round_chx_list[i].setSelected(false);
                        self.game_round_chx_list[i].setTouchEnabled(true)
                    } else {
                        if (i === 0) {
                            self.gameRound = 8;
                        } else {
                            self.gameRound = 16;
                        }
                        sender.setSelected(true);
                        sender.setTouchEnabled(false);
                    }
                }
            }
        }

        round_chx_1.addTouchEventListener(game_round_event);
        round_chx_2.addTouchEventListener(game_round_event);
        this.game_round_chx_list[0].setTouchEnabled(false);

        //是否普通放炮胡
        var mode_chx_1 = ccui.helper.seekWidgetByName(this.createroom_panel, "mode_chx_1");
        var mode_chx_2 = ccui.helper.seekWidgetByName(this.createroom_panel, "mode_chx_2");
        var mode_chx_3 = ccui.helper.seekWidgetByName(this.createroom_panel, "mode_chx_3");
        this.room_mode_chx_list = [mode_chx_1, mode_chx_2, mode_chx_3];

        function room_mode_chx_event(sender, eventType) {
            if (eventType === ccui.CheckBox.EVENT_SELECTED) {
                for (var i = 0; i < self.room_mode_chx_list.length; i++) {
                    if (sender !== self.room_mode_chx_list[i]) {
                        self.room_mode_chx_list[i].setSelected(false);
                        self.room_mode_chx_list[i].setTouchEnabled(true)
                    } else {
                        self.roomMode = i;
                        sender.setSelected(true);
                        sender.setTouchEnabled(false);
                    }
                }
                cc.log("roomMode:", self.roomMode);
            }
        }

        mode_chx_1.addTouchEventListener(room_mode_chx_event);
        mode_chx_2.addTouchEventListener(room_mode_chx_event);
        mode_chx_3.addTouchEventListener(room_mode_chx_event);
        this.room_mode_chx_list[0].setTouchEnabled(false);

        this.createroom_panel.getChildByName("game_num_label1").setString("（    X4或     X40）");
        this.createroom_panel.getChildByName("game_num_label2").setString("（    X8或     X80）");
    },

    initCreateRoom: function () { //TODO 创建房间
        var self = this;
        var create_btn = ccui.helper.seekWidgetByName(this.createroom_panel, "create_btn");

        function create_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                cutil.lock_ui();

                cc.log("房间局数：" + self.gameRound + ",房间模式：" + self.roomMode);
                h1global.entityManager.player().createRoom(self.gameRound, self.roomMode, 0);
                self.hide()
            }
        }
        create_btn.addTouchEventListener(create_btn_event);
    }
});