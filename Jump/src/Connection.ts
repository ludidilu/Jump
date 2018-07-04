class Connection{

    private static socket:SocketIOClient.Socket;

    public static init():void{

        Connection.socket = io.connect("1.1.1.118:1999");

        Connection.socket.on("connect", this.connected.bind(this));

        
    }

    private static connected():void{

        console.log("connected!");
    }
}