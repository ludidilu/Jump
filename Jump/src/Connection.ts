class Connection{

    private static socket:egret.WebSocket;

    private static cbDic:{[key:string]:(data:any)=>void} = {};

    private static closeCallBack:()=>void;

    public static async init(_closeCallBack:()=>void){

        Connection.closeCallBack = _closeCallBack;

        let fun:(_resolve:(_uid:number)=>void)=>void = function(_resolve:(_uid:number)=>void):void{

            Connection.socket = new egret.WebSocket();

            Connection.socket.addEventListener( egret.ProgressEvent.SOCKET_DATA, Connection.socketGetMessage, this );

            Connection.socket.addEventListener( egret.ProgressEvent.CLOSE, Connection.socketClose, this );

            Connection.listen("connectOver", _resolve);

            Connection.socket.connect("1.1.1.115", 1999);
        }

        return new Promise<number>(fun);
    }

    private static socketGetMessage(e:egret.Event):void{

        let msg:{tag:string, data:any} = JSON.parse(Connection.socket.readUTF());

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

        delete Connection.cbDic[_tag];
    }

    public static listen(_tag:string, _cb:(_data)=>void):void{

        Connection.cbDic[_tag] = _cb;
    }

    public static emit(_tag:string, _data):void{

        Connection.socket.writeUTF(JSON.stringify({tag:_tag, data:_data}));
    }

    public static close():void{

        Connection.socket.close();
    }
}