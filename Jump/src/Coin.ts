class Coin extends BodyObj{

    public static coins:Coin[] = [];

    private static pool:Coin[] = [];

    public static create(_world:p2.World, _container:egret.DisplayObjectContainer, _mat:p2.Material, _pos:number[]):void{

        let coin:Coin;

        if(this.pool.length > 0){

            coin = this.pool.pop();
        }
        else{

            coin = new Coin({mass: 0.0001, dampling: Main.config.coinDampling, angularDampling:Main.config.coinAngularDampling});

            let coinShape:p2.Circle = new p2.Circle({radius: Main.config.coinRadius});

            coinShape.collisionGroup = Main.COIN_GROUP;

            coinShape.collisionMask = Main.LADDER_GROUP | Main.HUMAN_GROUP;

            coinShape.material = _mat;

            coin.addShape(coinShape);

            let coinDisplay:egret.Shape = new egret.Shape();

            coinDisplay.graphics.beginFill(0x000000);

            coinDisplay.graphics.drawCircle(0,0,Main.config.coinRadius * Main.config.factor);

            coinDisplay.graphics.endFill();

            coin.displays = [coinDisplay];
        }

        coin.position[0] = _pos[0];

        coin.position[1] = _pos[1];

        coin.applyForce(Main.config.coinForce, [0,0]);

        _world.addBody(coin);

        _container.addChild(coin.displays[0]);

        this.coins.push(coin);

        coin.updateDisplaysPosition();
    }

    public static update():void{

        for(let i:number = this.coins.length - 1 ; i > -1 ; i--){

            let coin:Coin = this.coins[i];

            coin.updateDisplaysPosition();

            let coinDisplay:egret.DisplayObject = coin.displays[0];

            if(coinDisplay.parent.parent.y + coinDisplay.y - Main.config.coinRadius * Main.config.factor > coinDisplay.stage.stageHeight){

                this.release(coin);
            }
        }
    }

    public static reset():void{

        for(let i:number = this.coins.length - 1 ; i > -1 ; i--){

            let coin:Coin = this.coins[i];

            this.release(coin);
        }
    }

    public static release(_coin:Coin):void{

        _coin.reset();

        _coin.world.removeBody(_coin);

        let display:egret.DisplayObject = _coin.displays[0];

        display.parent.removeChild(display);

        this.pool.push(_coin);

        this.coins.splice(this.coins.indexOf(_coin), 1);
    }
}