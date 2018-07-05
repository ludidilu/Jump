enum HumanJumpResult{

    CANNOT,
    LADDER,
    HUMAN,
    GLINE,
    RLINE
}

class Human extends MoveBodyObj{

    public static main:Game;

    public static human:Human;

    private static humanNormalShape:p2.Capsule;

    private static humanBigShape:p2.Capsule;

    private static tmpVec:number[] = [0,0];

    private static tmpVec1:number[] = [0,0];

    private jumpDisableTime:number = 0;

    private jumpForceFix:number = 1;

    public sizeFix:number = 1;

    private static normalRadius:number;

    private static bigRadius:number;

    public static headPoint:number[] = [0, 0];

    public static footPoint:number[] = [0, 0];

    public static fixNumber(_v:number):number{

        let str:string = _v.toFixed(4);

        let v:number = parseFloat(str);

        return v;
    }

    public updateDisplaysPosition(_dt:number):void{

        this.velocity[0] = Human.fixNumber(this.velocity[0]);

        this.velocity[1] = Human.fixNumber(this.velocity[1]);

        this.force[0] = Human.fixNumber(this.force[0]);

        this.force[1] = Human.fixNumber(this.force[1]);

        this.angularForce = Human.fixNumber(this.angularForce);

        this.angularVelocity = Human.fixNumber(this.angularVelocity);

        this.previousAngle = Human.fixNumber(this.previousAngle);

        this.previousPosition[0] = Human.fixNumber(this.previousPosition[0]);

        this.previousPosition[1] = Human.fixNumber(this.previousPosition[1]);

        this.vlambda[0] = Human.fixNumber(this.vlambda[0]);

        this.vlambda[1] = Human.fixNumber(this.vlambda[1]);

        this.wlambda = Human.fixNumber(this.wlambda);

        this.position[0] = Human.fixNumber(this.position[0]);

        this.position[1] = Human.fixNumber(this.position[1]);

        this.angle = Human.fixNumber(this.angle);

        // if(this.bodyType == BodyObjType.HUMAN){

        //     Game.log("human pos  x:" + this.position[0] + "  y:" +this.position[1] + "   angle:" + this.angle);
        // }
        // else if(this.bodyType == BodyObjType.ENEMY){

        //     Game.log("enemy pos  x:" + this.position[0] + "  y:" +this.position[1] + "   angle:" + this.angle);
        // }

        if(Math.abs(this.previousPosition[0] - this.position[0]) < Math.abs(Main.config.gameConfig.humanSleepXFix) * _dt * 0.001){

            if(this.velocity[0] > 0){

                this.setPosition(this.previousPosition[0] + Main.config.gameConfig.humanSleepXFix * _dt * 0.001, this.position[1]);
            }
            else{

                this.setPosition(this.previousPosition[0] - Main.config.gameConfig.humanSleepXFix * _dt * 0.001, this.position[1]);
            }
        }

        Human.tmpVec[0] = Main.config.gameConfig.humanFixForce[0] * this.mass;

        Human.tmpVec[1] = Main.config.gameConfig.humanFixForce[1] * this.mass;

        p2.vec2.rotate(Human.tmpVec1, Main.config.gameConfig.humanFixForcePoint, this.angle);

        this.applyForce(Human.tmpVec, Human.tmpVec1);

        super.updateDisplaysPosition();

        if(this.jumpDisableTime > _dt){

            this.jumpDisableTime -= _dt;
        }
        else if(this.jumpDisableTime > 0){

            this.jumpDisableTime = 0;
        }

        if(this.bodyType == BodyObjType.HUMAN){

            let cos:number = Math.cos(this.angle) * Main.config.gameConfig.humanLength * 0.5;

            let sin:number = Math.sin(this.angle) * Main.config.gameConfig.humanLength * 0.5;

            Human.headPoint[0] = this.position[0] + cos;

            Human.headPoint[1] = this.position[1] + sin;

            Human.footPoint[0] = this.position[0] - cos;

            Human.footPoint[1] = this.position[1] - sin;
        }
    }

