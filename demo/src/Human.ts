class Human extends BodyObj{

    public static humanSleepXFix:number;

    public static conBody:BodyObj;

    public static humanArr:Human[] = [];

    public static jumpDisableTime:number;

    private tick:number = 0;

    private time:number = 0;

    private jumpAngle:number;

    private jumpForce:number[];

    public updateDisplaysPosition(_dt?:number):void{

        if(this.sleepState == p2.Body.SLEEPY || this.sleepState == p2.Body.SLEEPING){

            this.position = [this.position[0] + Human.humanSleepXFix * _dt, this.position[1]];

            this.sleepState = p2.Body.AWAKE;
        }

        super.updateDisplaysPosition(_dt);
    }

    public checkCanJump():boolean{

        if(this.tick == 0 && this.time == 0){
            
            if(this.world.overlapKeeper.bodiesAreOverlapping(this, Human.conBody)){

                return true;
            }

            for(let i:number = 0 ; i < Human.humanArr.length ; i++){

                let human:Human = Human.humanArr[i];

                if(human ==  this){

                    continue;
                }

                if(this.world.overlapKeeper.bodiesAreOverlapping(this, human)){

                    return true;
                }
            }
        }

        return false;
    }

    public jump(_jumpAngle:number, _jumpForce:number[], _jumpForceTick:number):void{

        this.angle = _jumpAngle;

        this.jumpAngle = _jumpAngle;

        this.jumpForce = _jumpForce;

        this.tick = _jumpForceTick;

        this.time = Human.jumpDisableTime;

        this.angularVelocity = 0;

        egret.Ticker.getInstance().register(this.jumpReal, this);
    }

    private jumpReal(_dt:number):void{

        if(this.tick > 0){

            this.tick--;

            this.applyForce(this.jumpForce,[0,0]);
        }

        if(this.time > _dt){

            this.time -= _dt;
        }
        else{

            this.time = 0;

            egret.Ticker.getInstance().unregister(this.jumpReal, this);
        }
    }

    public static create(_world:p2.World, _length:number, _radius:number, _humanSleepSpeedLimit:number, _container:egret.DisplayObjectContainer, _mat:p2.Material):Human{
        
        let human:Human = new Human({ mass: 1 });

        Human.initHuman(human, _world, _length, _radius, _humanSleepSpeedLimit, _container, _mat, 0xffff00);

        return human;
    }

    protected static initHuman(_human:Human, _world:p2.World, _length:number, _radius:number, _humanSleepSpeedLimit:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _color:number):void{

        _human.sleepSpeedLimit = _humanSleepSpeedLimit;

        var boxShape: p2.Capsule = new p2.Capsule({length: _length, radius: _radius});

        _human.addShape(boxShape);

        _world.addBody(_human);
        boxShape.material = _mat;

        let width = ((<p2.Capsule>boxShape).length + (<p2.Capsule>boxShape).radius * 2) * BodyObj.factor;
        let height = (<p2.Capsule>boxShape).radius * 2 * BodyObj.factor;

        let humanDisplay:egret.Shape = new egret.Shape();
        humanDisplay.graphics.beginFill(_color);
        humanDisplay.graphics.drawRect(0,0,width,height);
        humanDisplay.graphics.endFill();

        humanDisplay.width = width;
        humanDisplay.height = height;
        

        humanDisplay.anchorOffsetX = width / 2;
        humanDisplay.anchorOffsetY = height / 2;

        _human.displays = [humanDisplay];
        _container.addChild(humanDisplay);
    }
}