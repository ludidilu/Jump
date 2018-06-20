class Coin extends Reward{

    public static main:Main;

    public static coins:Coin[] = [];

    private static pool:Coin[] = [];

    public static human:Human;

    private static tmpVec1:number[] = [0,0];

    private static tmpVec2:number[] = [0,0];

    private static tmpVec3:number[] = [0,0];

    public static isMovingToHuman:boolean = false;

    public updateDisplaysPosition(_dt?:number):void{

        if(Coin.isMovingToHuman && p2.vec2.distance(this.position, Coin.human.position) < Main.config.coinMoveToHumanRadius){

            let length = p2.vec2.length(this.velocity);

            p2.vec2.sub(Coin.tmpVec1, Coin.human.position, this.position);

            p2.vec2.normalize(Coin.tmpVec2, Coin.tmpVec1);

            p2.vec2.normalize(Coin.tmpVec1, this.velocity);

            p2.vec2.lerp(Coin.tmpVec3, Coin.tmpVec1, Coin.tmpVec2, Main.config.coinMoveToHumanAngularSpeed);

            if(length < Main.config.coinMoveToHumanSpeed){

                length = Main.config.coinMoveToHumanSpeed;
            }

            this.velocity[0] = Coin.tmpVec3[0] * length;

            this.velocity[1] = Coin.tmpVec3[1] * length;
        }

        super.updateDisplaysPosition();
    }

    public static create(_world:p2.World, _container:egret.DisplayObjectContainer, _mat:p2.Material, _x:number, _y:number):void{

        let coin:Coin;

        if(this.pool.length > 0){

            coin = this.pool.pop();
        }
        else{

            coin = new Coin({mass: 0.0001, dampling: Main.config.coinDampling, angularDampling:Main.config.coinAngularDampling, gravityScale:Main.config.coinGravityScale, fixedRotation:true});

            coin.allowSleep = false;

            coin.bodyType = BodyObjType.REWARD;

            let coinShape:p2.Circle = new p2.Circle({radius: Main.config.coinRadius});

            coinShape.collisionGroup = Main.REWARD_GROUP;

            coinShape.collisionMask = Main.LADDER_GROUP | Main.HUMAN_GROUP;

            coinShape.material = _mat;

            coin.addShape(coinShape);

            let coinDisplay:egret.Shape = new egret.Shape();

            coinDisplay.graphics.beginFill(0x000000);

            coinDisplay.graphics.drawCircle(0,0,Main.config.coinRadius * Main.config.factor);

            coinDisplay.graphics.endFill();

            coin.displays = [coinDisplay];
        }

        coin.setPosition(_x, _y);

        _world.addBody(coin);

        coin.applyForce(Main.config.coinForce, BodyObj.zeroPoint);

        _container.addChild(coin.displays[0]);

        this.coins.push(coin);

        coin.updateDisplaysPosition();
    }

    public static update():void{

        for(let i:number = this.coins.length - 1 ; i > -1 ; i--){

            let coin:Coin = this.coins[i];

            if(coin.isOver){

                this.main.moneyChange(Main.config.coinMoneyChange * (this.main.isCoinDouble ? Main.config.coinDoubleFix : 1));

                coin.reset();

                this.coins.splice(i, 1);
            }
            else{

                coin.updateDisplaysPosition();

                let coinDisplay:egret.DisplayObject = coin.displays[0];

                if(coinDisplay.parent.parent.y + coinDisplay.y - Main.config.coinRadius * Main.config.factor > coinDisplay.stage.stageHeight){

                    coin.reset();

                    this.coins.splice(i, 1);
                }
            }
        }
    }

    public reset():void{

        this.isOver = false;

        this.world.removeBody(this);

        let display:egret.DisplayObject = this.displays[0];

        display.parent.removeChild(display);

        Coin.pool.push(this);

        super.reset();
    }

    public static reset():void{

        for(let i:number = 0, m:number = this.coins.length ; i < m ; i++){

            let coin:Coin = this.coins[i];

            coin.reset();
        }

        this.coins.length = 0;
    }
}