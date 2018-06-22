enum ItemEffect{

    FEATHER,
    DOUBLE,
    BIG,
    MAGNET,
    SLOW
}

class Item extends Reward{

    public static getItemCallBack:(_effect:ItemEffect)=>void;

    public static items:Item[] = [];

    private static pool:Item[] = [];

    private static itemEffectLength:number;

    public effect:ItemEffect;

    private static disWithHuman:number;

    public updateDisplaysPosition(_dt?:number):void{

        if(!Item.disWithHuman){

            Item.disWithHuman = Main.config.itemRadius + Main.config.humanLength * 0.5 + Main.config.humanRadius + Main.config.collisionCheckFix;
        }

        if(p2.vec2.distance(this.position, Human.human.position) < Item.disWithHuman){

            this.shapes[0].collisionMask = this.shapes[0].collisionMask | Main.HUMAN_GROUP;
        }
        else{

            this.shapes[0].collisionMask = this.shapes[0].collisionMask & ~Main.HUMAN_GROUP;
        }


        let posIndex:number = Math.floor(this.position[0] / Main.config.unitWidth);

        let minX:number = posIndex * Main.config.unitWidth;

        let maxX:number = minX + Main.config.unitWidth;

        let minY:number = (posIndex + 1) * Main.config.unitHeight;

        let maxY:number = minY + Main.config.unitHeight;

        if(this.position[1] - Main.config.itemRadius - Main.config.collisionCheckFix < minY){

            this.shapes[0].collisionMask = this.shapes[0].collisionMask | Main.LADDER_GROUP;
        }
        else if(this.position[1] - Main.config.itemRadius - Main.config.collisionCheckFix < maxY && this.position[0] + Main.config.itemRadius + Main.config.collisionCheckFix > maxX){

            this.shapes[0].collisionMask = this.shapes[0].collisionMask | Main.LADDER_GROUP;
        }
        else{

            this.shapes[0].collisionMask = this.shapes[0].collisionMask & ~Main.LADDER_GROUP;
        }

        super.updateDisplaysPosition();
    }

    public static create(_world:p2.World, _container:egret.DisplayObjectContainer, _mat:p2.Material, _x:number, _y:number):void{

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

            itemShape.collisionMask = 0;

            itemShape.material = _mat;

            item.addShape(itemShape);

            let itemDisplay:egret.Shape = new egret.Shape();

            itemDisplay.graphics.beginFill(0xffff00);

            itemDisplay.graphics.drawCircle(0,0,Main.config.itemRadius * Main.config.factor);

            itemDisplay.graphics.endFill();

            item.displays = [itemDisplay];
        }

        item.setPosition(_x, _y);

        _world.addBody(item);

        item.applyForce(Main.config.itemForce, BodyObj.zeroPoint);

        _container.addChild(item.displays[0]);

        this.items.push(item);

        item.updateDisplaysPosition();
        
        if(!this.itemEffectLength){

            this.itemEffectLength = Object.keys(ItemEffect).length / 2;
        }

        item.effect = Math.floor(Math.random() * this.itemEffectLength);
    }

    public static update():void{

        for(let i:number = this.items.length - 1 ; i > -1 ; i--){

            let item:Item = this.items[i];

            if(item.overlaps(Human.human)){

                this.getItemCallBack(item.effect);

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