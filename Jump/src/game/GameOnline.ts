class Data_refresh{

    public arr:number[];

    public roomUid:number;
}

class Data_command{

    public index:number;

    public arr:number[];
}

class GameOnline{

    private static TAG_JOIN:string = "tag_join";

    private static TAG_REFRESH:string = "tag_refresh";

    private static TAG_START:string = "tag_start";

    private static TAG_COMMAND:string = "tag_command";

    private static TAG_LAG:string = "tag_getLag";

    private static TAG_CHECK_SYNC:string = "tag_check_sync";

    public static commandArr:Data_command[] = [];

    public static main:Game;

    private static uid:number;

    private static other:{[key:number]:Human} = {};

    private static index:number;

    private static recordStartIndex:number = -1;

    private static recordData:{worldTime:number, accumulator:number, recordData:{[key:number]:Human_recordData}, overlapKeeper:{bodyA:p2.Body, bodyB:p2.Body, shapeA:p2.Shape, shapeB:p2.Shape}[]}[] = [];

    public static async start(_roomUid:number, _playerNum:number){

        this.main.bg.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.main.touchBg, this.main);

        SuperEvent.removeEventListener("iWin", this.main.win, this.main);

        SuperEvent.removeEventListener("iLose", this.main.lose, this.main);

        SuperEvent.addEventListener("iWin", this.iWin, this);

        SuperEvent.addEventListener("iLose", this.iLose, this);

        SuperEvent.addEventListener("oWin", this.oWin, this);

        SuperEvent.addEventListener("oLose", this.oLose, this);

        this.uid = await Connection.init(this.disconnect.bind(this));

        console.log("uid:" + this.uid);

        Connection.listen(this.TAG_REFRESH, this.getRefresh.bind(this));

        Connection.listen(this.TAG_COMMAND, this.getCommand.bind(this));

        Connection.listen(this.TAG_START, this.getStart.bind(this));

        Connection.listen(this.TAG_LAG, this.getLag.bind(this));

