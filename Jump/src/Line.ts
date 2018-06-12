class Line extends egret.Shape{

    public static lineArr:Line[] = []

    public static container:egret.DisplayObjectContainer;

    private static pool:Line[] = [];

    public worldY:number;

    public static create(_worldY:number):void{

        let line:Line;

        if(Line.pool.length > 0){

            line = Line.pool.pop();
        }
        else{

            line = new Line();

            line.graphics.beginFill(0x00ffff, 0.5);

            line.graphics.drawRect(0,0,Line.container.stage.stageWidth, Main.config.lineWidth * Main.config.factor);

            line.graphics.endFill();
        }

        line.worldY = _worldY;

        Line.container.addChild(line);
        
        line.y = Line.container.stage.stageHeight - _worldY * Main.config.factor - Main.config.lineWidth * 0.5 * Main.config.factor;

        line.x = -Line.container.parent.x;

        Line.lineArr.push(line);
    }

    public static update():void{

        for(let i:number = Line.lineArr.length - 1 ; i > -1 ; i--){

            let line:Line = Line.lineArr[i];

            if(Line.container.parent.y + line.y - Main.config.lineWidth * 0.5 * Main.config.factor > Line.container.stage.stageHeight){

                Line.container.removeChild(line);

                Line.pool.push(line);

                Line.lineArr.splice(i, 1);
            }
            else{

                line.x = -Line.container.parent.x;
            }
        }
    }
}