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
	}
	
	public challengeBt:eui.Button;

	public endlessBt:eui.Button;

	public rankBt:eui.Button;

	public scoreGroup:eui.Group;

	public challengeScore:eui.Label;

	public endlessScore:eui.Label;

	public money:eui.Label;
}