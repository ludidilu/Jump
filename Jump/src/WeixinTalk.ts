class WeixinTalk{

    private static openDataContext:OpenDataContext;

    private static bitmap:egret.Bitmap;

    private static bitmapData:egret.BitmapData;

    private static cb:(_str:string)=>void;

    private static talkOverCommand:{} = {command:"talkOver"};

    public static init(_width:number, _height:number):void{

        this.openDataContext = wx.getOpenDataContext();

        this.bitmapData = new egret.BitmapData(window["sharedCanvas"]);

        this.bitmapData.$deleteSource = false;

        let texture = new egret.Texture();

        texture.bitmapData = this.bitmapData;

        this.bitmap = new egret.Bitmap(texture);

        this.bitmap.width = _width;

        this.bitmap.height = _height;

        this.bitmap.smoothing = false;

        egret.startTick(this.update, this);
    }

    public static talk(_obj:any, _cb:(_str:string)=>void):void{

        this.cb = _cb;

        this.openDataContext.postMessage(_obj);
    }

    private static update(dt:number):boolean{

        egret.WebGLUtils.deleteWebGLTexture(this.bitmapData.webGLTexture);

        this.bitmapData.webGLTexture = null;

        if(this.cb){

            let str = StringTool.objToString2(this.bitmap);

            if(str){

                this.openDataContext.postMessage(this.talkOverCommand);
                
                let cb = this.cb;

                this.cb = null;

                cb(str);
            }
        }

        return false;
    }

    public static isTalking():boolean{

        return this.cb != null;
    }
}