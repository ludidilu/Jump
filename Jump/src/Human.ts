enum HumanJumpResult{

    CANNOT,
    LADDER,
    HUMAN,
    LINE,
}

class Human extends BodyObj{

    public static conBody:BodyObj;

    private static human:Human;

    private static humanNormalShape:p2.Capsule;

    private static humanBigShape:p2.Capsule;

    private static tmpVec:number[] = [0,0];

    private static tmpVec1:number[] = [0,0];

    private jumpDisableTime:number = 0;

    private jumpForceFix:number = 1;

    public sizeFix:number = 1;

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

                if(Math.abs(this.position[1] - line.worldY) < (Main.config.humanLength * 0.5 * Math.abs(Math.sin(this.angle)) + Main.config.humanRadius) * this.sizeFix + Main.config.lineWidth * 0.5){

                    return HumanJumpResult.LINE;
                }
            }
            
            if(this.overlaps(Human.conBody)){

                return HumanJumpResult.LADDER;
            }

            for(let i:number = 0, m:number = Enemy.enemies.length ; i < m ; i++){

                let human:Human = Enemy.enemies[i];

                if(human == this){

                    continue;
                }

                if(this.overlaps(human) && this.position[1] > human.position[1]){

                    return HumanJumpResult.HUMAN;
                }
            }

            if(this.bodyType == BodyObjType.ENEMY){

                if(this.overlaps(Human.human) && this.position[1] > Human.human.position[1]){

                    return HumanJumpResult.HUMAN;
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

            this.position[1] += (nowHeight - lastHeight) * Main.config.humanLength * 0.5 * this.sizeFix;
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

    public setSizeFix(_fix:number):void{

        this.sizeFix *= _fix;
    }

    public setMassFix(_fix:number):void{

        this.mass *= _fix;

        this.updateMassProperties();
    }

    public setJumpForceFix(_fix:number):void{

        this.jumpForceFix *= _fix;
    }

    public setBig(_b:boolean):void{

        if(_b){

            this.removeShape(this.shapes[0]);

            this.addShape(Human.humanBigShape);

            this.displays[0].scaleX = Main.config.humanBigSize;

            this.displays[0].scaleY = Main.config.humanBigSize;

            this.setSizeFix(Main.config.humanBigSize);

            this.setMassFix(Main.config.humanBigSize);

            this.setJumpForceFix(Main.config.humanBigSize);
        }
    }

    public static create(_world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _pos:number[]):Human{
        
        this.human = new Human({mass:1, damping:Main.config.humanDampling, angularDampling:Main.config.humanAngularDampling, gravityScale:Main.config.humanGravityScale});

        this.human.bodyType = BodyObjType.HUMAN;

        this.initHuman(this.human, _world, _length, _radius, _container, _mat, 0xffff00, _pos);

        return this.human;
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

            boxShape.collisionMask = Main.HUMAN_GROUP | Main.LADDER_GROUP | Main.REWARD_GROUP | Main.ENEMY_GROUP;

            this.humanNormalShape = boxShape;

            this.humanBigShape = new p2.Capsule({length: _length * Main.config.humanBigSize, radius: _radius * Main.config.humanBigSize});

            this.humanBigShape.material = boxShape.material;

            this.humanBigShape.collisionGroup = boxShape.collisionGroup;

            this.humanBigShape.collisionMask = boxShape.collisionMask;
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

        _human.position[0] = _pos[0];

        _human.position[1] = _pos[1];

        _human.updateDisplaysPosition(0);
    }
}