    public checkCanJump():HumanJumpResult{

        if(this.jumpDisableTime == 0){

            for(let i:number = 0, m:number = Line.lineArr.length; i < m ; i++){

                let line:Line = Line.lineArr[i];

                if(Math.abs(this.position[1] - line.worldY) < (Main.config.gameConfig.humanLength * 0.5 * Math.abs(Math.sin(this.angle)) + Main.config.gameConfig.humanRadius) * this.sizeFix + Main.config.gameConfig.lineWidth * 0.5){

                    if(line.isG){

                        return HumanJumpResult.GLINE;
                    }
                    else{

                        return HumanJumpResult.RLINE;
                    }
                }
            }
            
            if(this.overlaps(Ladder.ladder)){

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

        // if(this.bodyType == BodyObjType.HUMAN){

        //     // Game.log("player jump:" + Game.tick);

        //     Game.data.arr.push(Game.tick);
        // }
        // else{

        //     // Game.log("enemy jump:" + Game.tick);
        // }

        //---起跳时整体向上抬升
        let lastHeight:number = Math.abs(Math.sin(this.angle));

        let nowHeight:number = Math.abs(Math.sin(_jumpAngle));

        if(nowHeight > lastHeight){

            this.setPosition(this.position[0], this.position[1] + (nowHeight - lastHeight) * Main.config.gameConfig.humanLength * 0.5 * this.sizeFix);
        }
        //---

        this.setAngle(_jumpAngle);

        this.jumpDisableTime = Main.config.gameConfig.jumpDisableTime;

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

            this.removeShape(Human.humanNormalShape);

            this.addShape(Human.humanBigShape);

            this.displays[0].scaleX = Main.config.gameConfig.humanBigSize;

            this.displays[0].scaleY = Main.config.gameConfig.humanBigSize;

            this.setSizeFix(Main.config.gameConfig.humanBigSize);

            this.setMassFix(Main.config.gameConfig.humanBigMassFix);

            this.setJumpForceFix(Main.config.gameConfig.humanBigJumpForceFix);

            this.radius = Human.bigRadius;
        }
        else{

            this.removeShape(Human.humanBigShape);

            this.addShape(Human.humanNormalShape);

            this.displays[0].scaleX = 1;

            this.displays[0].scaleY = 1;

            this.setSizeFix(1 / Main.config.gameConfig.humanBigSize);

            this.setMassFix(1 / Main.config.gameConfig.humanBigMassFix);

            this.setJumpForceFix(1 / Main.config.gameConfig.humanBigJumpForceFix);

            this.radius = Human.normalRadius;
        }
    }

    public setFeather(_b:boolean):void{

        if(_b){

            this.setMassFix(Main.config.gameConfig.humanFeatherMassFix);

            this.setJumpForceFix(Main.config.gameConfig.humanFeatherJumpForceFix);
        }
        else{

            this.setMassFix(1 / Main.config.gameConfig.humanFeatherMassFix);

            this.setJumpForceFix(1 / Main.config.gameConfig.humanFeatherJumpForceFix);
        }
    }

    public setSlow(_b:boolean):void{

        if(_b){

            Human.main.worldDtFix *= Main.config.gameConfig.humanSlowFix;
        }
        else{

            Human.main.worldDtFix /= Main.config.gameConfig.humanSlowFix;
        }
    }

    public setMagnet(_b:boolean):void{

        Coin.isMovingToHuman = _b;
    }

    public setDouble(_b:boolean):void{

        Human.main.isCoinDouble = _b;
    }

    public static create(_world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _x:number, _y:number):Human{
        
        this.human = new Human({mass:1, damping:Main.config.gameConfig.humanDamping, angularDamping:Main.config.gameConfig.humanAngularDamping, gravityScale:Main.config.gameConfig.humanGravityScale});

        this.human.bodyType = BodyObjType.HUMAN;

        this.initHuman(this.human, _world, _length, _radius, _container, _mat, 0xffff00);

        this.human.setPosition(_x, _y);
        
        this.human.updateDisplaysPosition(0);

        return this.human;
    }

    protected static initHuman(_human:Human, _world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _color:number):void{

        _human.allowSleep = false;

        _human.radius = _length * 0.5 + _radius;

        let boxShape: p2.Capsule = new p2.Capsule({length: _length, radius: _radius});

        boxShape.material = _mat;

        if(_human.bodyType == BodyObjType.ENEMY){

            boxShape.collisionGroup = Game.ENEMY_GROUP;

            boxShape.collisionMask = Game.HUMAN_GROUP;
        }
        else{

            boxShape.collisionGroup = Game.HUMAN_GROUP;

            boxShape.collisionMask = Game.ENEMY_GROUP;

            this.normalRadius = _human.radius;

            this.bigRadius = this.normalRadius * Main.config.gameConfig.humanBigSize;

            this.humanNormalShape = boxShape;

            this.humanBigShape = new p2.Capsule({length: _length * Main.config.gameConfig.humanBigSize, radius: _radius * Main.config.gameConfig.humanBigSize});

            this.humanBigShape.material = boxShape.material;

            this.humanBigShape.collisionGroup = boxShape.collisionGroup;

            this.humanBigShape.collisionMask = boxShape.collisionMask;
        }

        _human.addShape(boxShape);

        let width = (_length + _radius * 2) * Main.config.gameConfig.factor;
        let height = _radius * 2 * Main.config.gameConfig.factor;

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
    }
}