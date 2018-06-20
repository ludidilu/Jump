class WeixinTalk{

    private static openDataContext:OpenDataContext;

    private static bitmap:egret.Bitmap;

    private static bitmapData:egret.BitmapData;

    private static cb:(_str:string)=>void;

    private static talkOverCommand:{} = {command:"talkOver"};

    public static talk(_obj:any, _cb:(_str:string)=>void, _container:egret.DisplayObjectContainer):void{

        if(!this.openDataContext){

            this.openDataContext = wx.getOpenDataContext();

            this.bitmapData = new egret.BitmapData(window["sharedCanvas"]);

            console.log("talk bpd.width:" + this.bitmapData.width + "  height:" + this.bitmapData.height + "   c.width:" + _container.stage.stageWidth + "  c.height:" + _container.stage.stageHeight);

            this.bitmapData.$deleteSource = false;

            let texture = new egret.Texture();

            texture.bitmapData = this.bitmapData;

            this.bitmap = new egret.Bitmap(texture);

            egret.startTick(this.update, this);

            _container.addChild(this.bitmap);

            this.bitmap.scaleX = 100;

            this.bitmap.scaleY = 100;

            this.bitmap.smoothing = false;

            // this.bitmap.width = _container.stage.stageWidth;

            // this.bitmap.height = _container.stage.stageHeight;
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

                console.log("talk reply:" + str);

                this.cb = null;

                return;

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