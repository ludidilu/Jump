class GameMainPanel extends eui.Component implements  eui.UIComponent {
	public constructor() {
		super();

		this.skinName = "resource/eui_skins/game/GameMainPanel.exml";
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
	}

	public score:eui.Label;

	public money:eui.Label;

	public onlineGroup:eui.Group;

	public createBt:eui.Button;

	public joinBt:eui.Button;

	public playerNum:eui.EditableText;
}