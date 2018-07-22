class ChangeClothMainPanel extends eui.Component implements  eui.UIComponent {

	private readonly NAME_ARR:string[] = ["huotui", "kaoya", "peigen", "qiezi", "regou", "wumaoji", "xiangchang", "xiangjiao", "xianyu", "xiaolongxia"];

	private readonly UNIT_WIDTH:number = 250;

	private readonly SCALE_CHANGE:number = 1.3;

	private readonly TWEEN_TIME:number = 1;

	public constructor() {
		super();

		this.skinName = "resource/eui_skins/changeCloth/ChangeClothMainPanel.exml";
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}

	private touchBegin(e:egret.TouchEvent):void{

		this.downX = e.localX;
	}

	private touchMove(e:egret.TouchEvent):void{

		let dx:number = e.localX - this.downX;

		this.downX = e.localX;

		this.nowX -= dx;

		this.refresh();
	}

	private tween(_v:number):void{

		this.nowX = _v;

		this.refresh();
	}

	private async touchEnd(e:egret.TouchEvent){

		let tx:number = Math.floor((this.nowX + 0.5 * this.UNIT_WIDTH) / this.UNIT_WIDTH) * this.UNIT_WIDTH;

		this.bg.touchEnabled = false;

		await SuperTween.getInstance().toAsync(this.nowX, tx, Math.abs(tx - this.nowX) * this.TWEEN_TIME, this.tween.bind(this));

		this.bg.touchEnabled = true;
	}

	private bpArr:egret.DisplayObject[] = [];

	protected childrenCreated():void
	{
		super.childrenCreated();

		this.bg.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);

		this.bg.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMove, this);

		this.bg.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);

		for(let i:number = 0 ; i < this.NAME_ARR.length ; i++){

			let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

			container.width = this.UNIT_WIDTH;

			container.anchorOffsetX = 0.5 * this.UNIT_WIDTH;

			container.x = this.UNIT_WIDTH * i;

			let tex:egret.Texture = RES.getRes("cloth_json.cloth_guagou");

			let bp:egret.Bitmap = new egret.Bitmap(tex);

			bp.x = 0.5 * this.UNIT_WIDTH - 0.5 * bp.width;

			container.addChild(bp);

			let tex2:egret.Texture = RES.getRes("cloth_json." + this.NAME_ARR[i]);

			let bp2:egret.Bitmap = new egret.Bitmap(tex2);

			// bp.anchorOffsetX = 0.5 * bp.width;

			// bp.x = this.UNIT_WIDTH * i;

			bp2.x = 0.5 * this.UNIT_WIDTH - 0.5 * bp2.width;

			bp2.y = bp.height - 80;

			container.addChild(bp2);

			this.main.addChild(container);

			this.bpArr.push(container);
		}

		this.nowX = 0;

		this.refresh();
	}

	private refresh():void{

		if(this.nowX < 0){

			this.nowX = 0;
		}
		else if(this.nowX > (this.NAME_ARR.length - 1) * this.UNIT_WIDTH){

			this.nowX = (this.NAME_ARR.length - 1) * this.UNIT_WIDTH;
		}

		let tmp:number = this.nowX / this.UNIT_WIDTH + 0.5;

		let index:number = Math.floor(tmp);

		let scaleAbs:number = Math.abs(tmp - index - 0.5);

		let scale:number = this.SCALE_CHANGE + (1 - this.SCALE_CHANGE) * scaleAbs * 2;

		let bp:egret.DisplayObject;

		for(let i:number = 0 ; i < index ; i++){

			bp = this.bpArr[i];

			bp.scaleX = bp.scaleY = 1;

			bp.x = i * this.UNIT_WIDTH - (scale - 1) * 0.5 * this.UNIT_WIDTH;
		}

		bp = this.bpArr[index];

		bp.scaleX = bp.scaleY = scale;

		bp.x = index * this.UNIT_WIDTH;

		for(let i:number = index + 1 ; i < this.NAME_ARR.length ; i++){

			bp = this.bpArr[i];

			bp.scaleX = bp.scaleY = 1;

			bp.x = i * this.UNIT_WIDTH + (scale - 1) * 0.5 * this.UNIT_WIDTH;
		}

		this.main.x = 0.5 * this.stage.stageWidth - this.nowX;
	}
	
	public main:eui.Group;

	public bg:eui.Rect;

	private nowX:number;

	private downX:number;
}