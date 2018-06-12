class Coin extends BodyObj{

    public static coins:Coin[] = [];

    private static pool:Coin[] = [];

    public static create(_world:p2.World, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _pos:number[]):void{

        let coin:Coin;

        if(this.pool.length > 0){

            coin = this.pool.pop();
        }
        else{

            coin = new Coin();

            let coinShape:p2.Circle = new p2.Circle({radius: _radius});

            coinShape.material = _mat;

            coin.addShape(coinShape);

            let coinDisplay:egret.Shape = new egret.Shape();

            coinDisplay.graphics.beginFill(0x00ffff, 0.5);

            coinDisplay.graphics.drawCircle(0,0,_radius);

            coinDisplay.graphics.endFill();

            coin.displays = [coinDisplay];
        }

        coin.position[0] = _pos[0];

        coin.position[1] = _pos[1];

        _world.addBody(coin);

        _container.addChild(coin.displays[0]);

        coin.updateDisplaysPosition();
    }
}