class StringToBitmapData{

    public static create(_str:string):egret.BitmapData{

        let kkk = new egret.ByteArray();

        kkk.endian = egret.Endian.LITTLE_ENDIAN;

        kkk.writeUTFBytes("BM");

        kkk.writeInt(1000);

        kkk.writeShort(0);

        kkk.writeShort(0);

        kkk.writeInt(54);




        kkk.writeInt(40);

        kkk.writeInt(16);//width

        kkk.writeInt(16);//height

        kkk.writeShort(1);

        kkk.writeShort(24);

        kkk.writeInt(0);

        kkk.writeInt(3);

        kkk.writeInt(0);

        kkk.writeInt(0);

        kkk.writeInt(0);

        kkk.writeInt(0);

        let num = 16 * 16 * 3;

        kkk.writeShort(_str.length);

        kkk.writeByte(0);

        num -= 3;

        kkk.writeUTFBytes(_str);

        num -= _str.length;

        for(let i = 0 ; i < num ; i++){

            kkk.writeByte(255);
        }

        console.log("oi:" + kkk.length);

        let bbb = egret.BitmapData.create("arraybuffer", kkk.rawBuffer);

        return bbb;
    }

    public static bitmapDataToString(_bpd:egret.RenderTexture):string{
        
         let kk = _bpd.getPixel32(0, 0);

         let length = kk[0] * 256 * 256 + kk[1] * 256 + kk[2];

         let readTimes = Math.ceil(length / 3);

         let index:number = 1;

         let oioi = new egret.ByteArray();

         while(true){

             let x = index % 16;

             let y = Math.floor(index / 16);

             index++;

             kk = _bpd.getPixel32(x, y);

             oioi.writeByte(kk[2]);

             length--;

             if(length == 0){

                 break;
             }

             oioi.writeByte(kk[1]);

             length--;

             if(length == 0){

                 break;
             }

             oioi.writeByte(kk[0]);

             length--;

             if(length == 0){

                 break;
             }
         }

         oioi.position = 0;

         let result = oioi.readUTFBytes(oioi.length);

         return result;
    }

    public static createDisplayObjectContainer(_str:string):egret.DisplayObjectContainer{

        console.log("sss:" + _str.length);

        let kkk = new egret.ByteArray();

        kkk.endian = egret.Endian.LITTLE_ENDIAN;

        kkk.writeShort(_str.length);

        kkk.writeByte(0);

        kkk.writeUTFBytes(_str);

        console.log("kkk:" + kkk.length);

        kkk.position = 0;

        let container = new egret.DisplayObjectContainer();

        let times = Math.ceil(kkk.length / 3);

        for(let i = 0 ; i < times ; i++){

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

            sp.graphics.beginFill(r * 256 * 256 + g * 256 + b);

            sp.graphics.drawRect(i,0,1,1);

            sp.graphics.endFill();

            container.addChild(sp);
        }

        container.width = times;
        
        container.height = 1;

        return container;
    }

    public static fromDisplayObjectContainer(_obj:egret.DisplayObject):string{
        let rt = new egret.RenderTexture();
        rt.drawToTexture(_obj, new egret.Rectangle(0,0,_obj.width,1));

        let arr = rt.getPixel32(0,0);
        let length = arr[0] * 256 + arr[1];

        let times = Math.ceil(length / 3);

        let by = new egret.ByteArray();

        for(let i = 0 ; i < times ; i++){

            arr = rt.getPixel32(i + 1, 0);

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