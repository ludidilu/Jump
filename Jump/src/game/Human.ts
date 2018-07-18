enum HumanJumpResult{

    CANNOT,
    LADDER,
    HUMAN,
    GLINE,
    RLINE
}

class Human_recordData extends RecordData{

    public rec_firstJump:boolean;

    public rec_firstCameraFollowTime:number;

    public rec_containerX:number;

    public rec_containerY:number;

    public rec_gravityScale:number;

    public rec_jumpDisableTime:number;
}

class Human extends MoveBodyObj{

    public static main:Game;

    public static human:Human;

    public static humanArr:Human[] = [];

    private static humanPool:Human[] = [];

    public normalRadius:number;

    public bigRadius:number;

    public humanNormalShape:p2.Capsule;

    public humanBigShape:p2.Capsule;

    public headPoint:number[] = [0, 0];

    public footPoint:number[] = [0, 0];

    public containerX:number;

    public containerY:number;

    private firstCameraFollowTime:number;

    public isMain:boolean;

    public firstJump:boolean = false;

    private updateContainerPosition(_dt:number):void{

        if(!this.firstJump){

            return;
        }

        this.containerY += Game.stageConfig.heightAddSpeed * Main.config.gameConfig.factor * _dt * 0.001;

        let targetY:number = this.position[1] * Main.config.gameConfig.factor - Game.STAGE_HEIGHT * 0.5;

        if(targetY > this.containerY){

            this.containerY = this.containerY + (targetY - this.containerY) * Main.config.gameConfig.cameraFollowSpeedFix;
        }

        let targetX:number = -this.containerY * Main.config.gameConfig.unitWidth / Main.config.gameConfig.unitHeight;

        this.firstCameraFollowTime += _dt;

        if(this.firstCameraFollowTime < Main.config.gameConfig.firstCameraFollowTime){

            let nowX:number = Game.STAGE_WIDTH * 0.5 - this.displays[0].x;

            this.containerX = nowX + (targetX - nowX) * this.firstCameraFollowTime / Main.config.gameConfig.firstCameraFollowTime;

        }else{

            this.containerX = targetX;
        }

        let xPos:number = this.position[0] / Main.config.gameConfig.unitWidth;

        let xLevel:number = Math.floor(xPos);

        if(Game.stageConfig.maxLevel > 0 && xLevel + 1 >= Game.stageConfig.maxLevel){

            let xPosFix:number = (xPos - Game.stageConfig.maxLevel + 1) * Main.config.gameConfig.unitWidth;

            if(xPosFix > Main.config.gameConfig.finalLadderXFix){

                if(this.isMain){

                    Human.main.setScore(Game.stageConfig.maxLevel);

                    // console.log("data:" + JSON.stringify(Game.data));

                    // console.log("a:" + Game.strstr);

                    SuperEvent.dispatchEvent("iWin");

                    // Human.main.win();
                }
                else{

                    SuperEvent.dispatchEvent("oWin", this);
                }

                return;
            }
            else if(this.isMain){

                Human.main.setScore(Game.stageConfig.maxLevel - 1);
            }
        }
        else if(this.isMain){

            let xPosFix:number = (xPos - xLevel) * Main.config.gameConfig.unitWidth;

            if(xPosFix > Main.config.gameConfig.ladderXFix){

                Human.main.setScore(xLevel + 1);
            }
            else{

                Human.main.setScore(xLevel);
            }
        }

        let py:number = this.containerY + this.displays[0].y;

        if(py > Game.STAGE_HEIGHT + (Main.config.gameConfig.humanLength * 0.5 + Main.config.gameConfig.humanRadius) * this.sizeFix * Main.config.gameConfig.factor){

            if(this.isMain){

                SuperEvent.dispatchEvent("iLose");

                // Human.main.lose();

                // console.log("a:" + Game.strstr);
            }
            else{

                SuperEvent.dispatchEvent("oLose", this);
            }
        }
    }

