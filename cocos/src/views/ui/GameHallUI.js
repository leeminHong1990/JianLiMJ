// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
var GameHallUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/GameHallUI.json";
	},
	initUI:function(){
		var bg_img = ccui.helper.seekWidgetByName(this.rootUINode, "bg_img");
		var bg_img_content_size = bg_img.getContentSize();
		var scale = cc.winSize.width/bg_img_content_size.width;
		if (cc.winSize.height/bg_img_content_size.height > scale){
			scale = cc.winSize.height/bg_img_content_size.height;
		}
		bg_img.setScale(scale);

		this.init_character_panel();
		this.init_function_panel();
		this.init_game_panel();
		this.init_centre_panel();
		this.init_game_action();
	},

	init_character_panel:function(){
		cc.log(cc.sys.localStorage.getItem("INFO_JSON"))
		var character_panel = ccui.helper.seekWidgetByName(this.rootUINode, "character_panel");
		var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
		cc.log(info_dict["headimgurl"])
		var name_label = character_panel.getChildByName("name_label");
		cc.log(info_dict["nickname"])
		name_label.setString(info_dict["nickname"]);
		var roomcard_label = character_panel.getChildByName("roomcard_label");
		var diamond_label = character_panel.getChildByName("diamond_label");
		roomcard_label.setString("--");
		diamond_label.setString("--");
		// roomcard_label.setString("房卡:" + h1global.entityManager.player().cards.toString());
		var frame_img = ccui.helper.seekWidgetByName(character_panel, "frame_img");
		character_panel.reorderChild(frame_img, 1);
		frame_img.addTouchEventListener(function(sender, eventType){
			h1global.curUIMgr.playerinfo_ui.show();
		});
		frame_img.setTouchEnabled(true);
		cutil.loadPortraitTexture(info_dict["headimgurl"], function(img){
			if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
				h1global.curUIMgr.gamehall_ui.rootUINode.getChildByName("character_panel").getChildByName("portrait_sprite").removeFromParent();
				var portrait_sprite  = new cc.Sprite(img);
				portrait_sprite.setScale(102/portrait_sprite.getContentSize().width);
				portrait_sprite.x = 111;
				portrait_sprite.y = 59;
    			h1global.curUIMgr.gamehall_ui.rootUINode.getChildByName("character_panel").addChild(portrait_sprite);
			}
		});

		function update_card_diamond(){
			cutil.get_user_info("wx_" + info_dict["unionid"], function(content){
	            if(content[0] != '{'){
	                return;
	            }
	            var info = eval('(' + content + ')');
	            roomcard_label.setString(info["card"].toString());
	            diamond_label.setString(info["diamond"].toString());
	        });
		}

		var refresh_btn = character_panel.getChildByName("refresh_btn")
		refresh_btn.addTouchEventListener(function(sender, eventType){
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				if (onhookMgr && onhookMgr.refreshBtnTime) {
					return
				}
				if (onhookMgr) {
					onhookMgr.setRefreshBtnTime(5.0)
				}
				// refresh function
				// cc.log("refresh_btn")
				update_card_diamond()
			}
		})
		update_card_diamond();
		// var img = jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "downloadAndStoreFileSync", "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;", "http:\/\/wx.qlogo.cn\/mmopen\/Q3auHgzwzM6zHFzbk0YyibNTMxxibJ2yhg2eq0sIBOgFHCKvSBsibkm2pjYVcwgjwsJlI4yrJvWzXBYHRohiced8tQ\/0", h1global.entityManager.player().uuid.toString() + ".png");
		// cc.log("##############################################")
		// cc.log(img)
		// if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
		// 	// cc.log(err, img)
		// 	h1global.curUIMgr.gamehall_ui.rootUINode.getChildByName("character_panel").getChildByName("portrait_sprite").removeFromParent();
		// 	// if(cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_ANDROID){
		// 	// 	cc.textureCache.addImage(img);
		// 	// 	cc.spriteFrameCache.addSpriteFrames(img);
		// 	// }
		// 	var portrait_sprite  = new cc.Sprite(img);
		// 	portrait_sprite.setScale(80/750);
		// 	portrait_sprite.x = 80;
		// 	portrait_sprite.y = 75;
		// 	h1global.curUIMgr.gamehall_ui.rootUINode.getChildByName("character_panel").addChild(portrait_sprite);
		// }
	},

	update_roomcard:function(cards){
		// var character_panel = ccui.helper.seekWidgetByName(this.rootUINode, "character_panel");
		// var roomcard_label = character_panel.getChildByName("roomcard_label");
		// roomcard_label.setString("房卡:" + cards.toString() + "張");
	},

	init_function_panel:function(){
		var function_panel = ccui.helper.seekWidgetByName(this.rootUINode, "function_panel");
		function_panel.getChildByName("config_btn").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				h1global.curUIMgr.config_ui.show();
			}
		});

		function_panel.getChildByName("feedback_btn").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				h1global.curUIMgr.feedback_ui.show();
			}
		});

		function_panel.getChildByName("score_btn").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				h1global.curUIMgr.record_ui.show();
				// h1global.globalUIMgr.info_ui.show_by_info("該功能尚未開啟！", cc.size(300, 200));
			}
		});

		function_panel.getChildByName("exit_btn").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				cutil.lock_ui();
				h1global.entityManager.player().logout();
			}
		});
	},

	init_game_panel:function(){
		var game_panel = ccui.helper.seekWidgetByName(this.rootUINode, "game_panel");
		var createroom_btn = game_panel.getChildByName("createroom_btn");
		function createroom_btn_event(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				// h1global.entityManager.player().createRoom();
				h1global.curUIMgr.createroom_ui.show();
			}
		}
		createroom_btn.addTouchEventListener(createroom_btn_event);

		var self = this;
		var joinroom_btn = game_panel.getChildByName("joinroom_btn");
		function joinroom_btn_event(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				h1global.curUIMgr.joinroom_ui.show();
			}
		}
		joinroom_btn.addTouchEventListener(joinroom_btn_event);
		
	},

	init_centre_panel:function(){
		return;
		var centre_panel = ccui.helper.seekWidgetByName(this.rootUINode, "centre_panel");
		// var signin_label = centre_panel.getChildByName("signin_label");
		this.update_signin_content(h1global.entityManager.player().signInNum);
		var signin_btn = centre_panel.getChildByName("signin_btn");
		signin_btn.addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				// h1global.globalUIMgr.info_ui.show_by_info("該功能尚未開啟！", cc.size(300, 200));
				h1global.entityManager.player().signIn();
			}
		});

		var notice_label = centre_panel.getChildByName("notice_label");
		var notice_xhr = cc.loader.getXMLHttpRequest();
        notice_xhr.open("GET", "http://www.zhizunhongzhong.com/hzmgr/index.php/notice", true);
        notice_xhr.onreadystatechange = function(){
             if(notice_xhr.readyState == 4 && notice_xhr.status == 200){    
                notice_label.setString(notice_xhr.responseText);
            } 
        }
        notice_xhr.send();
	},

	update_signin_content:function(signInNum){
		return;
		var centre_panel = ccui.helper.seekWidgetByName(this.rootUINode, "centre_panel");
		var signin_label = centre_panel.getChildByName("signin_label");
		signin_label.setString("签到" + signInNum.toString() + "/" + const_val.SIGNIN_MAX.toString() + "天即可获得房卡");
	},

	init_game_action : function(){
        cc.log("load actiong ing");
        UICommonWidget.load_effect_plist("butterfly1");
        var game_panel = ccui.helper.seekWidgetByName(this.rootUINode, "game_panel");
        var butterfly1_sprite = cc.Sprite.create();
        var ptime = 1;
        var time1 = 2;
        butterfly1_sprite.setPosition(cc.winSize.width*0.19,cc.winSize.height*0.31);
        game_panel.addChild(butterfly1_sprite);
        butterfly1_sprite.runAction(cc.RepeatForever.create(
            cc.Sequence.create(
                // cc.CallFunc.create(function(){
                //     poker_sprite.setPosition(cc.winSize.width*0.5,cc.winSize.height*0.5);
                //     poker_sprite.runAction(cc.MoveTo.create(ptime, cc.p(cc.winSize.width*0.5,cc.winSize.height*0.5)));
                // }),
                UICommonWidget.create_effect_action({"FRAMENUM":44, "TIME":time1, "NAME":"Butterfly1UI/butterfly_"}),
                cc.DelayTime.create(0.0)
            )
        ));

        UICommonWidget.load_effect_plist("butterfly2");
        var butterfly2_sprite = cc.Sprite.create();
        butterfly2_sprite.setPosition(cc.winSize.width*0.44,cc.winSize.height*0.28);
        butterfly2_sprite.runAction(cc.RepeatForever.create(
                cc.Sequence.create(
                    UICommonWidget.create_effect_action({"FRAMENUM":44, "TIME":time1, "NAME":"Butterfly2UI/"}),
                    cc.DelayTime.create(0.0)
                )
            ));
        game_panel.addChild(butterfly2_sprite);

        // var time = 1;
        UICommonWidget.load_effect_plist("butterfly3");
        var butterfly3_sprite = cc.Sprite.create();
        butterfly3_sprite.setPosition(cc.winSize.width*0.77,cc.winSize.height*0.35);
        butterfly3_sprite.runAction(cc.RepeatForever.create(
                cc.Sequence.create(
                    UICommonWidget.create_effect_action({"FRAMENUM":23, "TIME":ptime, "NAME":"Butterfly3UI/butterfly_"}),
                    cc.DelayTime.create(0.0)
                )
            ));
        game_panel.addChild(butterfly3_sprite);
    },
   
});