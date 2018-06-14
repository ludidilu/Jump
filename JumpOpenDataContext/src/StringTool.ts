class StringTool{

    public static width:number = 32;

    public static height:number = 32;

    public static stringToBmp(_str:string):egret.BitmapData{

        let byteArray:egret.ByteArray = new egret.ByteArray();

        byteArray.endian = egret.Endian.LITTLE_ENDIAN;

        byteArray.writeUTFBytes("BM");

        byteArray.writeInt(1000);

        byteArray.writeShort(0);

        byteArray.writeShort(0);

        byteArray.writeInt(54);




        byteArray.writeInt(40);

        byteArray.writeInt(this.width);//width

        byteArray.writeInt(this.height);//height

        byteArray.writeShort(1);

        byteArray.writeShort(24);

        byteArray.writeInt(0);

        byteArray.writeInt(3);

        byteArray.writeInt(0);

        byteArray.writeInt(0);

        byteArray.writeInt(0);

        byteArray.writeInt(0);

        let num = this.width * this.height * 3;

        let length = _str.length;

        let t0:number = length>>16 & 0xff;

        let t1:number = length>>8 & 0xff;

        let t2:number = length & 0xff;

        byteArray.writeByte(t0);

        byteArray.writeByte(t1);

        byteArray.writeByte(t2);

        num -= 3;

        byteArray.writeUTFBytes(_str);

        num -= _str.length;

        for(let i:number = 0 ; i < num ; i++){

            byteArray.writeByte(255);
        }

        let bpd:egret.BitmapData = egret.BitmapData.create("arraybuffer", byteArray.rawBuffer);

        return bpd;
    }

    public static stringToObj(_str:string):egret.DisplayObjectContainer{

        let byteArray:egret.ByteArray = new egret.ByteArray();

        let length:number = _str.length;

        let t0:number = length>>16 & 0xff;

        let t1:number = length>>8 & 0xff;

        let t2:number = length & 0xff;

        byteArray.writeByte(t0);

        byteArray.writeByte(t1);

        byteArray.writeByte(t2);

        byteArray.writeUTFBytes(_str);

        byteArray.position = 0;

        let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

        let times:number = Math.ceil(byteArray.length / 3);

        for(let i:number = 0 ; i < times ; i++){

            let x:number = i % this.width;

            let y:number = Math.floor(i / this.width);

            let r:number;

            let g:number;

            let b:number;

            r = byteArray.readByte();

            if(byteArray.bytesAvailable > 0){

                g = byteArray.readByte();

                if(byteArray.bytesAvailable > 0){

                    b = byteArray.readByte();
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

            let color:number = r << 16 | g << 8 | b;

            sp.graphics.beginFill(color);

            sp.graphics.drawRect(x,y,1,1);

            sp.graphics.endFill();

            container.addChild(sp);
        }

        container.cacheAsBitmap = true;

        return container;
    }

    public static objToString(_obj:egret.DisplayObject):string{

        let rt:egret.RenderTexture = new egret.RenderTexture();

        let drawWidth:number = _obj.width < this.width ? _obj.width : this.width;

        let drawHeight:number = _obj.height < this.height ? _obj.height : this.height;

        rt.drawToTexture(_obj, new egret.Rectangle(0,0,drawWidth, drawHeight));

        let arr:number[] = rt.getPixel32(0,drawHeight - 1);

        let length:number = arr[0] << 16 | arr[1] << 8 | arr[2];

        if(length == 0){

            return null;
        }

        let times:number = Math.ceil(length / 3);

        let byteArray:egret.ByteArray = new egret.ByteArray();

        for(let i:number = 0 ; i < times ; i++){

            let x:number = (i + 1) % drawWidth;

            let y:number = drawHeight - 1 - Math.floor((i + 1) / drawWidth);

            arr = rt.getPixel32(x,y);

            byteArray.writeByte(arr[0]);

            length--;

            if(length > 0){

                byteArray.writeByte(arr[1]);

                length--;
            }
            else{

                break;
            }

            if(length > 0){

                byteArray.writeByte(arr[2]);

                length--;
            }
            else{

                break;
            }
        }

        byteArray.position = 0;
        
        return byteArray.readUTFBytes(byteArray.length);
    }
}