"use strict";
/*-----------------------------------------------------------------------------------------
												entity
-----------------------------------------------------------------------------------------*/
KBEngine.PlayerAvatar = impRoomOperation.extend(
{
	__init__ : function()
	{
		this._super();
    	KBEngine.DEBUG_MSG("Create Player Avatar " + this.id)
  	},
  	
	onEnterWorld : function()
	{
		this._super();
	},

	// @RPC
	operationCallback : function(opId, lst)
	{

	},

	// @RPC
	operationFail : function(cid, val)
	{
	    KBEngine.DEBUG_MSG("operationFail: " + cid + "," + val);
	    
	    var content = ""
	    if (cid === const_val.FRIEND_OPERATION) {
	    	if (val == 0) {
	    		content = "好友已满"
	    	} else if (val == 1) {
	    		content = "对方已经是你的好友"
	    	}
	    }
	   
	    h1global.globalUIMgr.toast_ui.show_toast(content)	
	},

	operationAddTokenTips : function(tokenList){ //使用道具 增加代币 提示
		h1global.globalUIMgr.item_tips_ui.show_token_list(tokenList)
	},

	operationItemTips :function(cid, val){
		var content = "";
		// h1global.globalUIMgr.item_tips_ui.show_tips(content)
	},

	// @RPC
	operationSuccess : function(cid, val)
	{
	    KBEngine.DEBUG_MSG("operationSuccess: " + cid + "," + val);
	},


	// @RPC
	// state==0表示进入GameHallScene, state==1表示重连的吧？
	beginGame : function(state)
	{
		this.updateUserInfo();
		if(switches.TEST_OPTION){
			if(h1global.reconnect){
            	h1global.reconnect = false;
            	h1global.runScene(new GameRoomScene());
            } else {
            	h1global.runScene(new GameHallScene());
            }
		} else {
			var self = this;
			if(cc.sys.os === cc.sys.OS_ANDROID || cc.sys.os === cc.sys.OS_IOS){
				// cc.error("BEGINGGAME!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
				// if(cc.director.getRunningScene().className != "GameRoomScene"){
				if(state === 0){
					h1global.runScene(new GameHallScene());
				}
			} else {
				var xhr = cc.loader.getXMLHttpRequest();
			    xhr.open("GET", "http://www.zhizunhongzhong.com/hzmgr/index.php/Wxshare/?url=" + encodeURIComponent(window.location.href), true);
			    // cc.log("http://www.zhizunhongzhong.com/hzmgr/index.php/Wxshare/?url=" + encodeURIComponent(window.location.href))
			    xhr.onreadystatechange = function(){
			        if(xhr.readyState === 4 && xhr.status === 200){
			            var info_json = xhr.responseText;
			            cc.log(info_json);
			            var info_dict = eval('(' + info_json + ')');
			            wx.config({
			                // debug: true,
			                appId: info_dict["appId"],
			                timestamp: info_dict["timestamp"],
			                nonceStr: info_dict["nonceStr"],
			                signature: info_dict["signature"],
			                jsApiList: [
			                    'checkJsApi',
			                    'onMenuShareTimeline',
			                    'onMenuShareAppMessage',
			                    'onMenuShareQQ',
			                    'onMenuShareWeibo',
			                    'hideMenuItems',
			                    'showMenuItems',
			                    'hideAllNonBaseMenuItem',
			                    'showAllNonBaseMenuItem',
			                    'translateVoice',
			                    'startRecord',
			                    'stopRecord',
			                    'onRecordEnd',
			                    'playVoice',
			                    'pauseVoice',
			                    'stopVoice',
			                    'uploadVoice',
			                    'downloadVoice',
			                    'chooseImage',
			                    'previewImage',
			                    'uploadImage',
			                    'downloadImage',
			                    'getNetworkType',
			                    'openLocation',
			                    'getLocation',
			                    'hideOptionMenu',
			                    'showOptionMenu',
			                    'closeWindow',
			                    'scanQRCode',
			                    'chooseWXPay',
			                    'openProductSpecificView',
			                    'addCard',
			                    'chooseCard',
			                    'openCard'
			                ]
			            });
			            wx.ready(function(){
			                // wx.checkJsApi({
			                //     jsApiList: ['onMenuShareAppMessage'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
			                //     success: function(res) {
			                //         // 以键值对的形式返回，可用的api值true，不可用为false
			                //         // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
			                //         cc.log("checkJsApi success")
			                //         cc.log(res)
			                //     }
			                // });
			                wx.onMenuShareAppMessage({
			                	title: '我在至尊紅中麻將', // 分享标题
							    desc: '小夥伴們一起來玩吧~', // 分享描述
							    link: 'http://www.zhizunhongzhong.com/h1hz', // 分享链接
							    imgUrl: '', // 分享图标
							    type: '', // 分享类型,music、video或link，不填默认为link
							    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
							    success: function () { 
							        // 用户确认分享后执行的回调函数
							    },
							    cancel: function () { 
							        // 用户取消分享后执行的回调函数
							    }
							});
			                wx.onMenuShareTimeline({
			                	title: '我在至尊紅中麻將', // 分享标题
							    desc: '小夥伴們一起來玩吧~', // 分享描述
							    link: 'http://www.zhizunhongzhong.com/h1hz', // 分享链接
							    imgUrl: '', // 分享图标
							    type: '', // 分享类型,music、video或link，不填默认为link
							    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
							    success: function () { 
							        // 用户确认分享后执行的回调函数
							    },
							    cancel: function () { 
							        // 用户取消分享后执行的回调函数
							    }
							});

							// 音頻播放回調
							wx.onVoicePlayEnd({
							    success: function (res) {
							        // var localId = res.localId; // 返回音频的本地ID
							        if(self.voiceCache[res.localId]){
							        	self.voiceCache[res.localId].removeFromParent();
							        }
							        self.voiceCache[res.localId] = undefined;
							    }
							});
							
			                // if(h1global.reconnect){
			                // 	h1global.reconnect = false;
			                // 	h1global.runScene(new GameRoomScene());
			                // } else {
			                // 	h1global.runScene(new GameHallScene());
			                // }
			                // if(cc.director.getRunningScene().className != "GameRoomScene"){
			                if(state === 0){
								h1global.runScene(new GameHallScene());
							}
			            });
			        } 
			    };
			    xhr.send(null);
			}
		}
	},


	// @RPC
	pushAvatarInfo: function(avatarInfo){
		this.uuid = avatarInfo["uuid"];
		this.userId = avatarInfo["uid"];
		this.cards = avatarInfo["cards"];
		this.ip = avatarInfo["ip"];
	},
	
	logout : function(){
  		cc.log("logout");
  		// cc.sys.localStorage.removeItem("INFO_JSON");
  		this.baseCall("logout");
  	},

	// @RPC
	closeClient : function()
	{
	    // KBEngine.DEBUG_MSG("closeClient");
	    // h1global.globalUIMgr.hide_all_ui();
	    // h1global.runScene(new LoginScene());
	    cc.loader.load("src" + "/" + "return.js");
	},

	pushPlayerInfoList: function(infoList, plstId)
	{
		if (plstId === 1){
			cc.log("AttentionPlayerInfoList");
			if (h1global.curUIMgr.friend_ui && h1global.curUIMgr.friend_ui.is_show){
				h1global.curUIMgr.friend_ui.updateFriendListScroll(infoList)
			}
		} else if (plstId === 2){
			cc.log("AttentionYouPlayerInfoList");
			if (h1global.curUIMgr.friend_ui && h1global.curUIMgr.friend_ui.is_show){
				h1global.curUIMgr.friend_ui.updaRecommondFriendScroll(infoList)
			}
		} else if (plstId === 3){
			cc.log("GiftPlayerInfoList");
			if (h1global.curUIMgr.friend_ui && h1global.curUIMgr.friend_ui.is_show){
				h1global.curUIMgr.friend_ui.updateFriendGiftScroll(infoList)
			}
		}
	}

});
