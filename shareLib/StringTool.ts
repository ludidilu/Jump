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

        let posHeight:number = byteArray.position;

        byteArray.writeInt(this.height);//height

        byteArray.writeShort(1);

        byteArray.writeShort(24);

        byteArray.writeInt(0);

        byteArray.writeInt(3);

        byteArray.writeInt(0);

        byteArray.writeInt(0);

        byteArray.writeInt(0);

        byteArray.writeInt(0);




        let pos0:number = byteArray.position;

        byteArray.writeByte(0);

        byteArray.writeByte(0);

        byteArray.writeByte(0);

        let pos1:number = byteArray.position;

        byteArray.writeUTFBytes(_str);

        let pos2:number = byteArray.position;

        let length:number = pos2 - pos1;

        let pixelNum:number = Math.ceil(length / 3) + 1;

        let drawHeight:number = Math.ceil(pixelNum / this.width);

        let num:number = pixelNum * 3 - 3 - length;

        let t0:number = length >> 16 & 0xff;

        let t1:number = length >> 8 & 0xff;

        let t2:number = length & 0xff;

        byteArray.position = pos0;

        byteArray.writeByte(t0);        

        byteArray.writeByte(t1);

        byteArray.writeByte(t2);

        byteArray.position = pos2;

        for(let i:number = 0 ; i < num ; i++){

            byteArray.writeByte(0);
        }

        let times:number = Math.ceil(length / 3) + 1;

        for(let i:number = 0 ; i < times ; i++){

            let y:number = Math.floor(i / this.width);

            if(y >= Math.ceil(drawHeight / 2)){

                break;
            }

            let x:number = i % this.width;

            let nowPos:number = pos0 + i * 3;

            let targetPos:number = pos0 + ((drawHeight - 1 - y) * this.width + x) * 3;

            byteArray.position = nowPos;

            let n0:number = byteArray.readByte();

            let n1:number = byteArray.readByte();

            let n2:number = byteArray.readByte();

            if(i != 0){

                n0 += 128;

                n1 += 128;

                n2 += 128;
            }

            byteArray.position = targetPos;

            t0 = byteArray.readByte() + 128;

            t1 = byteArray.readByte() + 128;

            t2 = byteArray.readByte() + 128;

            let tmp:number = n0;

            n0 = n2;

            n2 = tmp;

            tmp = t0;

            t0 = t2;

            t2 = tmp;

            tmp = n0;

            n0 = t0;

            t0 = tmp;

            tmp = n1;

            n1 = t1;

            t1 = tmp;

            tmp = n2;

            n2 = t2;

            t2 = tmp;

            byteArray.position = nowPos;

            byteArray.writeByte(n0);

            byteArray.writeByte(n1);

            byteArray.writeByte(n2);

            byteArray.position = targetPos;

            byteArray.writeByte(t0);

            byteArray.writeByte(t1);

            byteArray.writeByte(t2);
        }

        byteArray.position = posHeight;

        byteArray.writeInt(drawHeight);

        let bpd:egret.BitmapData = egret.BitmapData.create("arraybuffer", byteArray.rawBuffer);

        return bpd;
    }

    public static stringToObj(_str:string):egret.DisplayObjectContainer{

        let byteArray:egret.ByteArray = new egret.ByteArray();

        byteArray.writeUTFBytes(_str);

        byteArray.position = 0;

        console.log("stringToObj  length:" + byteArray.length);

        let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

        let sp:egret.Shape = new egret.Shape();

        sp.graphics.beginFill(byteArray.length);

        sp.graphics.drawRect(0,0,1,1);

        sp.graphics.endFill();

        container.addChild(sp);

        let times:number = Math.ceil(byteArray.length / 3);

        for(let i:number = 1 ; i <= times ; i++){

            let x:number = i % this.width;

            let y:number = Math.floor(i / this.width);

            let r:number;

            let g:number;

            let b:number;

            r = byteArray.readByte() + 128;

            console.log("i:" + i + "  r:" + r);

            if(byteArray.bytesAvailable > 0){

                g = byteArray.readByte() + 128;

                console.log("i:" + i + "  g:" + g);

                if(byteArray.bytesAvailable > 0){

                    b = byteArray.readByte() + 128;

                    console.log("i:" + i + "  b:" + b);
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

        // container.cacheAsBitmap = true;

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

            byteArray.writeByte(arr[0] - 128);

            length--;

            if(length > 0){

                byteArray.writeByte(arr[1] - 128);

                length--;
            }
            else{

                break;
            }

            if(length > 0){

                byteArray.writeByte(arr[2] - 128);

                length--;
            }
            else{

                break;
            }
        }

        byteArray.position = 0;
        
        return byteArray.readUTFBytes(byteArray.length);
    }

    public static objToString2(_obj:egret.DisplayObject):string{

        let rt:egret.RenderTexture = new egret.RenderTexture();

        let drawWidth:number = _obj.width < this.width ? _obj.width : this.width;

        let drawHeight:number = _obj.height < this.height ? _obj.height : this.height;

        rt.drawToTexture(_obj, new egret.Rectangle(0,0,drawWidth, drawHeight));

        let arr:number[] = rt.getPixel32(0,drawHeight - 1);

        let length:number = arr[0] << 16 | arr[1] << 8 | arr[2];

        if(length == 0){

            return null;
        }

        console.log("objToString2  length:" + length + "   drawWidth:" + drawWidth + "   drawHeight:" + drawHeight);

        let times:number = Math.ceil(length / 3) + 1;

        let readWidth:number = times < drawWidth ? times : drawWidth;

        let readHeight:number = Math.ceil(times / readWidth);

        arr = rt.getPixels(0, 0, readWidth, readHeight);

        console.log("arr:" + arr);

        let byteArray:egret.ByteArray = new egret.ByteArray();
        
        for(let i:number = 1 ; i < times ; i++){

            byteArray.writeByte(arr[i * 4] - 128);

            console.log("i:" + i + "  r:" + arr[i * 4]);

            length--;

            if(length > 0){

                byteArray.writeByte(arr[i * 4 + 1] - 128);

                console.log("i:" + i + "  g:" + arr[i * 4 + 1]);

                length--;
            }
            else{

                break;
            }

            if(length > 0){

                byteArray.writeByte(arr[i * 4 + 2] - 128);

                console.log("i:" + i + "  b:" + arr[i * 4 + 2]);

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