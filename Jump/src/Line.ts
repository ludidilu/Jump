class Line extends egret.Shape{

    public static lineArr:Line[] = []

    private static pool:Line[] = [];

    public worldY:number;

    public static create(_worldY:number, _container:egret.DisplayObjectContainer):void{

        let line:Line;

        if(Line.pool.length > 0){

            line = Line.pool.pop();
        }
        else{

            line = new Line();

            line.graphics.beginFill(0x00ffff, 0.5);

            line.graphics.drawRect(0,0,_container.stage.stageWidth, Main.config.lineWidth * Main.config.factor);

            line.graphics.endFill();
        }

        line.worldY = _worldY;

        _container.addChild(line);
        
        line.y = _container.stage.stageHeight - _worldY * Main.config.factor - Main.config.lineWidth * 0.5 * Main.config.factor;

        line.x = -_container.parent.x;

        Line.lineArr.push(line);
    }

    public static update():void{

        for(let i:number = Line.lineArr.length - 1 ; i > -1 ; i--){

            let line:Line = Line.lineArr[i];

            if(line.parent.parent.y + line.y - Main.config.lineWidth * 0.5 * Main.config.factor > line.stage.stageHeight){

                line.parent.removeChild(line);

                Line.pool.push(line);

                Line.lineArr.splice(i, 1);
            }
            else{

                line.x = -line.parent.parent.x;
            }
        }
    }
}