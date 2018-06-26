class WeixinTalk{

    public static testContainer:egret.DisplayObjectContainer;

    private static openDataContext:OpenDataContext;

    private static bitmap:egret.Bitmap;

    private static bitmapData:egret.BitmapData;

    private static cb:(str:string)=>void;

    private static talkOverCommand:{} = {command:"talkOver"};

    public static init():void{

        this.openDataContext = wx.getOpenDataContext();

        let canvas:Canvas = this.openDataContext.canvas;

        canvas.height = canvas.width;

        this.bitmapData = new egret.BitmapData(canvas);

        this.bitmapData.$deleteSource = false;

        let texture = new egret.Texture();

        texture.bitmapData = this.bitmapData;

        this.bitmap = new egret.Bitmap(texture);

        this.bitmap.width = StringTool.width;

        this.bitmap.height = StringTool.height;

        this.bitmap.smoothing = false;
    }

    public static Talk(_obj:any):Promise<string>{

        if(this.cb){

            throw new Error("duplicated talk!");
        }

        egret.startTick(this.update, this);

        let cb:(resolve:(str:string)=>void)=>void = function(resolve:(str:string)=>void):void{

            WeixinTalk.cb = resolve;
        };

        this.openDataContext.postMessage(_obj);

        return new Promise<string>(cb);
    }

    public static talk(_obj:any, _cb:(_str:string)=>void):void{

        if(this.cb){

            throw new Error("duplicated talk!");
        }

        this.cb = _cb;

        this.openDataContext.postMessage(_obj);
    }

    private static update(dt:number):boolean{

        egret.WebGLUtils.deleteWebGLTexture(this.bitmapData.webGLTexture);

        this.bitmapData.webGLTexture = null;

        if(this.cb){

            let str = StringTool.objToString2(this.bitmap);

            if(str){

                egret.stopTick(this.update, this);

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