class BgContainer extends egret.DisplayObjectContainer{

    private readonly OBJ_ARR:string[] = ["xiao-03", "xiao-04", "xiao-05"];

    private readonly OBJ_SHOW_GAP:number = 100;

    private readonly OBJ_SHOW_PROBABILITY:number = 0.005;

    private readonly OBJ_SHOW_AGAIN_PROBABILITY:number = 0.5;

    private bgTex:egret.Texture;

    private bg:egret.Bitmap;

    private bgMoveSpeed:number = 0.2;

    private gameContainer:egret.DisplayObjectContainer;

    private objPool:egret.Bitmap[] = [];

    private showObjArr:egret.Bitmap[] = [];

    private lastShowY:number = 0;

    public init(_gameContainer:egret.DisplayObjectContainer):void{

        this.gameContainer = _gameContainer;

        this.bgTex = RES.getRes("game_bg_png");

        this.bg = new egret.Bitmap(this.bgTex);

        this.bg.fillMode = egret.BitmapFillMode.REPEAT;

        this.bg.width = (Math.ceil(this.stage.stageWidth / 2 / this.bgTex.textureWidth) + 1) * this.bgTex.textureWidth;

        this.bg.height = (Math.ceil(this.stage.stageHeight / 2 / this.bgTex.textureHeight) + 1) * this.bgTex.textureHeight;

        this.bg.scaleX = 2;

        this.bg.scaleY = 2;

        this.addChild(this.bg);

        this.bg.touchEnabled = true;

        for(let i:number = 0 ; i < this.OBJ_ARR.length ; i++){

            let tex:egret.Texture = RES.getRes("game_json." + this.OBJ_ARR[i]);

            let obj:egret.Bitmap = new egret.Bitmap(tex);

            this.objPool.push(obj);
        }
    }

    public update():void{

        this.x += (Human.human.containerX - this.gameContainer.x) * this.bgMoveSpeed;

        this.y += (Human.human.containerY - this.gameContainer.y) * this.bgMoveSpeed;

        if(this.x + this.bg.x + this.bg.width * 2 < this.stage.stageWidth){

            this.bg.x += this.bgTex.textureWidth * 2;
        }

        if(this.y + this.bg.y > 0){

            this.bg.y -= this.bgTex.textureHeight * 2;
        }

        for(let i:number = this.showObjArr.length - 1 ; i > -1 ; i--){

            let showObj:egret.Bitmap = this.showObjArr[i];

            if(this.x + showObj.x + showObj.width < 0 || this.y + showObj.y > this.stage.stageHeight){

                this.removeChild(showObj);

                this.objPool.push(showObj);

                this.showObjArr.splice(i, 1);
            }
        }

        if(this.y - this.lastShowY > this.OBJ_SHOW_GAP && Math.random() < this.OBJ_SHOW_PROBABILITY){

            let showX:number = null;

            while(this.objPool.length > 0){

                if(Math.random() < this.OBJ_SHOW_AGAIN_PROBABILITY){

                    let index:number = Math.floor(Math.random() * this.objPool.length);

                    let showObj:egret.Bitmap = this.objPool[index];

                    this.objPool.splice(index, 1);

                    this.addChild(showObj);

                    if(showX === null){

                        showObj.x = this.bg.x + this.stage.stageWidth + Math.random() * 1200;
                    }
                    else{

                        showObj.x = showX + 100 + Math.random() * 300;
                    }

                    showX = showObj.x + showObj.width;

                    showObj.y = this.bg.y - 100 - showObj.height + (Math.random() - 0.5) * 100;

                    this.showObjArr.push(showObj);
                }
                else{

                    break;
                }
            }
        }
    }

    public reset():void{

        this.x = this.y = this.bg.x = this.bg.y = this.lastShowY = 0;

        for(let i:number = this.showObjArr.length - 1 ; i > -1 ; i--){

            let showObj:egret.Bitmap = this.showObjArr[i];

            this.removeChild(showObj);

            this.objPool.push(showObj);
        }

        this.showObjArr.length = 0;
    }
}