enum HumanJumpResult{

    CANNOT,
    LADDER,
    HUMAN,
    LINE,
}

class Human extends BodyObj{

    public static conBody:BodyObj;

    public static humanArr:Human[] = [];

    private jumpDisableTime:number = 0;

    private length:number;

    private radius:number;

    public updateDisplaysPosition(_dt:number):void{

        // if(Math.abs(this.previousPosition[0] - this.position[0]) < Math.abs(Human.humanSleepXFix) * _dt * 0.001 && Math.abs(this.previousPosition[1] - this.position[1]) < 0.0001){

        for(let i:number = Coin.coins.length - 1; i > -1; i--){

            let coin:Coin = Coin.coins[i];

            if(this.world.overlapKeeper.bodiesAreOverlapping(this, coin)){

                Coin.release(coin);
            }
        }

        if(Math.abs(this.previousPosition[0] - this.position[0]) < Math.abs(Main.config.humanSleepXFix) * _dt * 0.001){

            if(this.velocity[0] > 0){

                this.position[0] = this.previousPosition[0] + Main.config.humanSleepXFix * _dt * 0.001;
            }
            else{

                this.position[0] = this.previousPosition[0] - Main.config.humanSleepXFix * _dt * 0.001;
            }
        }

        super.updateDisplaysPosition(_dt);

        if(this.jumpDisableTime > _dt){

            this.jumpDisableTime -= _dt;
        }
        else if(this.jumpDisableTime > 0){

            this.jumpDisableTime = 0;
        }
    }

    public checkCanJump():HumanJumpResult{

        if(this.jumpDisableTime == 0){

            for(let i:number = 0, m:number = Line.lineArr.length; i < m ; i++){

                let line:Line = Line.lineArr[i];

                if(Math.abs(this.position[1] - line.worldY) < Main.config.humanLength * 0.5 + Main.config.humanRadius + Main.config.lineWidth * 0.5){

                    return HumanJumpResult.LINE;
                }
            }
            
            if(this.world.overlapKeeper.bodiesAreOverlapping(this, Human.conBody)){

                return HumanJumpResult.LADDER;
            }

            for(let i:number = 0, m:number = Human.humanArr.length ; i < m ; i++){

                let human:Human = Human.humanArr[i];

                if(human == this){

                    continue;
                }

                if(this.world.overlapKeeper.bodiesAreOverlapping(this, human) && this.position[1] > human.position[1]){

                    return HumanJumpResult.HUMAN;
                }
            }
        }

        return HumanJumpResult.CANNOT;
    }

    public jump(_jumpAngle:number, _jumpForce:number[]):void{

        // let angle:number = this.angle;

        // let x:number = this.position[0] - Math.cos(angle) * this.length * 0.5;

        // let y:number = this.position[1] - Math.sin(angle) * this.length * 0.5;

        // x += Math.cos(_jumpAngle) * this.length * 0.5;

        // y += Math.sin(_jumpAngle) * this.length * 0.5;

        // this.position[0] = x;

        // this.position[1] = y;

        this.angle = _jumpAngle;

        // this.previousAngle = _jumpAngle;

        this.jumpDisableTime = Main.config.jumpDisableTime;

        this.angularVelocity = 0;

        this.applyForce(_jumpForce, [0,0]);
    }

    public static create(_world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _pos:number[]):Human{
        
        let human:Human = new Human({ mass: 1 });

        this.initHuman(human, _world, _length, _radius, _container, _mat, 0xffff00, _pos);

        return human;
    }

    protected static initHuman(_human:Human, _world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _color:number, _pos:number[]):void{

        _human.allowSleep = false;

        _human.length = _length;

        _human.radius = _radius;

        var boxShape: p2.Capsule = new p2.Capsule({length: _length, radius: _radius});

        _human.addShape(boxShape);

        boxShape.material = _mat;

        boxShape.collisionGroup = Main.HUMAN_GROUP;

        boxShape.collisionMask = Main.HUMAN_GROUP | Main.LADDER_GROUP | Main.COIN_GROUP;

        let width = (_length + _radius * 2) * Main.config.factor;
        let height = _radius * 2 * Main.config.factor;

        let humanDisplay:egret.Shape = new egret.Shape();
        humanDisplay.graphics.beginFill(_color);
        humanDisplay.graphics.drawRect(0,0,width,height);
        humanDisplay.graphics.endFill();

        humanDisplay.width = width;
        humanDisplay.height = height;

        humanDisplay.anchorOffsetX = width / 2;
        humanDisplay.anchorOffsetY = height / 2;

        _human.displays = [humanDisplay];

        _world.addBody(_human);

        _container.addChild(humanDisplay);

        this.humanArr.push(_human);

        _human.position[0] = _pos[0];

        _human.position[1] = _pos[1];

        _human.updateDisplaysPosition(0);
    }
}