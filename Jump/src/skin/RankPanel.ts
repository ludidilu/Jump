class RankPanel extends eui.Component implements  eui.UIComponent {

	public bg:eui.Rect;

	public scroller:eui.Scroller;

	public list:eui.List;

	public constructor() {

		super();

		this.skinName = "resource/eui_skins/main/RankPanel.exml";
	}

	private close(e:egret.TouchEvent):void{

		this.visible = false;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();

		this.bg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.close, this);
	}
	
}