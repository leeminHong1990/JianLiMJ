"use strict";

var GameRoomEntity = KBEngine.Entity.extend({
	ctor : function()
	{
		this._super();
		this.roomID = undefined;
		this.curRound = 0;
		this.maxRound = 8;
		this.luckyTileNum = 4;
		this.ownerId = undefined;
		this.dealerIdx = 0;
		this.isAgent = false;
		// this.agent_nickname = "";
		// this.agent_userId = 0;
		// this.agent_head_icon = "";
		this.agentInfo = {};
		this.playerInfoList = [null, null, null, null];
		this.playerStateList = [0, 0, 0, 0];
		this.handTilesList = [[], [], [], []];
		this.upTilesList = [[], [], [], []];
		this.upTilesOpsList = [[], [], [], []];
		this.discardTilesList = [[], [], [], []];
		this.cutIdxsList = [[], [], [], []];
		this.curPlayerSitNum = 0;
		this.isPlayingGame = 0;
		this.lastDiscardTile = 0;
		this.lastDrawTile = -1
		this.lastDiscardTileFrom = -1;
		this.lastDiscardTileNum = 0;
		this.leftTileNum = 56;
		this.curOldDealNum = 0; //当前老庄

		this.kingTile = 0;	// 财神
		this.discardKingTileIdx = -2; //打出财神玩家的seat
		this.createRoomInfoList = [0,0,0,0]
		this.roomMode = 0
		this.gameRound = 0

		this.applyCloseLeftTime = 0;
		this.applyCloseFrom = 0;
		this.applyCloseStateList = [0, 0, 0, 0];

		this.waitAid = -1; // 轮询时的上一个操作，-1表示没有被轮询，否则表示被轮询时的上一个人的操作

		// 每局不清除的信息
		this.playerScoreList = [0, 0, 0, 0];
	    KBEngine.DEBUG_MSG("Create GameRoomEntity")
  	},

  	reconnectRoomData : function(recRoomInfo){
  		cc.log("reconnectRoomData",recRoomInfo)
  		this.curRound = recRoomInfo["curRound"];
  		this.curPlayerSitNum = recRoomInfo["curPlayerSitNum"];
  		this.isPlayingGame = recRoomInfo["isPlayingGame"];
  		this.playerStateList = recRoomInfo["player_state_list"];
  		this.lastDiscardTile = recRoomInfo["lastDiscardTile"];
  		this.lastDrawTile = recRoomInfo["lastDrawTile"]
  		this.lastDiscardTileFrom = recRoomInfo["lastDiscardTileFrom"];
  		this.lastDiscardTileNum = recRoomInfo["lastDiscardTileNum"]; // 连续打出的相同的牌的个数
  		this.leftTileNum = recRoomInfo["leftTileNum"];
  		if (this.roomMode == 2) {
			this.leftTileNum += 4
		}
  		this.curOldDealNum = recRoomInfo["curOldDealNum"]
  		this.kingTile = recRoomInfo["kingTile"];
		this.discardKingTileIdx = recRoomInfo["discardKingTileIdx"];

  		for(var i = 0; i < recRoomInfo["player_info_list"].length; i++){
  			var curPlayerInfo = recRoomInfo["player_info_list"][i];
  			this.playerInfoList[i] = {
  				"nickname" : curPlayerInfo["nickname"],
  				"head_icon" : curPlayerInfo["head_icon"],
  				"sex" : curPlayerInfo["sex"],
  				"score" : curPlayerInfo["score"],
  				"userId" : curPlayerInfo["userId"],
  				"uuid" : curPlayerInfo["uuid"]
  			};
  			this.handTilesList[i] = curPlayerInfo["tiles"];
  			this.discardTilesList[i] = curPlayerInfo["discard_tiles"];
  			this.cutIdxsList[i] = curPlayerInfo["cut_idxs"];
  			// for(var j = 0; j < curPlayerInfo["pong_r"].length; j++){
  			// 	this.upTilesList[i].push([curPlayerInfo["pong_r"][j], curPlayerInfo["pong_r"][j], curPlayerInfo["pong_r"][j]]);
  			// }
  			// for(var j = 0; j < curPlayerInfo["exposed_kong_r"].length; j++){
  			// 	this.upTilesList[i].push([curPlayerInfo["exposed_kong_r"][j], curPlayerInfo["exposed_kong_r"][j], curPlayerInfo["exposed_kong_r"][j], curPlayerInfo["exposed_kong_r"][j]]);
  			// }
  			// for(var j = 0; j < curPlayerInfo["concealed_kong_r"].length; j++){
  			// 	this.upTilesList[i].push([0, 0, 0, curPlayerInfo["concealed_kong_r"][j]]);
  			// }
  			for(var j = 0; j < curPlayerInfo["op_list"].length; j++){
  				var op_info = curPlayerInfo["op_list"][j]; //[opId, [tile]]
  				if(op_info["opId"] == const_val.OP_PONG){
  					this.upTilesList[i].push([op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0]]);
  					this.upTilesOpsList[i].push([op_info]);
  				} else if(op_info["opId"] == const_val.OP_EXPOSED_KONG){
  					// 检查是否有碰过相同的牌
  					// var has_pong_idx = -1;
  					// for(var k = 0; k < this.upTilesList[i].length; k++){
  					// 	if(this.upTilesList[i][k][0] == op_info["tiles"][0] && this.upTilesList[i][k][0] == this.upTilesList[i][k][1] && this.upTilesList[i][k][1] == this.upTilesList[i][k][2]){
  					// 		has_pong_idx = k;
  					// 		break;
  					// 	}
  					// }
  					var kongIdx = h1global.entityManager.player().getSelfExposedKongIdx(this.upTilesList[i], op_info["tiles"][0]);
  					if(kongIdx >= 0){
  						// 已经碰过相同的牌，说明为自摸杠
	  					// this.upTilesList[i].splice(has_pong_idx, 1);
	  					// var ops = (this.upTilesOpsList[i].splice(has_pong_idx, 1))[0];
	  					this.upTilesList[i][kongIdx].push(op_info["tiles"][0]);
	  					this.upTilesOpsList[i][kongIdx].push(op_info);
	  				} else {
	  					// 否则为普通杠
	  					this.upTilesList[i].push([op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0]]);
	  					this.upTilesOpsList[i].push([op_info]);
	  				}
  				} else if(op_info["opId"] == const_val.OP_CONCEALED_KONG){
  					this.upTilesList[i].push([0, 0, 0, op_info["tiles"][0]]);
  					this.upTilesOpsList[i].push([op_info]);
  				} else if(op_info["opId"] == const_val.OP_CHOW){
  					this.upTilesList[i].push((op_info["tiles"].concat()).sort(cutil.tileSortFunc));
  					this.upTilesOpsList[i].push([op_info]);
  				}
  			}
  		}
  		this.updateRoomData(recRoomInfo);

  		this.applyCloseLeftTime = recRoomInfo["applyCloseLeftTime"];
  		this.applyCloseFrom = recRoomInfo["applyCloseFrom"];
		this.applyCloseStateList = recRoomInfo["applyCloseStateList"];
		if(this.applyCloseLeftTime > 0){
			onhookMgr.setApplyCloseLeftTime(this.applyCloseLeftTime);
		}

		this.waitAid = recRoomInfo["waitAid"];
  	},

  	updateRoomData : function(roomInfo){
  		// cc.log(roomInfo)
        this.roomMode = roomInfo["roomMode"];
  		this.roomID = roomInfo["roomID"];
  		this.ownerId = roomInfo["ownerId"];
  		this.dealerIdx = roomInfo["dealerIdx"];
  		this.maxRound = roomInfo["maxRound"];
  		this.luckyTileNum = roomInfo["luckyTileNum"];
  		this.createRoomInfoList = roomInfo["createRoomInfoList"];
  		// this.playerInfoList = [null, null, null, null];
  		// cc.log(roomInfo)
  		this.isAgent = roomInfo["isAgent"];
		// this.agent_nickname = roomInfo["agent_nickname"];
		// this.agent_userId = roomInfo["agent_userId"];
		// this.agent_head_icon = roomInfo["agent_head_icon"];
		this.agentInfo = roomInfo["agentInfo"];
  		for(var i = 0; i < roomInfo["player_info_list"].length; i++){
  			var curPlayerInfo = roomInfo["player_info_list"][i];
  			this.updatePlayerInfo(curPlayerInfo["idx"], curPlayerInfo);
			// this.updatePlayerState(curPlayerInfo["idx"], 1);
		}

		var self = this;
		if(!(cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_ANDROID) && false){
			wx.onMenuShareAppMessage({
			    title: '我在至尊紅中麻將，房間號碼：' + self.roomID.toString(), // 分享标题
			    desc: '无需下载，点击即玩~', // 分享描述
			    link: 'http://www.zhizunhongzhong.com/h1hz', // 分享链接
			    imgUrl: '', // 分享图标
			    type: '', // 分享类型,music、video或link，不填默认为link
			    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
			    success: function () { 
			        // 用户确认分享后执行的回调函数
			        cc.log("ShareAppMessage Success!");
			    },
			    cancel: function () { 
			        // 用户取消分享后执行的回调函数
			        cc.log("ShareAppMessage Cancel!");
			    },
			    fail: function() {
			    	cc.log("ShareAppMessage Fail")
			    },
			});
			wx.onMenuShareTimeline({
			    title: '我在至尊紅中麻將，房間號碼：' + self.roomID.toString(), // 分享标题
			    desc: '无需下载，点击即玩~', // 分享描述
			    link: 'http://www.zhizunhongzhong.com/h1hz', // 分享链接
			    imgUrl: '', // 分享图标
			    type: '', // 分享类型,music、video或link，不填默认为link
			    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
			    success: function () { 
			        // 用户确认分享后执行的回调函数
			        cc.log("onMenuShareTimeline Success!");
			    },
			    cancel: function () { 
			        // 用户取消分享后执行的回调函数
			        cc.log("onMenuShareTimeline Cancel!");
			    },
			    fail: function() {
			    	cc.log("onMenuShareTimeline Fail")
			    },
			});
		}
  	},

  	checkDicsardKingTile:function(serverSitNum, aid, tile){
  		if (aid != const_val.OP_DISCARD) {return}
  		var self = this;
  		if (tile == self.kingTile && self.discardKingTileIdx < 0) {
  			self.discardKingTileIdx = serverSitNum;
  		}else if (tile != self.kingTile && self.discardKingTileIdx == serverSitNum) {
  			self.discardKingTileIdx = -2;
  		}
  	},

  	updatePlayerInfo : function(serverSitNum, playerInfo){
  		this.playerInfoList[serverSitNum] = playerInfo;
  	},

  	updatePlayerState : function(serverSitNum, state){
  		this.playerStateList[serverSitNum] = state;
  	},

  	updatePlayerOnlineState : function(serverSitNum, state){
  		this.playerInfoList[serverSitNum]["online"] = state;
  	},

  	startGame : function(kingTile){
  		this.curRound = this.curRound + 1;
  		this.isPlayingGame = 1;
		this.handTilesList = [	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
		this.upTilesList = [[], [], [], []];
		this.upTilesOpsList = [[], [], [], []];
		this.discardTilesList = [[], [], [], []];
		this.cutIdxsList = [[], [], [], []];
		this.canWinTileList = [];
		this.leftTileNum = 56;

		this.kingTile = kingTile
		this.discardKingTileIdx = -2
  	},

  	endGame : function(){
  		// 重新开始准备
  		this.playerStateList = [0, 0, 0, 0];
  		this.isPlayingGame = 0;
  	},
});