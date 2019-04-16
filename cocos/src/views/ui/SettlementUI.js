// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
var SettlementUI = UIBase.extend({
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/SettlementUI.json";
    },
    initUI: function () {
        var player = h1global.entityManager.player();
        var self = this;
        self.setLocalZOrder(200);
        var confirm_btn = this.rootUINode.getChildByName("confirm_btn");

        function confirm_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                // TEST:
                // self.hide();
                // h1global.curUIMgr.gameroomprepare_ui.show();
                // h1global.curUIMgr.gameroom_ui.hide();
                // return;
                self.hide();
                // h1global.curUIMgr.gameroom_ui.hide();
                player.curGameRoom.updatePlayerState(player.serverSitNum, 1);
                // player.curGameRoom.curRound = player.curGameRoom.curRound + 1;
                h1global.curUIMgr.gameroomprepare_ui.show();
                h1global.curUIMgr.gameroom_ui.hide();
                player.roundEndCallback();
            }
        }

        confirm_btn.addTouchEventListener(confirm_btn_event);
        this.kongTilesList = [[], [], [], []];

        var settlement_panel = this.rootUINode.getChildByName("settlement_panel");
        var settlement_bg_panel = this.rootUINode.getChildByName("settlement_bg_panel");
        var show_btn = this.rootUINode.getChildByName("show_btn");
        var hide_btn = this.rootUINode.getChildByName("hide_btn");
        show_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                show_btn.setVisible(false);
                hide_btn.setVisible(true);
                settlement_panel.setVisible(true);
                settlement_bg_panel.setVisible(true);
            }
        });
        show_btn.setVisible(false);
        hide_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                show_btn.setVisible(true);
                hide_btn.setVisible(false);
                settlement_panel.setVisible(false);
                settlement_bg_panel.setVisible(false);
            }
        });
    },

    show_by_info: function (roundRoomInfo, confirm_btn_func) {
        cc.log("结算===============>:");
        cc.log("roundRoomInfo", roundRoomInfo);
        var self = this;
        this.show(function () {
          
            self.player_panels = [];
            self.player_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("player_info_panel0"));
            self.player_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("player_info_panel1"));
            self.player_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("player_info_panel2"));
            self.player_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("player_info_panel3"));
            var playerInfoList = roundRoomInfo["player_info_list"];
            for (var i = 0; i < playerInfoList.length; i++) {
                var roundPlayerInfo = playerInfoList[i];
                self.update_player_info(roundPlayerInfo["idx"]);
                self.update_score(roundPlayerInfo["idx"], roundPlayerInfo["score"]);
            }
            // for (var i = 0; i < roundRoomInfo["player_info_list"].length; i++) {
            //     self.update_player_hand_tiles(i, roundRoomInfo["player_info_list"][i]["tiles"]);
            //     self.update_player_up_tiles(i, roundRoomInfo["player_info_list"][i]["concealed_kong"]);
            // }

            if (roundRoomInfo["win_idx_list"][0] >= 0) {
                var serverSitNum = roundRoomInfo["win_idx_list"][0];
                self.update_player_hand_tiles(serverSitNum, roundRoomInfo["player_info_list"][serverSitNum]["tiles"]);
                self.update_player_up_tiles(serverSitNum, roundRoomInfo["player_info_list"][serverSitNum]["concealed_kong"]);
            } else {
                self.rootUINode.getChildByName("settlement_panel").getChildByName("player_tile_panel").setVisible(false)
            }

            self.show_title(roundRoomInfo["win_idx_list"]);
            // self.show_desc(roundRoomInfo["result"][0], roundRoomInfo["win_idx_list"]);

            if (roundRoomInfo["win_idx_list"][0] >= 0) {
                for (var i = 0; i < roundRoomInfo["win_idx_list"].length; i++) {
                    self.update_player_win(roundRoomInfo["win_idx_list"][i], roundRoomInfo["op_list"][i]);
                }
            }

            if (confirm_btn_func) {
                self.rootUINode.getChildByName("confirm_btn").addTouchEventListener(function (sender, eventType) {
                    if (eventType === ccui.Widget.TOUCH_ENDED) {
                        self.hide();
                        confirm_btn_func();
                    }
                });
            }
        });
    },

    show_title: function (win_idx_list) {

        var round_label = this.rootUINode.getChildByName("settlement_panel").getChildByName("info_panel").getChildByName("round_label");
        var room_mode = this.rootUINode.getChildByName("settlement_panel").getChildByName("info_panel").getChildByName("room_mode");
        round_label.setString("局数：第"+h1global.entityManager.player().curGameRoom.curRound.toString()+"局");
        if(h1global.entityManager.player().curGameRoom.roomMode==0){
            room_mode.setString("房间模式：经典模式");
             cc.log("金典模式1111111");
        }else if(h1global.entityManager.player().curGameRoom.roomMode==1){
            room_mode.setString("房间模式：自摸模式");
            cc.log("自摸1111111111111111");
        } else {
           room_mode.setString("房间模式：抓马模式");
           cc.log("抓马111111111111111");
        }

        cc.log(win_idx_list);
        var title_img = this.rootUINode.getChildByName("settlement_panel").getChildByName("title_img");
        title_img.ignoreContentAdaptWithSize(true);
        var win_sum = 0;
        for (var i = 0; i < win_idx_list.length; i++) {
            if (win_idx_list[i] >= 0) {
                win_sum++;
            }
        }
        if (win_sum === 0) {
            title_img.loadTexture("res/ui/SettlementUI/dogfull_title.png")
        } else {
            if (win_idx_list.indexOf(h1global.entityManager.player().serverSitNum) >= 0) {
                //shengli
                title_img.loadTexture("res/ui/SettlementUI/win_title.png")
            } else {
                title_img.loadTexture("res/ui/SettlementUI/fail_title.png")
            }
        }
        // cc.log(result, win_idx_list);
        // var title_img = this.rootUINode.getChildByName("settlement_panel").getChildByName("title_img");
        // title_img.ignoreContentAdaptWithSize(true);
        // var win_sum = 0;
        // for (var i = 0; i < win_idx_list.length; i++) {
        //     if (win_idx_list[i] >= 0) {
        //         win_sum++;
        //     }
        // }
        // if (win_sum === 0) {
        //     title_img.loadTexture("res/ui/SettlementUI/dogfull_title.png")
        // } else {
        //     if (win_idx_list.indexOf(h1global.entityManager.player().serverSitNum) >= 0) {
        //         //shengli
        //         title_img.loadTexture("res/ui/SettlementUI/win_title.png")
        //     } else {
        //         title_img.loadTexture("res/ui/SettlementUI/fail_title.png")
        //     }
        //     for (var i = 0; i < win_idx_list.length; i++) {
        //         // if (win_idx_list[i] === h1global.entityManager.player().serverSitNum) {
        //         //     title_img.loadTexture("res/ui/SettlementUI/win_title.png")
        //         // } else {
        //         //     title_img.loadTexture("res/ui/SettlementUI/fail_title.png")
        //         // }
        //         cc.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        //         cc.log("result length :  " + result.length);
        //         var item_win_panel = this.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel" + (win_idx_list[i] + 1));
        //         // var hu_list = [];
        //         // for (var j = 0; j < result.length; j++) {
        //         //     if (result[j] === 1) {
        //         //         hu_list.push(j);
        //         //         cc.log("胡牌类型：" + j);
        //         //     }
        //         // }
        //         // cc.log("胡牌类型的个数：" + hu_list.length);
        //         // for (var k = 0; k < hu_list.length; k++) {
        //         //     cc.log();
        //         //     var item_card_type_img = item_win_panel.getChildByName("item_card_type_img" + (k + 1));
        //         //     item_card_type_img.ignoreContentAdaptWithSize(true);
        //         //     item_card_type_img.setVisible(true);
        //         //     item_card_type_img.loadTexture("res/ui/SettlementUI/win_type_" + String(hu_list[k]) + ".png");
        //         // }
        //         var win_count = 0;
        //         for (var j = 0; j < result[i].length; j++) {
        //             if (result[i][j] === 1) {
        //                 win_count++;
        //                 cc.log("win_count :" + win_count);
        //                 var item_card_type_img = item_win_panel.getChildByName("item_card_type_img" + win_count);
        //                 item_card_type_img.ignoreContentAdaptWithSize(true);
        //                 item_card_type_img.setVisible(true);
        //                 cc.log("result[i][j] :" + result[i][j]);
        //                 item_card_type_img.loadTexture("res/ui/SettlementUI/win_type_" + String(j) + ".png");
        //             }

        //         }
        //     }
        // }
    },

    // show_win_img: function (result) {
    //     var player_tile_panel = this.rootUINode.getChildByName("settlement_panel");
    //     var lis = [];
    //     for (var i = 0; i < result.length; i++) {
    //
    //     }
    //
    //     for (var i = 0; i < 6; i++) {
    //         var win_bg = player_tile_panel.getChildByName("win_" + String(i + 1));
    //         var win = win_bg.getChildByName("win_img");
    //         win.ignoreContentAdaptWithSize(true);
    //         if (lis[i] && lis[i] > 0) {
    //             cc.log(lis[i]);
    //             win.loadTexture("res/ui/SettlementUI/win_type_" + String(lis[i]) + ".png");
    //             win_bg.setVisible(true)
    //         }
    //     }
    // },

    show_desc: function (result, win_idx_list) {
        // var player = h1global.entityManager.player();
        // var Text = this.rootUINode.getChildByName("settlement_panel").getChildByName("info_panel").getChildByName("Text");
        // var str = "本局底分：1分		本局老庄：" + String(player.curGameRoom.curOldDealNum);
        //
        // var resultStr = "";
        // var mutipleNum = player.curGameRoom.curOldDealNum;
        // var mutipleList = [10, 10, 10, 10, 10, 1, 3, 4, 3, 1, 1, 2, 3, 2, 1, 1, 0];
        // var isNormalWin = false;
        // for (var i = 0; i < result.length; i++) {
        //     if (result[i] && result[i] > 0) {
        //         if (i <= 4) {
        //             resultStr = "		本局清牌";
        //             break
        //         }
        //         //十风
        //         if (i === 5) {
        //             isNormalWin = true;
        //             mutipleNum += result[i]
        //         }
        //         //清一色 + 7对
        //         if (i === 6 && result.length > 8 && result[8] > 0) {
        //             resultStr = "		本局清牌";
        //             break
        //         }
        //         isNormalWin = true;
        //         mutipleNum += result[i] * mutipleList[i]
        //     }
        // }
        // if (isNormalWin) {
        //     if (win_idx_list[0] >= 0) {
        //         if (player.curGameRoom.dealerIdx === win_idx_list[0]) {
        //             resultStr = "		庄家赢" + String(mutipleNum) + "番"
        //         } else {
        //             resultStr = "		闲家赢" + String(mutipleNum) + "番"
        //         }
        //     }
        // }
        //
        // Text.setString(str + resultStr)
    },

    update_player_hand_tiles:function(serverSitNum, tileList){
        if(!this.is_show) {return;}
        var player = h1global.entityManager.player();
        var cur_player_tile_panel = this.rootUINode.getChildByName("settlement_panel").getChildByName("player_tile_panel").getChildByName("player_hand_panel");
        if(!cur_player_tile_panel){
            return;
        }
        var mahjong_hand_str = "";
        // var mahjong_up_str = "";
        // var mahjong_down_str = "";
        // var mahjong_desk_str = "";

        cur_player_tile_panel.setPositionX(player.curGameRoom.upTilesList[serverSitNum].length * 136);
        mahjong_hand_str = "mahjong_tile_player_hand.png";
        // mahjong_up_str = "mahjong_tile_player_up.png";
        // mahjong_down_str = "mahjong_tile_player_down.png";
        // mahjong_desk_str = "mahjong_tile_player_desk.png";
        for(var i = 0; i < 14; i++){
            var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + i.toString());
            tile_img.stopAllActions();
            tile_img.setPositionX(73 * i);
            tile_img.setPositionY(0);
            if(tileList[i]){
                var mahjong_img = tile_img.getChildByName("mahjong_img");
                tile_img.loadTexture("Mahjong/" + mahjong_hand_str, ccui.Widget.PLIST_TEXTURE);
                tile_img.setVisible(true);
                mahjong_img.ignoreContentAdaptWithSize(true);
                mahjong_img.loadTexture("Mahjong/mahjong_big_" + tileList[i].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
                mahjong_img.setVisible(true);
            } else {
                tile_img.setVisible(false);
            }
        }
    },

    update_player_up_tiles:function(serverSitNum, concealedKongList){
        if(!this.is_show) {return;}
        var player = h1global.entityManager.player();
        var cur_player_tile_panel = this.rootUINode.getChildByName("settlement_panel").getChildByName("player_tile_panel").getChildByName("player_up_panel");
        if(!cur_player_tile_panel){
            return;
        }
        // var mahjong_hand_str = "";
        var mahjong_up_str = "";
        var mahjong_down_str = "";
        // var mahjong_desk_str = "";
        // if(idx == 0){
        //  mahjong_hand_str = "mahjong_tile_player_hand.png";
        //  mahjong_up_str = "mahjong_tile_player_up.png";
        //  mahjong_down_str = "mahjong_tile"
        // }
        for(var i = player.curGameRoom.upTilesList[serverSitNum].length * 3; i < 12; i++){
            var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + i.toString());
            tile_img.setVisible(false);
        }
        for(var i = 0; i < this.kongTilesList[serverSitNum].length; i++){
            this.kongTilesList[serverSitNum][i].removeFromParent();
        }
        this.kongTilesList[serverSitNum] = [];
        // mahjong_hand_str = "mahjong_tile_player_hand.png";
        mahjong_up_str = "mahjong_tile_player_up.png";
        mahjong_down_str = "mahjong_tile_player_down.png";
        // mahjong_desk_str = "mahjong_tile_player_desk.png";
        for(var i = 0; i < player.curGameRoom.upTilesList[serverSitNum].length; i++){
            for(var j = 0; j < 3; j++){
                var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + (3*i + j).toString());
                // tile_img.setPositionY(0);
                tile_img.setTouchEnabled(false);
                var mahjong_img = tile_img.getChildByName("mahjong_img");
                if(player.curGameRoom.upTilesList[serverSitNum][i][j]){
                    tile_img.loadTexture("Mahjong/" + mahjong_up_str, ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.ignoreContentAdaptWithSize(true);
                    mahjong_img.loadTexture("Mahjong/mahjong_small_" + player.curGameRoom.upTilesList[serverSitNum][i][j].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.setVisible(true);
                } else {
                    tile_img.loadTexture("Mahjong/" + mahjong_down_str, ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.setVisible(false);
                }
                tile_img.setVisible(true);
            }
            if(player.curGameRoom.upTilesList[serverSitNum][i].length > 3){
                var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + (3*i + 1).toString());
                var kong_tile_img = tile_img.clone();
                this.kongTilesList[serverSitNum].push(kong_tile_img);
                var mahjong_img = kong_tile_img.getChildByName("mahjong_img");
                if(player.curGameRoom.upTilesList[serverSitNum][i][3]){
                    kong_tile_img.loadTexture("Mahjong/" + mahjong_up_str, ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.ignoreContentAdaptWithSize(true);
                    mahjong_img.loadTexture("Mahjong/mahjong_small_" + player.curGameRoom.upTilesList[serverSitNum][i][j].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.setVisible(true);
                } else {
                    if(concealedKongList[0]){
                        kong_tile_img.loadTexture("Mahjong/" + mahjong_up_str, ccui.Widget.PLIST_TEXTURE);
                        mahjong_img.ignoreContentAdaptWithSize(true);
                        mahjong_img.loadTexture("Mahjong/mahjong_small_" + concealedKongList[0].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
                        concealedKongList.splice(0, 1);
                        mahjong_img.setVisible(true);
                    } else {
                        kong_tile_img.loadTexture("Mahjong/" + mahjong_down_str, ccui.Widget.PLIST_TEXTURE);
                        mahjong_img.setVisible(false);
                    }
                }
                kong_tile_img.setPositionY(kong_tile_img.getPositionY() + 16);
                kong_tile_img.setVisible(true);
                cur_player_tile_panel.addChild(kong_tile_img);
            }
        }
        cur_player_tile_panel.setVisible(true);
    },

    update_player_info:function(serverSitNum){
        if(!this.is_show) {return;}
        var player = h1global.entityManager.player();
        var cur_player_info_panel = this.player_panels[serverSitNum];
        if(!cur_player_info_panel){
            return;
        }
        var playerInfo = player.curGameRoom.playerInfoList[serverSitNum];
        cur_player_info_panel.getChildByName("name_label").setString(playerInfo["nickname"]);
        var frame_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "frame_img");
        cur_player_info_panel.reorderChild(frame_img, 1);
        cutil.loadPortraitTexture(playerInfo["head_icon"], function(img){
            cur_player_info_panel.getChildByName("portrait_sprite").removeFromParent();
            var portrait_sprite  = new cc.Sprite(img);
            portrait_sprite.setName("portrait_sprite");
            portrait_sprite.setScale(86/portrait_sprite.getContentSize().width);
            portrait_sprite.x = cur_player_info_panel.getContentSize().width * 0.5;
            portrait_sprite.y = cur_player_info_panel.getContentSize().height * 0.5;
            cur_player_info_panel.addChild(portrait_sprite);
            portrait_sprite.setLocalZOrder(-1);
            frame_img.setLocalZOrder(0);
        }, playerInfo["uuid"].toString() + ".png");

        var dealer_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "dealer_img")
        dealer_img.setLocalZOrder(1);
        if (serverSitNum == player.curGameRoom.dealerIdx) { //是否庄家
            dealer_img.setVisible(true)
        }else{
            dealer_img.setVisible(false)
        }

        var owner_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "owner_img")
        if (player.curGameRoom.playerInfoList["userId"] == player.curGameRoom.ownerId) {
            owner_img.setVisible(true)
        } else {
            owner_img.setVisible(false)
        }
    },

    update_player_win: function (serverSitNum, opId) {
        if (serverSitNum < 0 || serverSitNum > 3) {
            return;
        }
        // var win_label = this.player_tiles_panels[serverSitNum].getChildByName("win_label");
        // win_label.setVisible(true);
        // if(opId === const_val.OP_WIN){
        // 	win_label.setString("自摸");
        // } else if(opId === const_val.OP_KONG_WIN){
        // 	win_label.setString("抢杠胡");
        // } else {
        // 	win_label.setString("");
        // }
    },

    update_score: function (serverSitNum, score) {
        // var tiles_panels = [];
        // tiles_panels.push(this.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel1"));
        // tiles_panels.push(this.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel2"));
        // tiles_panels.push(this.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel3"));
        // tiles_panels.push(this.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel4"));
        cc.log("num :" + serverSitNum, score);
        cc.log(this.player_panels);
        var score_label = this.player_panels[serverSitNum].getChildByName("score_label");
        if (score >= 0) {
            score_label.setTextColor(cc.color(62, 121, 77));
            score_label.setString("+" + score.toString());
        } else {
            score_label.setTextColor(cc.color(144, 71, 64));
            score_label.setString(score.toString());
        }
    },
});