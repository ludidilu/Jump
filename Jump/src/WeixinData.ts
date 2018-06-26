class playerGameData extends userInfo{

    public KVDataList:KVData[];
}

class KVDataTools{

    public static getValue(_kv:KVData[], _key:string):string{

        for(let i:number = 0, m:number = _kv.length ; i < m ; i++){

            let kv:KVData = _kv[i];

            if(kv.key == _key){

                return kv.value;
            }
        }

        return null;
    }

    public static setValue(_kv:KVData[], _key:string, _value:string):void{

        for(let i:number = 0, m:number = _kv.length ; i < m ; i++){

            let kv:KVData = _kv[i];

            if(kv.key == _key){

                kv.value = _value;

                return;
            }
        }

        let kv:KVData = {key: _key, value: _value};

        _kv.push(kv);
    }
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

        str = await WeixinTalk.Talk({command:"getUserCloudStorage", data:[Main.ENDLESS_SCORE, Main.CHALLENGE_SCORE, Main.MONEY]});

        let data2:{KVDataList:KVData[]} = JSON.parse(str);

        WeixinData.userInfo.KVDataList = data2.KVDataList;

        str = await WeixinTalk.Talk({command:"getFriendCloudStorage", data:[Main.ENDLESS_SCORE, Main.CHALLENGE_SCORE, Main.MONEY]});

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

    public static async setUserData(_data:KVData[]):Promise<void>{

        let cb:(resolve:(_data:any)=>void, reject:(_data:any)=>void)=>void = function(resolve:(_data:any)=>void, reject:(_data:any)=>void):void{

            let success:(_obj:any)=>void = function(_obj:any):void{

                console.log("setUserData success:" + _obj);

                for(let i:number = 0, m:number = _data.length ; i < m ; i++){

                    let kv:KVData = _data[i];

                    KVDataTools.setValue(WeixinData.userInfo.KVDataList, kv.key, kv.value);
                }

                resolve(_obj);
            };

            let fail:(_obj:any)=>void = function(_obj:any):void{

                reject(_obj);
            };

            let complete:(_obj:any)=>void = function(_obj:any):void{

            };

            wx.setUserCloudStorage({KVDataList: _data, success: success, fail: fail, complete: complete});
        };

        return new Promise(cb);
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