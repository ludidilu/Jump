class playerGameData extends userInfo{

    public KVDataList:KVData[];
}

class WeixinData{

    public static userInfo:playerGameData;

    public static friendData:userGameData[];

    public static picPool:{[key:string]:egret.Texture} = {};

    public static async init():Promise<void>{

        WeixinTalk.init();

        let str:string = await WeixinTalk.Talk({command:"getUserInfo", data:["selfOpenId"]});

        console.log("main getUserInfoSuccess:" + str);

        let data:{data:playerGameData[]} = JSON.parse(str);

        WeixinData.userInfo = data.data[0];

        WeixinData.getPic(WeixinData.userInfo.avatarUrl);

        str = await WeixinTalk.Talk({command:"getUserCloudStorage", data:["score"]});

        let data2:{KVDataList:KVData[]} = JSON.parse(str);

        WeixinData.userInfo.KVDataList = data2.KVDataList;

        str = await WeixinTalk.Talk({command:"getFriendCloudStorage", data:["score"]});

        console.log("main getFriendCloudStorageSuccess:" + str);

        let data3:{data:userGameData[]} = JSON.parse(str);

        for(let i:number = data3.data.length - 1 ; i > -1 ; i++){

            let userGameData:userGameData = data3.data[i];

            if(userGameData.avatarUrl == WeixinData.userInfo.avatarUrl){

                data3.data.splice(i, 1);

                break;
            }
        }

        WeixinData.friendData = data3.data;

        for(let v of WeixinData.friendData){

            WeixinData.getPic(v.avatarUrl);
        }
    }

    public static getPic(_str:string, _cb?:(_tex:egret.Texture)=>void):void{

        let tex:egret.Texture = this.picPool[_str];
        
        if(!tex){

            let fun:Function = function(_tex:egret.Texture):void{

                WeixinData.picPool[_str] = _tex;

                if(_cb){

                    _cb(_tex);
                }
            };

            RES.getResByUrl(_str, fun, this, RES.ResourceItem.TYPE_IMAGE);
        }
        else{

            if(_cb){

                _cb(tex);
            }
        }
    }
}