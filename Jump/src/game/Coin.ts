class Coin extends Reward{

    private static main:Game;

    public static coins:Coin[] = [];

    private static pool:Coin[] = [];

    private static disWithHuman:number;

    public static isMovingToHuman:boolean = false;

    private static tmpVec0:number[] = [0, 0];

    private static tmpVec1:number[] = [0, 0];

    private static tmpVec2:number[] = [0, 0];

    private static tmpVec3:number[] = [0, 0];

    public isMovingToHuman:boolean = false;

    public static init(_main:Game):void{

        this.main = _main;

        let dis:number = Main.config.gameConfig.humanLength * 0.5 + Main.config.gameConfig.humanRadius + Main.config.gameConfig.coinRadius;

        Coin.disWithHuman = dis * dis;
    }

    public reset():void{

        this.isMovingToHuman = false;

        this.parent.removeChild(this);

        Coin.pool.push(this);
    }

    public update(_dt:number):void{

        Coin.tmpVec0[0] = this.worldX;

        Coin.tmpVec0[1] = this.worldY;

        if(this.isMovingToHuman || (Coin.isMovingToHuman && p2.vec2.distance(Coin.tmpVec0, Human.human.position) < Main.config.gameConfig.coinMoveToHumanRadius)){

            this.isMovingToHuman = true;

            Coin.tmpVec1[0] = this.xSpeed;

            Coin.tmpVec1[1] = this.ySpeed;

            let length = p2.vec2.length(Coin.tmpVec1);

            p2.vec2.sub(Coin.tmpVec2, Human.human.position, Coin.tmpVec0);

            p2.vec2.normalize(Coin.tmpVec3, Coin.tmpVec2);

            p2.vec2.normalize(Coin.tmpVec2, Coin.tmpVec1);

            p2.vec2.lerp(Coin.tmpVec0, Coin.tmpVec2, Coin.tmpVec3, Main.config.gameConfig.coinMoveToHumanAngularSpeed);

            if(length < Main.config.gameConfig.coinMoveToHumanSpeed){

                length = Main.config.gameConfig.coinMoveToHumanSpeed;
            }

            this.xSpeed = Coin.tmpVec0[0] * length;

            this.ySpeed = Coin.tmpVec0[1] * length;

            this.worldX += (Coin.tmpVec1[0] + this.xSpeed) * _dt * 0.0005;

            this.worldY += (Coin.tmpVec1[1] + this.ySpeed) * _dt * 0.0005;

            super.updateDisplaysPosition();
        }
        else{

            super.update(_dt);
        }
    }

    public static create(_container:egret.DisplayObjectContainer, _xSpeed:number, _jumpHeight:number, _x:number):void{

        let coin:Coin;

        if(this.pool.length > 0){

            coin = this.pool.pop();
        }
        else{

            let shape:egret.Shape = new egret.Shape();

            shape.graphics.beginFill(0x000000);

            shape.graphics.drawCircle(0, 0, Main.config.gameConfig.coinRadius * Main.config.gameConfig.factor);

            shape.graphics.endFill();

            coin = new Coin();

            coin.addChild(shape);

            coin.touchChildren = false;
        }

        _container.addChild(coin);

        coin.radius = Main.config.gameConfig.coinRadius;

        coin.worldX = _x;

        let posIndex:number = Math.floor(coin.worldX / Main.config.gameConfig.unitWidth);

        let minY:number = (posIndex + 1) * Main.config.gameConfig.unitHeight;

        coin.worldY = minY + _jumpHeight;

        coin.xSpeed = _xSpeed;

        coin.ySpeed = 0;

        coin.jumpHeight = _jumpHeight;

        coin.updateDisplaysPosition();

        this.coins.push(coin);
    }

    public static update(_dt:number):void{

        for(let i:number = this.coins.length - 1 ; i > -1 ; i--){

            let coin:Coin = this.coins[i];

            coin.update(_dt);

            if(coin.isHitHuman(Coin.disWithHuman)){

                this.main.moneyChange(Main.config.gameConfig.coinMoneyChange * (this.main.isCoinDouble ? Main.config.gameConfig.coinDoubleFix : 1));

                coin.reset();

                this.coins.splice(i, 1);
            }
            else{

                if(coin.parent.parent.y + coin.y - coin.radius * Main.config.gameConfig.factor > coin.stage.stageHeight){

                    coin.reset();

                    this.coins.splice(i, 1);
                }
            }
        }
    }

    public static reset():void{

        for(let i:number = 0, m:number = this.coins.length ; i < m ; i++){

            let coin:Coin = this.coins[i];

            coin.reset();
        }

        this.coins.length = 0;
    }
}