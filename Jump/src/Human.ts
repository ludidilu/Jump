enum HumanJumpResult{

    CANNOT,
    LADDER,
    HUMAN,
    LINE,
}

class Human extends BodyObj{

    public static conBody:BodyObj;

    public static humanDic:{[key:number]:Human} = {};

    private static tmpVec:number[] = [0,0];

    private static tmpVec1:number[] = [0,0];

    private jumpDisableTime:number = 0;

    private jumpForceFix:number = 1;

    public contectLadder:number = 0;

    public contactHuman:{[key:number]:number} = {};

    public id:number;

    public updateDisplaysPosition(_dt:number):void{

        if(Math.abs(this.previousPosition[0] - this.position[0]) < Math.abs(Main.config.humanSleepXFix) * _dt * 0.001){

            if(this.velocity[0] > 0){

                this.position[0] = this.previousPosition[0] + Main.config.humanSleepXFix * _dt * 0.001;
            }
            else{

                this.position[0] = this.previousPosition[0] - Main.config.humanSleepXFix * _dt * 0.001;
            }
        }

        Human.tmpVec[0] = Main.config.humanFixForce[0] * this.mass;

        Human.tmpVec[1] = Main.config.humanFixForce[1] * this.mass;

        p2.vec2.rotate(Human.tmpVec1, Main.config.humanFixForcePoint, this.angle);

        this.applyForce(Human.tmpVec, Human.tmpVec1);

        super.updateDisplaysPosition();

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

                if(Math.abs(this.position[1] - line.worldY) < Main.config.humanLength * 0.5 * Math.abs(Math.sin(this.angle)) + Main.config.humanRadius + Main.config.lineWidth * 0.5){

                    return HumanJumpResult.LINE;
                }
            }

            if(this.contectLadder > 0){

                return HumanJumpResult.LADDER;
            }

            for(let key in this.contactHuman){

                if(this.contactHuman[key] > 0){

                    let human:Human = Human.humanDic[key];

                    if(human.position[1] < this.position[1]){

                        return HumanJumpResult.HUMAN;
                    }
                }
            }
        }

        return HumanJumpResult.CANNOT;
    }

    public jump(_jumpAngle:number, _jumpForce:number[], _jumpPoint:number[]):void{

        // let angle:number = this.angle;

        // let x:number = this.position[0] - Math.cos(angle) * this.length * 0.5;

        // let y:number = this.position[1] - Math.sin(angle) * this.length * 0.5;

        // x += Math.cos(_jumpAngle) * this.length * 0.5;

        // y += Math.sin(_jumpAngle) * this.length * 0.5;

        // this.position[0] = x;

        // this.position[1] = y;

        //---起跳时整体向上抬升
        let lastHeight:number = Math.abs(Math.sin(this.angle));

        let nowHeight:number = Math.abs(Math.sin(_jumpAngle));

        if(nowHeight > lastHeight){

            this.position[1] += (nowHeight - lastHeight) * Main.config.humanLength * 0.5;
        }
        //---

        this.angle = _jumpAngle;

        this.previousAngle = _jumpAngle;

        this.jumpDisableTime = Main.config.jumpDisableTime;

        this.angularVelocity = 0;

        //---起跳时抹去反向速度
        if((_jumpForce[0] > 0 && this.velocity[0] < 0) || (_jumpForce[0] < 0 && this.velocity[0] > 0)){

            this.velocity[0] = 0;
        }
        
        if((_jumpForce[1] > 0 && this.velocity[1] < 0) || (_jumpForce[1] < 0 && this.velocity[1] > 0)){

            this.velocity[1] = 0;
        }
        //---

        Human.tmpVec[0] = _jumpForce[0] * this.jumpForceFix;

        Human.tmpVec[1] = _jumpForce[1] * this.jumpForceFix;

        this.applyForce(Human.tmpVec, _jumpPoint);
    }

    public setMass(_mass:number):void{

        this.mass = _mass;

        this.updateMassProperties();
    }

    public setJumpForceFix(_fix:number):void{

        this.jumpForceFix = _fix;
    }

    public reset():void{

        this.contectLadder = 0;

        for(let key in this.contactHuman){

            let num:number = this.contactHuman[key];

            if(num > 0){

                let human:Human = Human.humanDic[key];

                human.contactHuman[this.id] = 0;

                this.contactHuman[key] = 0;
            }
        }

        super.reset();
    }

    public static create(_world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _pos:number[]):Human{
        
        let human:Human = new Human({mass:1, damping:Main.config.humanDampling, angularDampling:Main.config.humanAngularDampling, gravityScale:Main.config.humanGravityScale});

        human.bodyType = BodyObjType.HUMAN;

        human.id = 0;

        this.initHuman( human, _world, _length, _radius, _container, _mat, 0xffff00, _pos);

        return human;
    }

    protected static initHuman(_human:Human, _world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _color:number, _pos:number[]):void{

        _human.allowSleep = false;

        let boxShape: p2.Capsule = new p2.Capsule({length: _length, radius: _radius});

        boxShape.material = _mat;

        if(_human.bodyType == BodyObjType.ENEMY){

            boxShape.collisionGroup = Main.ENEMY_GROUP;

            boxShape.collisionMask = Main.HUMAN_GROUP | Main.LADDER_GROUP | Main.ENEMY_GROUP;
        }
        else{

            boxShape.collisionGroup = Main.HUMAN_GROUP;

            boxShape.collisionMask = Main.HUMAN_GROUP | Main.LADDER_GROUP | Main.COIN_GROUP | Main.ENEMY_GROUP;
        }

        _human.addShape(boxShape);

        let width = (_length + _radius * 2) * Main.config.factor;
        let height = _radius * 2 * Main.config.factor;

        // let humanDisplay:egret.Shape = new egret.Shape();
        // humanDisplay.graphics.beginFill(_color);
        // humanDisplay.graphics.drawRect(0,0,width,height);
        // humanDisplay.graphics.endFill();

        let tex:egret.Texture = RES.getRes("yu_png");

        let humanDisplay:egret.Bitmap = new egret.Bitmap(tex);

        humanDisplay.width = width;
        humanDisplay.height = height;

        humanDisplay.anchorOffsetX = width / 2;
        humanDisplay.anchorOffsetY = height / 2;

        _human.displays = [humanDisplay];

        _world.addBody(_human);

        _container.addChild(humanDisplay);

        this.humanDic[_human.id] = _human;

        _human.position[0] = _pos[0];

        _human.position[1] = _pos[1];

        _human.updateDisplaysPosition(0);
    }
}