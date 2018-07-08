class Connection{

    private static socket:SocketIOClient.Socket;

    public static async init(){

        let fun:(_resolve:(_uid:number)=>void)=>void = function(_resolve:(_uid:number)=>void):void{

            // Connection.socket = io.connect("106.75.222.192:1999");

            Connection.socket = io.connect("127.0.0.1:1999");
            
            Connection.socket.on("connectOver", _resolve);
        }

        return new Promise<number>(fun);
    }

    public static listen<T>(_tag:string, _cb:(_data:T)=>void):void{

        Connection.socket.on(_tag, _cb);
    }

    public static emit<T>(_tag:string, _data:T):void{

        Connection.socket.emit(_tag, _data);
    }
}