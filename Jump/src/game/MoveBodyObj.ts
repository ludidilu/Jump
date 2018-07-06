class MoveBodyObj extends BodyObj{

    private static tmpVec:number[] = [0,0];

    private static tmpVec1:number[] = [0,0];

    private static dic:{[key:number]:MoveBodyObj} = {};

    public radius:number;

    public uid:number;

    private jumpDisableTime:number = 0;

    private ladder:Ladder;

    public jumpForceFix:number = 1;

    public sizeFix:number = 1;

    public update(_dt?:number):void{

        let shape:p2.Shape = this.shapes[0];

        let posIndex:number = Math.floor(this.position[0] / Main.config.gameConfig.unitWidth);

        let minX:number = posIndex * Main.config.gameConfig.unitWidth;

        let maxX:number = minX + Main.config.gameConfig.unitWidth;

        let minY:number = (posIndex + 1) * Main.config.gameConfig.unitHeight;

        let maxY:number = minY + Main.config.gameConfig.unitHeight;

        if(this.position[1] - this.radius - Main.config.gameConfig.collisionCheckFix < minY){

            shape.collisionMask = shape.collisionMask | Math.pow(2, this.uid);
        }
        else if(this.position[1] - this.radius - Main.config.gameConfig.collisionCheckFix < maxY && this.position[0] + this.radius + Main.config.gameConfig.collisionCheckFix > maxX){

            shape.collisionMask = shape.collisionMask | Math.pow(2, this.uid);
        }
        else{

            shape.collisionMask = shape.collisionMask & ~Math.pow(2, this.uid);
        }

        this.fixFloat();

        let str:string = "uid:" + this.uid + "  pos:" + this.position[0] + "," + this.position[1];

        Game.log(str);

        MoveBodyObj.tmpVec[0] = Main.config.gameConfig.humanFixForce[0] * this.mass;

        MoveBodyObj.tmpVec[1] = Main.config.gameConfig.humanFixForce[1] * this.mass;

        p2.vec2.rotate(MoveBodyObj.tmpVec1, Main.config.gameConfig.humanFixForcePoint, this.angle);

        this.applyForce(MoveBodyObj.tmpVec, MoveBodyObj.tmpVec1);

        this.updateDisplaysPosition();

        if(this.jumpDisableTime > _dt){

            this.jumpDisableTime -= _dt;
        }
        else if(this.jumpDisableTime > 0){

            this.jumpDisableTime = 0;
        }

        this.updateDisplaysPosition();

        this.updateLadder();
    }
    
    public updateLadder():void{

        this.ladder.update(this.position[0]);
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
            
            if(this.overlaps(this.ladder)){

                return HumanJumpResult.LADDER;
            }

            for(let key in MoveBodyObj.dic){

                let uid:any = key;

                if(this.uid != uid){

                    let human:MoveBodyObj = MoveBodyObj.dic[key];

                    if(this.overlaps(human) && this.position[1] > human.position[1]){

                        return HumanJumpResult.HUMAN;
                    }
                }
            }
        }

        return HumanJumpResult.CANNOT;
    }

    public jump(_jumpAngle:number, _jumpForce:number[], _jumpPoint:number[]):void{

        if(this.bodyType == BodyObjType.HUMAN){

            // Game.log("player jump:" + Game.tick);

            // Game.data.arr.push(Game.tick);
        }
        else{

            // Game.log("enemy jump:" + Game.tick);
        }

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

        MoveBodyObj.tmpVec[0] = _jumpForce[0] * this.jumpForceFix;

        MoveBodyObj.tmpVec[1] = _jumpForce[1] * this.jumpForceFix;

        this.applyForce(MoveBodyObj.tmpVec, _jumpPoint);
    }

    
    private static humanUid:number = 0;

    private static getHumanUid():number{

        this.humanUid++;

        return this.humanUid;
    }

    protected static initHuman(_human:MoveBodyObj, _length:number, _radius:number, _color:number, _ladderWithDisplayObject:boolean):void{

        _human.allowSleep = false;

        _human.radius = _length * 0.5 + _radius;

        let boxShape: p2.Capsule = new p2.Capsule({length: _length, radius: _radius});

        boxShape.material = Human.main.humanMat;

        boxShape.collisionGroup = Game.HUMAN_GROUP;
        
        boxShape.collisionMask = Game.HUMAN_GROUP;

        if(_human.bodyType == BodyObjType.HUMAN){

            (<Human>_human).normalRadius = _human.radius;

            (<Human>_human).bigRadius = (<Human>_human).normalRadius * Main.config.gameConfig.humanBigSize;

            (<Human>_human).humanNormalShape = boxShape;

            (<Human>_human).humanBigShape = new p2.Capsule({length: _length * Main.config.gameConfig.humanBigSize, radius: _radius * Main.config.gameConfig.humanBigSize});

            (<Human>_human).humanBigShape.material = boxShape.material;

            (<Human>_human).humanBigShape.collisionGroup = boxShape.collisionGroup;

            (<Human>_human).humanBigShape.collisionMask = boxShape.collisionMask;
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

        Human.main.humanContainer.addChild(humanDisplay);

        _human.uid = this.getHumanUid();

        _human.ladder = Ladder.create(_ladderWithDisplayObject ? Human.main.mapContainer : null, Human.main.ladderMat, Math.pow(2, _human.uid));
    }

    public add(_world:p2.World):void{

        _world.addBody(this);

        _world.addBody(this.ladder);

        MoveBodyObj.dic[this.uid] = this;
    }

    public remove():void{

        this.world.removeBody(this.ladder);

        this.world.removeBody(this);

        delete MoveBodyObj.dic[this.uid];
    }

    public reset():void{

        this.ladder.reset();

        super.reset();
    }
}