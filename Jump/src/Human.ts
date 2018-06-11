class Human extends BodyObj{

    public static humanSleepXFix:number;

    public static conBody:BodyObj;

    public static humanArr:Human[] = [];

    public static jumpDisableTime:number;

    private jumpDisableTime:number = 0;

    private length:number;

    private radius:number;

    public updateDisplaysPosition(_dt:number):void{

        // if(Math.abs(this.previousPosition[0] - this.position[0]) < Math.abs(Human.humanSleepXFix) * _dt * 0.001 && Math.abs(this.previousPosition[1] - this.position[1]) < 0.0001){

        if(Math.abs(this.previousPosition[0] - this.position[0]) < Math.abs(Human.humanSleepXFix) * _dt * 0.001){

            if(this.velocity[0] > 0){

                this.position[0] = this.previousPosition[0] + Human.humanSleepXFix * _dt * 0.001;
            }
            else{

                this.position[0] = this.previousPosition[0] - Human.humanSleepXFix * _dt * 0.001;
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

        // let angle:number = this.angle;

        // let x:number = this.position[0] - Math.cos(angle) * this.length * 0.5;

        // let y:number = this.position[1] - Math.sin(angle) * this.length * 0.5;

        // x += Math.cos(_jumpAngle) * this.length * 0.5;

        // y += Math.sin(_jumpAngle) * this.length * 0.5;

        // this.position[0] = x;

        // this.position[1] = y;

        this.angle = _jumpAngle;

        // this.previousAngle = _jumpAngle;

        this.jumpDisableTime = Human.jumpDisableTime;

        this.angularVelocity = 0;

        this.applyForce(_jumpForce, [0,0]);
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

        _world.addBody(_human);

        _container.addChild(humanDisplay);

        Human.humanArr.push(_human);

        _human.position[0] = _pos[0];

        _human.position[1] = _pos[1];

        _human.updateDisplaysPosition(0);
    }

    public reset():void{

        this.velocity = [0,0];

        this.angularVelocity = 0;

        this.angle = 0;
    }
}