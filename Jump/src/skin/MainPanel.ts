class MainPanel extends eui.Component implements  eui.UIComponent {
	public constructor() {
		super();

		this.skinName = "resource/eui_skins/main/MainPanel.exml";
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();

		this.rightBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.click, this);

		let data = RES.getRes("guo_json");
        let txtr:egret.Texture = RES.getRes("guo_png");
        let mcFactory:egret.MovieClipDataFactory = new egret.MovieClipDataFactory( data, txtr );

        let mc:egret.MovieClip = new egret.MovieClip(mcFactory.generateMovieClipData("guo"));

        this.guoLeft.addChild(mc);

		mc.y = -140;

        mc.play(-1);

		mc = new egret.MovieClip(mcFactory.generateMovieClipData("guo"));

		this.guoRight.addChild(mc);

		mc.y = -140;

		mc.play(-1);
	}

	private click(e:egret.TouchEvent):void{

		console.log("click right");
	}
	
	public challengeBt:eui.Button;

	public endlessBt:eui.Button;

	public rankBt:eui.Button;

	public scoreGroup:eui.Group;

	public challengeScore:eui.Label;

	public endlessScore:eui.Label;

	public money:eui.Label;

	public rightBt:eui.Button;

	public fenxiangBt:eui.Button;

	public guoLeft:eui.Group;

	public guoRight:eui.Group;
}