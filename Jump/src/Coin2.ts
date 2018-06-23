class Coin2 extends Reward{

    public static coins:Coin2[] = [];

    private static pool:Coin2[] = [];

    private static disWithHuman:number;

    public static init():void{

        let dis:number = Main.config.humanLength * 0.5 + Main.config.humanRadius + Main.config.coinRadius;

        Coin2.disWithHuman = dis * dis;
    }

    public reset():void{

        this.parent.removeChild(this);

        Coin2.pool.push(this);
    }

    public static create(_container:egret.DisplayObjectContainer, _xSpeed:number, _jumpHeight:number, _x:number):void{

        let coin:Coin2;

        if(this.pool.length > 0){

            coin = this.pool.pop();
        }
        else{

            let shape:egret.Shape = new egret.Shape();

            shape.graphics.beginFill(0x000000);

            shape.graphics.drawCircle(0, 0, Main.config.coinRadius * Main.config.factor);

            shape.graphics.endFill();

            coin = new Coin2();

            coin.addChild(shape);

            coin.touchChildren = false;
        }

        _container.addChild(coin);

        coin.radius = Main.config.coinRadius;

        coin.worldX = _x;

        let posIndex:number = Math.floor(coin.worldX / Main.config.unitWidth);

        let minY:number = (posIndex + 1) * Main.config.unitHeight;

        coin.worldY = minY + _jumpHeight;

        coin.xSpeed = _xSpeed;

        coin.ySpeed = 0;

        coin.jumpHeight = _jumpHeight;

        coin.updateDisplaysPosition();

        this.coins.push(coin);
    }

    public static update(_dt:number):void{

        for(let i:number = this.coins.length - 1 ; i > -1 ; i--){

            let coin:Coin2 = this.coins[i];

            coin.update(_dt);

            if(coin.isHitHuman(Coin2.disWithHuman)){

                coin.reset();

                this.coins.splice(i, 1);
            }
            else{

                if(coin.parent.parent.y + coin.y - coin.radius * Main.config.factor > coin.stage.stageHeight){

                    coin.reset();

                    this.coins.splice(i, 1);
                }
            }
        }
    }
}