var GlobalUIManager = UIManagerBase.extend({
	onCreate:function(){
	    // this.toast_ui = new ToastUI();
	    this.info_ui = new InfoUI();
	    this.broadcast_ui = new BroadcastUI();
	    this.lock_ui = new LockUI();
	    this.lock_ui.hasPreload = true;
	    // 将所有的UI按序加载到场景中
	    // this.ui_list.push(this.toast_ui);
	    this.ui_list.push(this.info_ui);
	    this.ui_list.push(this.broadcast_ui);
	    this.ui_list.push(this.lock_ui);

	    // 版本号嵌入
	    if(cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS){
	    	var version_label = cc.LabelTTF.create("v" + app_version, "Arial", 26);
	    	version_label.setAnchorPoint(cc.p(1.0, 0.0));
	    	version_label.setPosition(cc.p(1280, 0));
	    	this.addChild(version_label);
	    } else {
	    	var version_label = cc.LabelTTF.create("v" + g_version, "Arial", 26);
	    	version_label.setAnchorPoint(cc.p(1.0, 0.0));
	    	version_label.setPosition(cc.p(1280, 0));
	    	this.addChild(version_label);
	    }
	}
});
