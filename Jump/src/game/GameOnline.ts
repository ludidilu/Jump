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

    private static COMMAND_LAG:number = 0;

    public static commandArr:Data_command[] = [];

    public static main:Game;

    private static uid:number;

    private static other:{[key:number]:Human} = {};

    private static index:number;

    public static async start(_roomUid:number, _playerNum:number){

        this.main.bg.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.main.touchBg, this.main);

        this.uid = await Connection.init();

        console.log("uid:" + this.uid);

        Connection.listen(this.TAG_REFRESH, this.getRefresh.bind(this));

        Connection.listen(this.TAG_COMMAND, this.getCommand.bind(this));

        Connection.listen(this.TAG_START, this.getStart.bind(this));

        Connection.listen(this.TAG_LAG, this.getLag.bind(this));

        Connection.emit(this.TAG_JOIN, {roomUid:_roomUid, playerNum:_playerNum});
    }

    private static getRefresh(_data:Data_refresh):void{

        this.main.mainPanel.playerNum.text = "room:" + _data.roomUid;

        this.main.mainPanel.createBt.visible = false;

        this.main.mainPanel.joinBt.visible = false;

        for(let i:number = 0, m:number = _data.arr.length ; i < m ; i++){

            let uid = _data.arr[i];

            if(uid == this.uid){

                Human.human.setPosition(Main.config.gameConfig.humanStartPos[i][0], Main.config.gameConfig.humanStartPos[i][1]);

                Human.human.updateDisplaysPosition();

                this.main.gameContainer.x = Human.human.containerX = -Human.human.displays[0].x + Game.STAGE_WIDTH * 0.5;

                this.main.gameContainer.y = Human.human.containerY = -Human.human.displays[0].y + Game.STAGE_HEIGHT * 0.5;

                Human.human.gravityScale = 0;
            }
            else{

                if(!this.other[uid]){

                    let human:Human = Human.createOther(this.main.world, Main.config.gameConfig.humanLength, Main.config.gameConfig.humanRadius, Main.config.gameConfig.humanStartPos[i][0], Main.config.gameConfig.humanStartPos[i][1]);

                    this.other[uid] = human;

                    human.gravityScale = 0;
                }
            }
        }
    }

    private static getCommand(_data:Data_command):void{

        if(_data.index == this.commandArr.length){

            this.commandArr.push(_data);
        }
        else{

            throw new Error("get command error");
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

        let index:number = this.index - this.COMMAND_LAG;

        if(index < this.commandArr.length){

            if(index > -1){

                let command:Data_command = this.commandArr[index];

                if(command.arr.length > 0){

                    for(let key in command.arr){

                        let uid = command.arr[key];

                        if(uid == this.uid){

                            this.main.Jump2(Human.human);
                        }
                        else{

                            this.main.Jump2(this.other[uid]);
                        }
                    }
                }

                this.main.update(16);

                this.checkSync(index);
            }

            index++;

            this.index++;
        }
        else{

            // console.log("late:" + index);

            return;
        }

        while(index < this.commandArr.length - this.COMMAND_LAG){

            if(index > -1){

                let command:Data_command = this.commandArr[index];

                if(command.arr.length > 0){

                    for(let key in command.arr){

                        let uid = command.arr[key];

                        if(uid == this.uid){

                            this.main.Jump2(Human.human);
                        }
                        else{

                            this.main.Jump2(this.other[uid]);
                        }
                    }
                }

                this.main.update(16);

                this.checkSync(index);

                // console.log("catch up:" + index);
            }

            index++;

            this.index++;
        }
    }

    private static checkSync(_index:number):void{

        let obj = {};

        obj[this.uid] = {x:Human.human.position[0], y:Human.human.position[1]};

        for(let key in this.other){

            let human:Human = this.other[key];

            obj[key] = {x:human.position[0], y:human.position[1]};
        }

        Connection.emit(this.TAG_CHECK_SYNC, {index:_index, obj:obj});
    }

    private static getLag(_v:number):void{

        let nowTime:number = new Date().getTime();

        let lag:number = nowTime - _v;

        // console.log("ping:" + lag);
    }
}