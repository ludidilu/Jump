enum ItemEffect{

    FEATHER,
    DOUBLE,
    BIG,
    MAGNET,
    SLOW
}

class Item extends Reward{

    public static items:Item[] = [];

    private static pool:Item[] = [];

    public static human:Human;

    private static itemEffectLength:number;

    public effect:ItemEffect;

    public static create(_world:p2.World, _container:egret.DisplayObjectContainer, _mat:p2.Material, _pos:number[]):void{

        let item:Item;

        if(this.pool.length > 0){

            item = this.pool.pop();
        }
        else{

            item = new Item({mass: 0.0001, dampling: Main.config.itemDampling, angularDampling:Main.config.itemAngularDampling, gravityScale:Main.config.itemGravityScale, fixedRotation:true});

            item.allowSleep = false;

            item.bodyType = BodyObjType.REWARD;

            let itemShape:p2.Circle = new p2.Circle({radius: Main.config.itemRadius});

            itemShape.collisionGroup = Main.REWARD_GROUP;

            itemShape.collisionMask = Main.LADDER_GROUP | Main.HUMAN_GROUP;

            itemShape.material = _mat;

            item.addShape(itemShape);

            let itemDisplay:egret.Shape = new egret.Shape();

            itemDisplay.graphics.beginFill(0xffff00);

            itemDisplay.graphics.drawCircle(0,0,Main.config.itemRadius * Main.config.factor);

            itemDisplay.graphics.endFill();

            item.displays = [itemDisplay];
        }

        item.setPosition(_pos[0], _pos[1]);

        if(!this.itemEffectLength){

            this.itemEffectLength = Object.keys(ItemEffect).length / 2;
        }

        item.effect = Math.floor(Math.random() * this.itemEffectLength);

        item.applyForce(Main.config.itemForce, BodyObj.zeroPoint);

        _world.addBody(item);

        _container.addChild(item.displays[0]);

        this.items.push(item);

        item.updateDisplaysPosition();
    }

    public static update():void{

        for(let i:number = this.items.length - 1 ; i > -1 ; i--){

            let item:Item = this.items[i];

            if(item.isOver){

                item.reset();

                this.items.splice(i, 1);
            }
            else{

                item.updateDisplaysPosition();

                let itemDisplay:egret.DisplayObject = item.displays[0];

                if(itemDisplay.parent.parent.y + itemDisplay.y - Main.config.itemRadius * Main.config.factor > itemDisplay.stage.stageHeight){

                    item.reset();

                    this.items.splice(i, 1);
                }
            }
        }
    }

    public reset():void{

        this.isOver = false;

        this.world.removeBody(this);

        let display:egret.DisplayObject = this.displays[0];

        display.parent.removeChild(display);

        Item.pool.push(this);

        super.reset();
    }

    public static reset():void{

        for(let i:number = 0, m:number = this.items.length ; i < m ; i++){

            let item:Item = this.items[i];

            item.reset();
        }

        this.items.length = 0;
    }
}