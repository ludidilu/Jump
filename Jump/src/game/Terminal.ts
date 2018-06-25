class Terminal extends egret.Shape{

    private static terminal:Terminal;

    public static create(_container:egret.DisplayObjectContainer, _level:number):void{

        if(!this.terminal){

            let terminal:egret.Shape = new egret.Shape();

            terminal.graphics.beginFill(0x00ff00);

            terminal.graphics.drawRect(-0.5 * Main.config.gameConfig.terminalWidth, 0, Main.config.gameConfig.terminalWidth, _container.stage.stageHeight);

            terminal.graphics.endFill();

            this.terminal = terminal;
        }

        _container.addChild(this.terminal);

        this.terminal.x = (Main.config.gameConfig.unitWidth * (_level - 1) + Main.config.gameConfig.finalLadderXFix) * Main.config.gameConfig.factor;
    }

    public static update():void{

        this.terminal.y = -this.terminal.parent.parent.y;
    }

    public static reset():void{

        this.terminal.parent.removeChild(this.terminal);
    }
}