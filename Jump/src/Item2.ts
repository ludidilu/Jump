class Item2 extends Reward{

    public static items:Item2[] = [];

    private static pool:Item2[] = [];

    private static disWithHuman:number;

    public static init():void{

        let dis:number = Main.config.humanLength * 0.5 + Main.config.humanRadius + Main.config.itemRadius;

        Item2.disWithHuman = dis * dis;
    }

    public reset():void{

        this.parent.removeChild(this);

        Item2.pool.push(this);
    }

    public static create(_container:egret.DisplayObjectContainer, _xSpeed:number, _jumpHeight:number, _x:number):void{

        let item:Item2;

        if(this.pool.length > 0){

            item = this.pool.pop();
        }
        else{

            let shape:egret.Shape = new egret.Shape();

            shape.graphics.beginFill(0xffff00);

            shape.graphics.drawCircle(0, 0, Main.config.itemRadius * Main.config.factor);

            shape.graphics.endFill();

            item = new Item2();

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
    }

    public static update(_dt:number):void{

        for(let i:number = this.items.length - 1 ; i > -1 ; i--){

            let item:Item2 = this.items[i];

            item.update(_dt);

            if(item.isHitHuman(Item2.disWithHuman)){

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
}