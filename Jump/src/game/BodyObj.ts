enum BodyObjType{
    HUMAN,
    ENEMY,
    LADDER
}

class BodyObj extends p2.Body{

    public static zeroPoint:number[] = [0,0];

    private static bodyObjTmpVec:number[] = [0,0];

    private static forceFix:number;

    public bodyType:BodyObjType;

    public updateDisplaysPosition():void{

        let display: egret.DisplayObject = this.displays[0];

        display.x = this.interpolatedPosition[0] * Main.config.gameConfig.factor;
        display.y = Game.STAGE_HEIGHT - this.interpolatedPosition[1] * Main.config.gameConfig.factor;
        display.rotation = 360 - (this.interpolatedAngle + this.shapes[0].angle) * 180 / Math.PI;
    }

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
    
    private static fixNumber(_v:number):number{

        let str:string = _v.toFixed(4);

        let v:number = parseFloat(str);

        return v;
    }

    public fixFloat():void{

        this.velocity[0] = BodyObj.fixNumber(this.velocity[0]);

        this.velocity[1] = BodyObj.fixNumber(this.velocity[1]);

        this.force[0] = BodyObj.fixNumber(this.force[0]);

        this.force[1] = BodyObj.fixNumber(this.force[1]);

        this.angularForce = BodyObj.fixNumber(this.angularForce);

        this.angularVelocity = BodyObj.fixNumber(this.angularVelocity);

        this.previousAngle = BodyObj.fixNumber(this.previousAngle);

        this.previousPosition[0] = BodyObj.fixNumber(this.previousPosition[0]);

        this.previousPosition[1] = BodyObj.fixNumber(this.previousPosition[1]);

        this.vlambda[0] = BodyObj.fixNumber(this.vlambda[0]);

        this.vlambda[1] = BodyObj.fixNumber(this.vlambda[1]);

        this.wlambda = BodyObj.fixNumber(this.wlambda);

        this.position[0] = BodyObj.fixNumber(this.position[0]);

        this.position[1] = BodyObj.fixNumber(this.position[1]);

        this.angle = BodyObj.fixNumber(this.angle);
    }
}