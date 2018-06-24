enum ItemEffect{

    FEATHER,
    DOUBLE,
    BIG,
    MAGNET,
    SLOW
}

class Item extends Reward{

    private static getItemCallBack:(_effect:ItemEffect)=>void;

    private static itemEffectLength:number;

    public static items:Item[] = [];

    private static pool:Item[] = [];

    private static disWithHuman:number;

    public effect:ItemEffect;

    public static init(_getItemCallBack:(_effect:ItemEffect)=>void):void{

        this.getItemCallBack = _getItemCallBack;

        let dis:number = Main.config.humanLength * 0.5 + Main.config.humanRadius + Main.config.itemRadius;

        Item.disWithHuman = dis * dis;
    }

    public reset():void{

        this.parent.removeChild(this);

        Item.pool.push(this);
    }

    public static create(_container:egret.DisplayObjectContainer, _xSpeed:number, _jumpHeight:number, _x:number):void{

        let item:Item;

        if(this.pool.length > 0){

            item = this.pool.pop();
        }
        else{

            let shape:egret.Shape = new egret.Shape();

            shape.graphics.beginFill(0xffff00);

            shape.graphics.drawCircle(0, 0, Main.config.itemRadius * Main.config.factor);

            shape.graphics.endFill();

            item = new Item();

            item.addChild(shape);

            item.touchChildren = false;
        }

        _container.addChild(item);

        item.radius = Main.config.itemRadius;

        item.worldX = _x;

        let posIndex:number = Math.floor(item.worldX / Main.config.unitWidth);

        let minY:number = (posIndex + 1) * Main.config.unitHeight;

        item.worldY = minY + _jumpHeight;

        item.xSpeed = _xSpeed;

        item.ySpeed = 0;

        item.jumpHeight = _jumpHeight;

        item.updateDisplaysPosition();

        this.items.push(item);

        if(!this.itemEffectLength){

            this.itemEffectLength = Object.keys(ItemEffect).length / 2;
        }

        item.effect = Math.floor(Math.random() * this.itemEffectLength);
    }

    public static update(_dt:number):void{

        for(let i:number = this.items.length - 1 ; i > -1 ; i--){

            let item:Item = this.items[i];

            item.update(_dt);

            if(item.isHitHuman(Item.disWithHuman)){

                this.getItemCallBack(item.effect);

                item.reset();

                this.items.splice(i, 1);
            }
            else{

                if(item.parent.parent.y + item.y - item.radius * Main.config.factor > item.stage.stageHeight){

                    item.reset();

                    this.items.splice(i, 1);
                }
            }
        }
    }

    public static reset():void{

        for(let i:number = 0, m:number = this.items.length ; i < m ; i++){

            let item:Item = this.items[i];

            item.reset();
        }

        this.items.length = 0;
    }
}