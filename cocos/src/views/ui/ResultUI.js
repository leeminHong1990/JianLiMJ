// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
var ResultUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/ResultUI.json";
        this.setLocalZOrder(const_val.MAX_LAYER_NUM);
	},
	initUI:function(){
		this.player_tiles_panels = [];
		this.player_tiles_panels.push(this.rootUINode.getChildByName("result_panel").getChildByName("player_info_panel0"));
		this.player_tiles_panels.push(this.rootUINode.getChildByName("result_panel").getChildByName("player_info_panel1"));
		this.player_tiles_panels.push(this.rootUINode.getChildByName("result_panel").getChildByName("player_info_panel2"));
		this.player_tiles_panels.push(this.rootUINode.getChildByName("result_panel").getChildByName("player_info_panel3"));

		var share_btn = this.rootUINode.getChildByName("result_panel").getChildByName("share_btn");
		function share_btn_event(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
                if (cc.sys.os == cc.sys.OS_ANDROID) {
					jsb.fileUtils.captureScreen("", "screenShot.png");
                } else if(cc.sys.os == cc.sys.OS_IOS){
                    jsb.reflection.callStaticMethod("WechatOcBridge","takeScreenShot");
                } else {
                    share_btn.setVisible(false);
                }
			}
		}
		share_btn.addTouchEventListener(share_btn_event);
		if(cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_ANDROID){
			share_btn.setVisible(true);
		} else {
			share_btn.setVisible(false);
		}

		var confirm_btn = this.rootUINode.getChildByName("result_panel").getChildByName("confirm_btn");
		function confirm_btn_event(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				h1global.entityManager.player().curGameRoom = null;
				h1global.runScene(new GameHallScene());
			}
		}
		confirm_btn.addTouchEventListener(confirm_btn_event);

		this.update_agent_info();
	},
	
	show_by_info:function(finalPlayerInfoList){
		var self = this;
		this.show(function(){
			var maxScore = 0;
			// var maxIdxList = [];
			for(var i = 0; i < finalPlayerInfoList.length; i++){
				var finalPlayerInfo = finalPlayerInfoList[i];
				// if(finalPlayerInfo["score"] > maxScore){
				// 	maxScore = finalPlayerInfo["score"];
				// }
				self.update_player_info(finalPlayerInfo["idx"], finalPlayerInfo);
			}
			// for(var i = 0; i < finalPlayerInfoList.length; i++){
			// 	if(finalPlayerInfoList[i]["score"] == maxScore){
			// 		maxIdxList.push(finalPlayerInfoList[i]["idx"]);
			// 	}
			// }
			cutil.unlock_ui();
		});
	},

	update_agent_info:function(){
		var player = h1global.entityManager.player();
		var curGameRoom = player.curGameRoom;
		// var playerInfo = {
		// 	"nickname" : curGameRoom.agent_nickname,
		// 	"head_icon" : curGameRoom.agent_head_icon,
		// 	"userId" : curGameRoom.agent_userId,
		// 	"uuid" : "agent_portrait"
		// }
		var playerInfo = curGameRoom.agentInfo;
		var cur_player_info_panel = this.rootUINode.getChildByName("result_panel").getChildByName("agent_info_panel");
		if(curGameRoom.isAgent){
			cur_player_info_panel.getChildByName("name_label").setString(playerInfo["nickname"]);
			cur_player_info_panel.getChildByName("userid_label").setString("ID:" + playerInfo["userId"].toDouble().toString());
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
			}, playerInfo["uuid"].toString() + ".png");
			cur_player_info_panel.setVisible(true);
		} else {
			cur_player_info_panel.setVisible(false);
		}
	},

	update_player_info:function(serverSitNum, finalPlayerInfo){
		var player = h1global.entityManager.player();
		var cur_player_info_panel = this.player_tiles_panels[serverSitNum];
		var playerInfo = player.curGameRoom.playerInfoList[serverSitNum];
		cur_player_info_panel.getChildByName("name_label").setString(playerInfo["nickname"]);
		// cur_player_info_panel.getChildByName("userid_label").setString("ID:" + playerInfo["userId"].toDouble().toString());
		var frame_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "frame_img");
		cur_player_info_panel.reorderChild(frame_img, 1);
		var owner_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "owner_img");
		cur_player_info_panel.reorderChild(owner_img, 2);
		if(serverSitNum == 0){
			owner_img.setVisible(true);
		} else {
			owner_img.setVisible(false);
		}
		cutil.loadPortraitTexture(playerInfo["head_icon"], function(img){
			cur_player_info_panel.getChildByName("portrait_sprite").removeFromParent();
			var portrait_sprite  = new cc.Sprite(img);
			portrait_sprite.setName("portrait_sprite");
			portrait_sprite.setScale(86/portrait_sprite.getContentSize().width);
			portrait_sprite.x = cur_player_info_panel.getContentSize().width * 0.5;
			portrait_sprite.y = cur_player_info_panel.getContentSize().height * 0.5;
			cur_player_info_panel.addChild(portrait_sprite);
		}, playerInfo["uuid"].toString() + ".png");
		this.player_tiles_panels[serverSitNum].getChildByName("score_label").setString(finalPlayerInfo["score"].toString());
	},
});
