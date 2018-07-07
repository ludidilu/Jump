class Data_refresh{

    public arr:number[];
}

class Data_command{

    public index:number;

    public commandArr:number[];
}

class GameOnline{

    private static TAG_REFRESH:string = "tag_refresh";

    private static TAG_COMMAND:string = "tag_command";

    public static commandArr:Data_command[] = [];

    public static main:Game;

    private static uid:number;

    private static other:{[key:number]:Human} = {};

    public static async start(){

        this.uid = await Connection.init();

        console.log("uid:" + this.uid);

        Connection.listen(this.TAG_REFRESH, this.getRefresh.bind(this));

        Connection.listen(this.TAG_COMMAND, this.getCommand.bind(this));
    }

    private static getRefresh(_data:Data_refresh):void{

        for(let i:number = 0, m:number = _data.arr.length ; i < m ; i++){

            let uid = _data.arr[i];

            if(uid == this.uid){

                Human.human.setPosition(Main.config.gameConfig.humanStartPos[i][0], Main.config.gameConfig.humanStartPos[i][1]);

                Human.human.updateDisplaysPosition();
            }
            else{

                if(!this.other[uid]){

                    let human:Human = Human.createOther(this.main.world, Main.config.gameConfig.humanLength, Main.config.gameConfig.humanRadius, Main.config.gameConfig.humanStartPos[i][0], Main.config.gameConfig.humanStartPos[i][1]);


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
}