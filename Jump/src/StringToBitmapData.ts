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
}