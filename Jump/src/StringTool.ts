class StringTool{

    public static width:number = 32;

    public static height:number = 32;

    public static stringToBmp(_str:string):egret.BitmapData{

        let kkk = new egret.ByteArray();

        kkk.endian = egret.Endian.LITTLE_ENDIAN;

        kkk.writeUTFBytes("BM");

        kkk.writeInt(1000);

        kkk.writeShort(0);

        kkk.writeShort(0);

        kkk.writeInt(54);




        kkk.writeInt(40);

        kkk.writeInt(this.width);//width

        kkk.writeInt(this.height);//height

        kkk.writeShort(1);

        kkk.writeShort(24);

        kkk.writeInt(0);

        kkk.writeInt(3);

        kkk.writeInt(0);

        kkk.writeInt(0);

        kkk.writeInt(0);

        kkk.writeInt(0);

        let num = this.width * this.height * 3;

        let length = _str.length;

        let t0:number = length>>16 & 0xff;

        let t1:number = length>>8 & 0xff;

        let t2:number = length & 0xff;

        kkk.writeByte(t0);

        kkk.writeByte(t1);

        kkk.writeByte(t2);

        num -= 3;

        kkk.writeUTFBytes(_str);

        num -= _str.length;

        for(let i = 0 ; i < num ; i++){

            kkk.writeByte(255);
        }

        let bbb = egret.BitmapData.create("arraybuffer", kkk.rawBuffer);

        return bbb;
    }

    public static stringToObj(_str:string):egret.DisplayObjectContainer{

        let kkk = new egret.ByteArray();

        let length = _str.length;

        let t0:number = length>>16 & 0xff;

        let t1:number = length>>8 & 0xff;

        let t2:number = length & 0xff;

        kkk.writeByte(t0);

        kkk.writeByte(t1);

        kkk.writeByte(t2);

        kkk.writeUTFBytes(_str);

        kkk.position = 0;

        let container = new egret.DisplayObjectContainer();

        let times = Math.ceil(kkk.length / 3);

        for(let i = 0 ; i < times ; i++){

            let x = i % this.width;

            let y = Math.floor(i / this.width);

            let r;

            let g;

            let b;

            r = kkk.readByte();

            if(kkk.bytesAvailable > 0){

                g = kkk.readByte();

                if(kkk.bytesAvailable > 0){

                    b = kkk.readByte();
                }
                else{

                    b = 0;
                }
            }
            else{

                g = 0;

                b = 0;
            }

            let sp:egret.Shape = new egret.Shape();

            let c = r << 16 | g << 8 | b;

            sp.graphics.beginFill(c);

            sp.graphics.drawRect(x,y,1,1);

            sp.graphics.endFill();

            container.addChild(sp);
        }

        container.cacheAsBitmap = true;

        return container;
    }

    public static objToString(_obj:egret.DisplayObject):string{

        let rt = new egret.RenderTexture();

        let drawWidth = _obj.width < this.width ? _obj.width : this.width;

        let drawHeight = _obj.height < this.height ? _obj.height : this.height;

        rt.drawToTexture(_obj, new egret.Rectangle(0,0,drawWidth, drawHeight));

        let arr = rt.getPixel32(0,drawHeight - 1);

        let length = arr[0] << 16 | arr[1] << 8 | arr[2];

        if(length == 0){

            return null;
        }

        let times = Math.ceil(length / 3);

        let by = new egret.ByteArray();

        for(let i = 0 ; i < times ; i++){

            let x = (i + 1) % drawWidth;

            let y = drawHeight - 1 - Math.floor((i + 1) / drawWidth);

            arr = rt.getPixel32(x,y);

            by.writeByte(arr[0]);

            length--;

            if(length > 0){

                by.writeByte(arr[1]);

                length--;
            }
            else{

                break;
            }

            if(length > 0){

                by.writeByte(arr[2]);

                length--;
            }
            else{

                break;
            }
        }

        by.position = 0;
        
        return by.readUTFBytes(by.length);
    }
}