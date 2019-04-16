"use strict";
/*-----------------------------------------------------------------------------------------
 interface
 -----------------------------------------------------------------------------------------*/
var impRoomOperation = impGameRules.extend({
    __init__: function () {
        this._super();
        this.curGameRoom = undefined;
        KBEngine.DEBUG_MSG("Create impRoomOperation");
    },

    //maxOldDealNum, startOldDealNum, diceAddNum, isSameAdd, maxLoseScore, isAgent
    createRoom: function (gameRound, roomMode, is_agent) {
        cc.log("createRoomInfoList:", gameRound, roomMode, is_agent)
        this.baseCall("createRoom", gameRound, roomMode, is_agent);
    },

    createRoomSucceed: function (roomInfo) {
        cc.log("createRoomSucceed!",roomInfo)
        this.curGameRoom = new GameRoomEntity();
        this.curGameRoom.updateRoomData(roomInfo);
        this.serverSitNum = 0;
        if (roomInfo["isAgent"]) {
            this.serverSitNum = -1;
        } else {
            this.curGameRoom.updatePlayerState(this.serverSitNum, 1);
        }
        if (onhookMgr) {
            onhookMgr.setRoomLeftTime(roomInfo["roomTimeLeft"])
        }
        h1global.runScene(new GameRoomScene());
        // h1global.curUIMgr.gameroomprepare_ui.show();
        // h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(0, {});
    },

    createRoomFailed: function (err) {
        cc.log("createRoomFailed!");
        if (err == -1) {
            h1global.globalUIMgr.info_ui.show_by_info("房卡不足!", cc.size(300, 200));
        } else if (err == -2) {
            h1global.globalUIMgr.info_ui.show_by_info("已经在房间中!", cc.size(300, 200));
        }
    },

    server2CurSitNum: function (serverSitNum) {
        if (this.curGameRoom) {
            return (serverSitNum + this.curGameRoom.playerInfoList.length - this.serverSitNum) % this.curGameRoom.playerInfoList.length;
        } else {
            return -1;
        }
    },

    enterRoom: function (roomId) {
        this.baseCall("enterRoom", roomId);
    },

    enterRoomSucceed: function (serverSitNum, roomInfo) {
        cc.log("enterRoomSucceed!", roomInfo)
        if (onhookMgr) {
            onhookMgr.setRoomLeftTime(roomInfo["roomTimeLeft"])
        }
        this.curGameRoom = new GameRoomEntity();
        this.curGameRoom.updateRoomData(roomInfo);
        // this.serverSitNum = 0;
        // for(var i = 0; i < roomInfo["player_info_list"].length; i++){
        // 	if(roomInfo["player_info_list"][i]["uuid"].compare(this.uuid) == 0){
        // 		this.serverSitNum = roomInfo["player_info_list"][i]["idx"];
        // 		break;
        // 	}
        // }
        this.serverSitNum = serverSitNum;
        this.curGameRoom.playerStateList = [1, 1, 1, 1];
        // h1global.runScene(new GameRoomScene());
        if (cc.director.getRunningScene().className == "GameRoomScene") {
            h1global.runScene(new GameRoomScene());
            cutil.unlock_ui();
        } else {
            // if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
            // 	h1global.runScene(new GameRoomScene());
            // } else {
            // 	h1global.reconnect = true;
            // }
            h1global.runScene(new GameRoomScene());
        }
        // h1global.curUIMgr.gameroomprepare_ui.show();
        // for(var i = 0; i < this.curGameRoom.playerInfoList.length; i++){
        // 	h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(i, this.curGameRoom.playerInfoList[i]);
        // }
    },

    enterRoomFailed: function (err) {
        cc.log("enterRoomFailed!");
        if (err == -1) {
            h1global.globalUIMgr.info_ui.show_by_info("房间不存在！", cc.size(300, 200));
        } else if (err == -2) {
            h1global.globalUIMgr.info_ui.show_by_info("房间人数已满！", cc.size(300, 200));
        }
    },

    quitRoom: function () {
        if (!this.curGameRoom) {
            return;
        }
        this.baseCall("quitRoom");
    },

    quitRoomSucceed: function () {
        this.curGameRoom = null;
        if (onhookMgr) {
            onhookMgr.setApplyCloseLeftTime(null);
        }
        h1global.runScene(new GameHallScene());
    },

    quitRoomFailed: function (err) {
        cc.log("quitRoomFailed!");
    },

    othersQuitRoom: function (serverSitNum) {
        if (this.curGameRoom) {
            this.curGameRoom.playerInfoList[serverSitNum] = null;
            if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
                h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(serverSitNum, this.curGameRoom.playerInfoList[serverSitNum]);
            }
        }
    },

    othersEnterRoom: function (playerInfo) {
        cc.log("othersEnterRoom")
        cc.log(playerInfo)
        this.curGameRoom.updatePlayerInfo(playerInfo["idx"], playerInfo);
        this.curGameRoom.updatePlayerState(playerInfo["idx"], 1);
        if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
            h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(playerInfo["idx"], playerInfo);
            h1global.curUIMgr.gameroomprepare_ui.update_player_state(playerInfo["idx"], 1);
        }
    },

    handleReconnect: function (recRoomInfo) {
        this.curGameRoom = new GameRoomEntity();
        this.curGameRoom.reconnectRoomData(recRoomInfo);
        if (onhookMgr) {
            onhookMgr.setRoomLeftTime(recRoomInfo["roomTimeLeft"])
        }
        if (this.curGameRoom.isAgent && this.curGameRoom.agentInfo['userId'].compare(this.userId) == 0) {
            this.serverSitNum = -1;
        } else {
            for (var i = 0; i < recRoomInfo["player_info_list"].length; i++) {
                if (recRoomInfo["player_info_list"][i]["userId"].compare(this.userId) == 0) {
                    this.serverSitNum = i;
                    break;
                }
            }
        }
        // cc.log("handleReconnect:")
        // cc.log(this.userId)
        // cc.log(recRoomInfo)
        // if(cc.director.getRunningScene().className == "GameRoomScene"){
        // 	h1global.runScene(new GameRoomScene());
        // } else {
        // 	if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
        // 		h1global.runScene(new GameRoomScene());
        // 	} else {
        // 		h1global.reconnect = true;
        // 	}
        // }
        h1global.runScene(new GameRoomScene());
    },

    applyDismissRoom: function () {
        if (this.curGameRoom) {
            this.baseCall("applyDismissRoom");
            this.curGameRoom.applyCloseLeftTime = const_val.DISMISS_ROOM_WAIT_TIME + 1; // 本地操作先于服务端，所以增加1s防止网络延迟
            this.curGameRoom.applyCloseFrom = this.serverSitNum;
            this.curGameRoom.applyCloseStateList[this.serverSitNum] = 1;
            h1global.curUIMgr.applyclose_ui.show_by_sitnum(this.serverSitNum);
            onhookMgr.setApplyCloseLeftTime(const_val.DISMISS_ROOM_WAIT_TIME + 1); // 本地操作先于服务端，所以增加1s防止网络延迟
        }
    },

    reqDismissRoom: function (serverSitNum) {
        if (this.curGameRoom) {
            this.curGameRoom.applyCloseLeftTime = const_val.DISMISS_ROOM_WAIT_TIME;
            this.curGameRoom.applyCloseFrom = serverSitNum
            this.curGameRoom.applyCloseStateList = [0, 0, 0, 0];
            this.curGameRoom.applyCloseStateList[serverSitNum] = 1;
            h1global.curUIMgr.applyclose_ui.show_by_sitnum(serverSitNum);
            onhookMgr.setApplyCloseLeftTime(const_val.DISMISS_ROOM_WAIT_TIME);
        }
    },

    voteDismissRoom: function (vote) {
        // cc.log("voteDismissRoom")
        this.baseCall("voteDismissRoom", vote);
    },

    voteDismissResult: function (serverSitNum, vote) {
        // cc.log("voteDismissResult")
        if (this.curGameRoom) {
            this.curGameRoom.applyCloseStateList[serverSitNum] = vote;
            var vote_agree_num = 0;
            var vote_disagree_num = 0;
            for (var i = 0; i < this.curGameRoom.playerInfoList.length; i++) {
                if (this.curGameRoom.applyCloseStateList[i] == 1) {
                    vote_agree_num = vote_agree_num + 1;
                } else if (this.curGameRoom.applyCloseStateList[i] == 2) {
                    vote_disagree_num = vote_disagree_num + 1;
                }
            }
            // if(vote_agree_num >= 3){

            // }
            // if (vote_disagree_num >= 2) {
            //     if (h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
            //         h1global.curUIMgr.applyclose_ui.hide();
            //     }
            //     return;
            // }
            if(vote_disagree_num >= 2 || vote_disagree_num >= this.curGameRoom.playerInfoList.length / 2){
                if(h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show){
                    h1global.curUIMgr.applyclose_ui.hide();
                    for(var i = 0; i < this.curGameRoom.playerInfoList.length; i++){
                        this.curGameRoom.applyCloseStateList[i] = 0;
                    }
                }
                return;
            }else if(vote_agree_num == this.curGameRoom.playerInfoList.length - 1){
                this.quitRoom();
            }
            if (h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
                h1global.curUIMgr.applyclose_ui.update_vote_state();
            }
        }
    },
});
