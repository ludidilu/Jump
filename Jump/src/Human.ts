class Human extends BodyObj{

    public static humanSleepXFix:number;

    public static conBody:BodyObj;

    public static humanArr:Human[] = [];

    public static jumpDisableTime:number;

    public static fixHumanPosX:boolean = false;

    private jumpDisableTime:number = 0;

    private length:number;

    private radius:number;

    public updateDisplaysPosition(_dt:number):void{

        // if(Math.abs(this.previousPosition[0] - this.position[0]) < Math.abs(Human.humanSleepXFix) * _dt * 0.001 && Math.abs(this.previousPosition[1] - this.position[1]) < 0.0001){

        if(Human.fixHumanPosX && Math.abs(this.previousPosition[0] - this.position[0]) < Math.abs(Human.humanSleepXFix) * _dt * 0.001){

            // console.log("fix:" + this.velocity[0]);

            if(this.velocity[0] > 0){

                this.position = [this.previousPosition[0] + Human.humanSleepXFix * _dt * 0.001, this.position[1]];
            }
            else{

                this.position = [this.previousPosition[0] - Human.humanSleepXFix * _dt * 0.001, this.position[1]];
            }
        }

        super.updateDisplaysPosition(_dt);
    }

    public checkCanJump():boolean{

        if(this.jumpDisableTime == 0){
            
            if(this.world.overlapKeeper.bodiesAreOverlapping(this, Human.conBody)){

                return true;
            }

            for(let i:number = 0 ; i < Human.humanArr.length ; i++){

                let human:Human = Human.humanArr[i];

                if(human ==  this){

                    continue;
                }

                if(this.world.overlapKeeper.bodiesAreOverlapping(this, human) && this.position[1] > human.position[1]){

                    return true;
                }
            }
        }

        return false;
    }

    public jump(_jumpAngle:number, _jumpForce:number[]):void{

        let angle:number = this.angle;

        let x:number = this.position[0] - Math.cos(angle) * this.length * 0.5;

        let y:number = this.position[1] - Math.sin(angle) * this.length * 0.5;

        x += Math.cos(_jumpAngle) * this.length * 0.5;

        y += Math.sin(_jumpAngle) * this.length * 0.5;

        this.position = [x,y];

        this.angle = _jumpAngle;

        this.previousAngle = _jumpAngle;

        this.jumpDisableTime = Human.jumpDisableTime;

        this.angularVelocity = 0;

        this.applyForce(_jumpForce, [0,0]);

        SuperTicker.getInstance().addEventListener(this.jumpReal, this);

        // egret.Ticker.getInstance().register(this.jumpReal, this);
    }

    private jumpReal(_dt:number):void{

        if(this.jumpDisableTime > _dt){

            this.jumpDisableTime -= _dt;
        }
        else if(this.jumpDisableTime > 0){

            this.jumpDisableTime = 0;

            SuperTicker.getInstance().removeEventListener(this.jumpReal, this);
        }
    }

    public static create(_world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _pos:number[]):Human{
        
        let human:Human = new Human({ mass: 1 });

        Human.initHuman(human, _world, _length, _radius, _container, _mat, 0xffff00, _pos);

        return human;
    }

    protected static initHuman(_human:Human, _world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _color:number, _pos:number[]):void{

        _human.allowSleep = false;

        _human.length = _length;

        _human.radius = _radius;

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

        Human.humanArr.push(_human);

        _human.position = _pos;

        _human.updateDisplaysPosition(0);
    }
}