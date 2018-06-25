class GameAlertPanel extends eui.Component implements  eui.UIComponent {
	public constructor() {
		super();

		this.skinName = "resource/eui_skins/game/GameAlertPanel.exml";
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
	}
	
	public message:eui.Label;

	public bt:eui.Button;
}