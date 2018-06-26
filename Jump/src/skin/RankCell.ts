class RankCell extends eui.ItemRenderer {

	public img:eui.Image;

	public nameLabel:eui.Label;

	public challengeLabel:eui.Label;

	public endlessLabel:eui.Label;

	public constructor() {
		super();
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
	}
	
	public dataChanged():void{

		let playerData:userGameData = <userGameData>this.data;

		WeixinData.getPic(playerData.avatarUrl, this.getPic.bind(this));

		this.nameLabel.text = playerData.nickname;

		let challengeScore:string = KVDataTools.getValue(playerData.KVDataList, Main.CHALLENGE_SCORE);

		if(!challengeScore){

			challengeScore = "0";
		}

		this.challengeLabel.text = challengeScore;

		let endlessScore:string = KVDataTools.getValue(playerData.KVDataList, Main.ENDLESS_SCORE);

		if(!endlessScore){

			endlessScore = "0";
		}

		this.endlessLabel.text = endlessScore;
	}

	private getPic(_tex:egret.Texture):void{

		this.img.texture = _tex;
	}
}