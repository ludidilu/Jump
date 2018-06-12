class BodyObj extends p2.Body{

    public updateDisplaysPosition(_dt?:number):void{

        if(this.displays && this.displays.length > 0){

            let display: egret.DisplayObject = this.displays[0];

            display.x = this.position[0] * Main.config.factor;
            display.y = display.stage.stageHeight - this.position[1] * Main.config.factor;
            display.rotation = 360 - (this.angle + this.shapes[0].angle) * 180 / Math.PI;
        }
    }
}