enum BodyObjType{
    HUMAN,
    ENEMY,
    LADDER,
    REWARD
}

class BodyObj extends p2.Body{

    public static zeroPoint:number[] = [0,0];

    private static bodyObjTmpVec:number[] = [0,0];

    private static forceFix:number;

    public bodyType:BodyObjType;

    public updateDisplaysPosition(_dt?:number):void{

        let display: egret.DisplayObject = this.displays[0];

        display.x = this.interpolatedPosition[0] * Main.config.gameConfig.factor;
        display.y = Game.STAGE_HEIGHT - this.interpolatedPosition[1] * Main.config.gameConfig.factor;
        display.rotation = 360 - (this.interpolatedAngle + this.shapes[0].angle) * 180 / Math.PI;
    }

    // public updateDisplaysPosition(_dt?:number):void{

    //     let display: egret.DisplayObject = this.displays[0];

    //     display.x = this.position[0] * Main.config.factor;
    //     display.y = display.stage.stageHeight - this.position[1] * Main.config.factor;
    //     display.rotation = 360 - (this.angle + this.shapes[0].angle) * 180 / Math.PI;
    // }

    public setPosition(_x:number, _y:number):void{

        this.position[0] = this.previousPosition[0] = this.interpolatedPosition[0] = _x;

        this.position[1] = this.previousPosition[1] = this.interpolatedPosition[1] = _y;
    }

    public setAngle(_angle):void{

        this.angle = this.previousAngle = this.interpolatedAngle = _angle;
    }

    public applyForce(_force:number[], _point:number[]):void{

        if(!BodyObj.forceFix){

            BodyObj.forceFix = Main.config.gameConfig.physicsEngineFps / 60;
        }

        BodyObj.bodyObjTmpVec[0] = _force[0] * BodyObj.forceFix;

        BodyObj.bodyObjTmpVec[1] = _force[1] * BodyObj.forceFix;

        super.applyForce(BodyObj.bodyObjTmpVec, _point);
    }

    public reset():void{

        this.velocity[0] = 0;

        this.velocity[1] = 0;

        this.angularVelocity = 0;

        this.setAngle(0);
    }
}