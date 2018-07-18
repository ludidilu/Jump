class Connection{

    private static socket:SocketIOClient.Socket;

    private static cbDic:{[key:string]:(data:any)=>void} = {};

    private static closeCallBack:()=>void;

    public static async init(_closeCallBack:()=>void){

        Connection.closeCallBack = _closeCallBack;

        if(!Main.isWeixin){

            let fun:(_resolve:(_uid:number)=>void)=>void = function(_resolve:(_uid:number)=>void):void{

                Connection.socket = io.connect("106.75.222.192:1999");

                // Connection.socket = io.connect("127.0.0.1:1999");
                
                Connection.socket.on("connectOver", _resolve);
            }

            return new Promise<number>(fun);
        }
        else{

            let fun:(_resolve:(_uid:number)=>void)=>void = function(_resolve:(_uid:number)=>void):void{

                wx.onSocketMessage(Connection.socketGetMessage);

                wx.onSocketClose(Connection.socketClose);

                Connection.listen("connectOver", _resolve);

                // wx.connectSocket({url: "ws://192.168.0.101:1999"});

                wx.connectSocket({url: "ws://192.168.0.102:1999"});
            }

            return new Promise<number>(fun);
        }
    }

    private static socketGetMessage(data:{data:string}):void{

        let msg:{tag:string, data:any} = JSON.parse(data.data);

        let cb:(data:any)=>void = Connection.cbDic[msg.tag];

        if(cb){

            cb(msg.data);
        }
    }

    private static socketClose():void{

        if(Connection.closeCallBack){

            Connection.closeCallBack();
        }
    }

    public static removeListen(_tag:string):void{

        if(!Main.isWeixin){

            Connection.socket.removeListener(_tag);
        }
        else{

            delete Connection.cbDic[_tag];
        }
    }

    public static listen(_tag:string, _cb:(_data)=>void):void{

        if(!Main.isWeixin){

            Connection.socket.on(_tag, _cb);
        }
        else{

            Connection.cbDic[_tag] = _cb;
        }
    }

    public static emit(_tag:string, _data):void{

        if(!Main.isWeixin){

            Connection.socket.emit(_tag, _data);
        }
        else{

            wx.sendSocketMessage({data:JSON.stringify({tag:_tag, data:_data})});
        }
    }
}