        Connection.emit(this.TAG_JOIN, {roomUid:_roomUid, playerNum:_playerNum});
    }

    private static disconnect():void{

        console.log("socket disconnect!");
    }

    private static getRefresh(_data:Data_refresh):void{

        this.main.mainPanel.playerNum.text = "room:" + _data.roomUid;

        this.main.mainPanel.createBt.visible = false;

        this.main.mainPanel.joinBt.visible = false;

        Human.human.remove();

        for(let key in this.other){

            this.other[key].remove();
        }

        for(let i:number = 0, m:number = _data.arr.length ; i < m ; i++){

            let uid = _data.arr[i];

            if(uid == this.uid){

                Human.human.setPosition(Main.config.gameConfig.humanStartPos[i][0], Main.config.gameConfig.humanStartPos[i][1]);

                Human.human.updateDisplaysPosition();

                this.main.gameContainer.x = Human.human.containerX = -Human.human.displays[0].x + Game.STAGE_WIDTH * 0.5;

                this.main.gameContainer.y = Human.human.containerY = -Human.human.displays[0].y + Game.STAGE_HEIGHT * 0.5;

                Human.human.gravityScale = 0;

                Human.human.add(this.main.world);
            }
            else{

                if(!this.other[uid]){

                    let human:Human = Human.createOther(this.main.world, Main.config.gameConfig.humanLength, Main.config.gameConfig.humanRadius, Main.config.gameConfig.humanStartPos[i][0], Main.config.gameConfig.humanStartPos[i][1]);

                    human.initContainerPos();

                    this.other[uid] = human;

                    human.gravityScale = 0;
                }
                else{

                    this.other[uid].add(this.main.world);
                }
            }
        }
    }

    private static getCommand(_data:Data_command):void{

        if(_data.index == this.commandArr.length){

            if(this.recordStartIndex != -1){

                if(_data.arr.length > 0){

                    //roll back

                    console.log("!!!!!!!!!!!!!!!!roll back:" + this.recordStartIndex);

                    this.index = this.recordStartIndex;

                    let obj:{worldTime:number, accumulator:number, recordData:{[key:number]:Human_recordData}, overlapKeeper:{bodyA:p2.Body, bodyB:p2.Body, shapeA:p2.Shape, shapeB:p2.Shape}[]} = this.recordData[0];

                    this.main.world.time = obj.worldTime;

                    this.main.world.accumulator = obj.accumulator;

                    this.main.world.overlapKeeper.tick();

                    for(let key in obj.overlapKeeper){

                        let tmp:{bodyA:p2.Body, bodyB:p2.Body, shapeA:p2.Shape, shapeB:p2.Shape} = obj.overlapKeeper[key];

                        this.main.world.overlapKeeper.setOverlapping(tmp.bodyA, tmp.shapeA, tmp.bodyB, tmp.shapeB);
                    }

                    Human.human.useRecordData(obj.recordData[this.uid]);

                    for(let key in this.other){

                        let human:Human = this.other[key];

                        human.useRecordData(obj.recordData[key]);
                    }

                    this.recordStartIndex = -1;

                    this.recordData.length = 0;
                }
                else{

                    // console.log("useRecord success:" + _data.index);

                    this.recordData.shift();

                    if(this.recordData.length > 0){

                        this.recordStartIndex++;
                    }
                    else{

                        this.recordStartIndex = -1;
                    }
                }
            }

            this.commandArr.push(_data);
        }
        else{

            throw new Error("get command error   _data.index:" + _data.index + "   this.commandArr.length:" + this.commandArr.length);
        }
    }

    private static getStart():void{

        this.main.mainPanel.onlineGroup.visible = false;

        this.main.bg.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBg, this);

        SuperTicker.getInstance().addEventListener(this.update, this);

        this.index = 0;
    }

    private static touchBg(e:egret.TouchEvent):void{

        Connection.emit(this.TAG_COMMAND, this.uid);
    }

    private static pingTime:number = 0;

    private static update(_dt:number):void{

        this.pingTime += _dt;

        if(this.pingTime > 1000){

            Connection.emit(this.TAG_LAG, new Date().getTime());

            this.pingTime -= 1000;
        }

        if(this.index < this.commandArr.length){

            this.main.update(16);

            if(!SuperTicker.getInstance().hasEventListener(this.update, this)){

                return;
            }
            
            let command:Data_command = this.commandArr[this.index];

            if(command.arr.length > 0){

                for(let key in command.arr){

                    let uid = command.arr[key];

                    console.log("jump  index:" + this.index + "  uid:" + uid);

                    if(uid == this.uid){

                        this.main.Jump2(Human.human);
                    }
                    else{

                        this.main.Jump2(this.other[uid]);
                    }
                }
            }

            this.fixFloat();

            this.checkSync(this.index);

            this.index++;
        }
        else{

            // console.log("late:" + this.index);

            if(this.recordStartIndex == -1){

                this.recordStartIndex = this.index;
            }

            let obj:{[key:number]:Human_recordData} = {};

            let overlapKeeper:{bodyA:p2.Body, bodyB:p2.Body, shapeA:p2.Shape, shapeB:p2.Shape}[] = [];

            for(let key in this.main.world.overlapKeeper.overlappingShapesCurrentState.keys){

                let value:number = this.main.world.overlapKeeper.overlappingShapesCurrentState.keys[key];

                let targetObj = this.main.world.overlapKeeper.overlappingShapesCurrentState.data[value];

                overlapKeeper.push({bodyA:targetObj.bodyA, bodyB:targetObj.bodyB, shapeA:targetObj.shapeA, shapeB:targetObj.shapeB});
            }

            let recData:{worldTime:number, accumulator:number, recordData:{[key:number]:Human_recordData}, overlapKeeper:{bodyA:p2.Body, bodyB:p2.Body, shapeA:p2.Shape, shapeB:p2.Shape}[]} = {worldTime:this.main.world.time, accumulator:this.main.world.accumulator, recordData:obj, overlapKeeper:overlapKeeper};

            let recordData:Human_recordData = new Human_recordData();

            Human.human.recordData(recordData);

            obj[this.uid] = recordData;

            for(let key in this.other){

                recordData = new Human_recordData();

                this.other[key].recordData(recordData);

                obj[key] = recordData;
            }

            this.recordData.push(recData);

            this.main.update(16);

            this.fixFloat();

            // console.log("simulate  index:" + this.index + "-----------");

            // console.log("uid:" + this.uid + "  x:" + Human.human.position[0] + "  y:" + Human.human.position[1]);

            // for(let key in this.other){

            //     let human:Human = this.other[key];

            //     console.log("uid:" + key + "  x:" + human.position[0] + "  y:" + human.position[1]);
            // }
            
            this.index++;

            return;
        }

        while(this.index < this.commandArr.length){

            // console.log("catch up:" + this.index);

            this.main.update(16);

            if(!SuperTicker.getInstance().hasEventListener(this.update, this)){

                return;
            }
            
            let command:Data_command = this.commandArr[this.index];

            if(command.arr.length > 0){

                for(let key in command.arr){

                    let uid = command.arr[key];

                    console.log("jump  index:" + this.index + "  uid:" + uid);

                    if(uid == this.uid){

                        this.main.Jump2(Human.human);
                    }
                    else{

                        this.main.Jump2(this.other[uid]);
                    }
                }
            }

            this.fixFloat();

            this.checkSync(this.index);

            this.index++;
        }
    }

    private static fixFloat():void{

        Human.human.fixFloat();

        for(let key in this.other){

            this.other[key].fixFloat();
        }

        this.main.world.accumulator = BodyObj.fixNumber(this.main.world.accumulator);

        this.main.world.time = BodyObj.fixNumber(this.main.world.time);
    }

    private static iWin():void{

        if(this.recordData.length == 0){

            this.over();

            this.main.win();
        }
    }

    private static iLose():void{

        if(this.recordData.length == 0){

            this.over();

            this.main.lose();
        }
    }

    private static oWin(_human:Human):void{

        if(this.recordData.length == 0){

            _human.reset();

            this.over();

            this.main.lose();
        }
    }

    private static oLose(_human:Human):void{

        console.log("online olose:" + this.recordData.length);

        if(this.recordData.length == 0){

            _human.reset();

            for(let key in this.other){

                let human:Human = this.other[key];

                if(human == _human){

                    console.log("online olose delete");

                    delete this.other[key];

                    break;
                }
            }

            let hasOther:boolean = false;

            for(let key in this.other){

                hasOther = true;

                break;
            }

            console.log("online olose  hasOther:" + hasOther);

            if(!hasOther){

                this.over();

                this.main.win();
            }
        }
    }

    private static over():void{

        console.log("online over!");

        wx.closeSocket({});

        SuperTicker.getInstance().removeEventListener(this.update, this);

        SuperEvent.removeEventListener("iWin", this.iWin, this);

        SuperEvent.removeEventListener("iLose", this.iLose, this);

        SuperEvent.removeEventListener("oWin", this.oWin, this);

        SuperEvent.removeEventListener("oLose", this.oLose, this);

        this.main.bg.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBg, this);

        Connection.removeListen(this.TAG_REFRESH);

        Connection.removeListen(this.TAG_COMMAND);

        Connection.removeListen(this.TAG_START);

        Connection.removeListen(this.TAG_LAG);

        this.other = {};

        this.commandArr.length = 0;

        this.recordData.length = 0;

        this.recordStartIndex = -1;

        this.main.mainPanel.onlineGroup.visible = true;

        this.main.mainPanel.playerNum.text = "data";

        this.main.mainPanel.createBt.visible = true;

        this.main.mainPanel.joinBt.visible = true;
    }

    private static checkSync(_index:number):void{

        // console.log("sync  index:" + _index + "-----------");

        let obj = {};

        obj[this.uid] = {x:Human.human.position[0], y:Human.human.position[1], forceX:Human.human.force[0], forceY:Human.human.force[1]};

        // console.log("uid:" + this.uid + "  x:" + Human.human.position[0] + "  y:" + Human.human.position[1] + "  forceX:" + Human.human.force[0] + "  forceY:" + Human.human.force[1]);

        for(let key in this.other){

            let human:Human = this.other[key];

            obj[key] = {x:human.position[0], y:human.position[1], forceX:human.force[0], forceY:human.force[1]};

            // console.log("uid:" + key + "  x:" + human.position[0] + "  y:" + human.position[1] + "  forceX:" + human.force[0] + "  forceY:" + human.force[1]);
        }

        Connection.emit(this.TAG_CHECK_SYNC, {index:_index, obj:obj});
    }

    private static getLag(_v:number):void{

        let nowTime:number = new Date().getTime();

        let lag:number = nowTime - _v;

        console.log("ping:" + lag);
    }
}