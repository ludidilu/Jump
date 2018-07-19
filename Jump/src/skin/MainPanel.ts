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

		let mcData:egret.MovieClipData = mcFactory.generateMovieClipData("guo");
		

        let mc:egret.MovieClip = new egret.MovieClip(mcData);

        this.challengeBt.addChild(mc);

		mc.y = -140;

        mc.play(-1);

		mc = new egret.MovieClip(mcData);

        this.endlessBt.addChild(mc);

		mc.y = -140;

		mc.gotoAndPlay(Math.floor(mcData.numFrames / 2), -1);
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
}