    public update(_dt:number):void{

        super.update(_dt);

        this.updateContainerPosition(_dt);

        let cos:number = Math.cos(this.angle) * Main.config.gameConfig.humanLength * 0.5;

        let sin:number = Math.sin(this.angle) * Main.config.gameConfig.humanLength * 0.5;

        this.headPoint[0] = this.position[0] + cos;

        this.headPoint[1] = this.position[1] + sin;

        this.footPoint[0] = this.position[0] - cos;

        this.footPoint[1] = this.position[1] - sin;
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

            this.removeShape(this.humanNormalShape);

            this.addShape(this.humanBigShape);

            this.displays[0].scaleX = Main.config.gameConfig.humanBigSize;

            this.displays[0].scaleY = Main.config.gameConfig.humanBigSize;

            this.setSizeFix(Main.config.gameConfig.humanBigSize);

            this.setMassFix(Main.config.gameConfig.humanBigMassFix);

            this.setJumpForceFix(Main.config.gameConfig.humanBigJumpForceFix);

            this.radius = this.bigRadius;
        }
        else{

            this.removeShape(this.humanBigShape);

            this.addShape(this.humanNormalShape);

            this.displays[0].scaleX = 1;

            this.displays[0].scaleY = 1;

            this.setSizeFix(1 / Main.config.gameConfig.humanBigSize);

            this.setMassFix(1 / Main.config.gameConfig.humanBigMassFix);

            this.setJumpForceFix(1 / Main.config.gameConfig.humanBigJumpForceFix);

            this.radius = this.normalRadius;
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

    public static create(_world:p2.World, _length:number, _radius:number, _x:number, _y:number):Human{
        
        this.human = new Human({mass:1, damping:Main.config.gameConfig.humanDamping, angularDamping:Main.config.gameConfig.humanAngularDamping, gravityScale:Main.config.gameConfig.humanGravityScale});

        this.human.bodyType = BodyObjType.HUMAN;

        this.human.isMain = true;

        this.initHuman(this.human, _length, _radius, 0xffff00, true);

        this.human.add(_world);

        this.human.setPosition(_x, _y);
        
        this.human.updateDisplaysPosition();

        return this.human;
    }

    public static createOther(_world:p2.World, _length:number, _radius:number, _x:number, _y:number):Human{

        let human:Human;

        if(this.humanPool.length > 0){

            human = this.humanPool.pop();

            this.main.humanContainer.addChild(human.displays[0]);
        }
        else{

            human = new Human({mass:1, damping:Main.config.gameConfig.humanDamping, angularDamping:Main.config.gameConfig.humanAngularDamping, gravityScale:Main.config.gameConfig.humanGravityScale});

            human.bodyType = BodyObjType.HUMAN;

            human.isMain = false;

            this.initHuman(human, _length, _radius, 0xffff00, false);
        }

        this.humanArr.push(human);

        human.add(_world);

        human.setPosition(_x, _y);
        
        human.updateDisplaysPosition();

        return human;
    }

    public reset():void{

        this.firstJump = false;

        this.firstCameraFollowTime = 0;

        this.setPosition(Main.config.gameConfig.humanStartPos[0][0], Main.config.gameConfig.humanStartPos[0][1]);

        super.reset();

        this.updateDisplaysPosition();

        this.initContainerPos();

        if(!this.isMain){

            this.remove();

            Human.humanArr.splice(Human.humanArr.indexOf(this), 1);

            Human.main.humanContainer.removeChild(this.displays[0]);

            Human.humanPool.push(this);
        }
    }

    public initContainerPos():void{

        this.containerX = -this.displays[0].x + Game.STAGE_WIDTH * 0.5;

        this.containerY = -this.displays[0].y + Game.STAGE_HEIGHT * 0.5;
    }

    public static update(_dt:number):void{

        for(let i:number = this.humanArr.length - 1 ; i > -1 ; i--){

            let human:Human = this.humanArr[i];

            if(human.firstJump){

                human.update(_dt);
            }
        }
    }

    public static reset():void{

        for(let i:number = this.humanArr.length - 1 ; i > -1 ; i--){

            let human:Human = this.humanArr[i];

            human.reset();
        }
    }

    public recordData(_recordData:Human_recordData):void{

        super.recordData(_recordData);

        _recordData.rec_firstJump = this.firstJump;

        _recordData.rec_firstCameraFollowTime = this.firstCameraFollowTime;

        _recordData.rec_containerX = this.containerX;

        _recordData.rec_containerY = this.containerY;

        _recordData.rec_gravityScale = this.gravityScale;

        _recordData.rec_jumpDisableTime = this.jumpDisableTime;
    }

    public useRecordData(_recordData:Human_recordData):void{

        super.useRecordData(_recordData);

        this.firstJump = _recordData.rec_firstJump;

        this.firstCameraFollowTime = _recordData.rec_firstCameraFollowTime;

        this.containerX = _recordData.rec_containerX;

        this.containerY = _recordData.rec_containerY;

        this.gravityScale = _recordData.rec_gravityScale;

        this.jumpDisableTime = _recordData.rec_jumpDisableTime;
    }

    public fixFloat():void{

        super.fixFloat();

        this.containerX = BodyObj.fixNumber(this.containerX);

        this.containerY = BodyObj.fixNumber(this.containerY);
    }
}