enum BodyObjType{
    HUMAN,
    ENEMY,
    LADDER
}

class RecordData{

    public rec_position:number[] = [0, 0];

    public rec_velocity:number[] = [0, 0];

    public rec_angle:number;

    public rec_force:number[] = [0, 0];

    public rec_angularForce:number;

    public rec_angularVelocity:number;

    public rec_previousAngle:number;

    public rec_previousPosition:number[] = [0, 0];

    public rec_vlambda:number[] = [0, 0];

    public rec_wlambda:number;
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

        this.force[0] = 0;

        this.force[1] = 0;

        this.angularForce = 0;

        this.angularVelocity = 0;

        this.vlambda[0] = 0;

        this.vlambda[1] = 0;

        this.wlambda = 0;

        this.setAngle(0);
    }
    
    public static fixNumber(_v:number):number{

        let str:string = _v.toFixed(4);

        let v:number = parseFloat(str);

        return v;
    }

    public fixFloat():void{
        
        this.position[0] = BodyObj.fixNumber(this.position[0]);

        this.position[1] = BodyObj.fixNumber(this.position[1]);

        this.velocity[0] = BodyObj.fixNumber(this.velocity[0]);

        this.velocity[1] = BodyObj.fixNumber(this.velocity[1]);

        this.angle = BodyObj.fixNumber(this.angle);

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
    }

    public recordData(_recordData:RecordData):void{

        _recordData.rec_position[0] = this.position[0];

        _recordData.rec_position[1] = this.position[1];

        _recordData.rec_velocity[0] = this.velocity[0];

        _recordData.rec_velocity[1] = this.velocity[1];

        _recordData.rec_angle = this.angle;

        _recordData.rec_force[0] = this.force[0];

        _recordData.rec_force[1] = this.force[1];

        _recordData.rec_angularForce = this.angularForce;

        _recordData.rec_angularVelocity = this.angularVelocity;

        _recordData.rec_previousAngle = this.previousAngle;

        _recordData.rec_previousPosition[0] = this.previousPosition[0];

        _recordData.rec_previousPosition[1] = this.previousPosition[1];

        _recordData.rec_vlambda[0] = this.vlambda[0];

        _recordData.rec_vlambda[1] = this.vlambda[1];

        _recordData.rec_wlambda = this.wlambda;
    }

    public useRecordData(_recordData:RecordData):void{

        this.position[0] = _recordData.rec_position[0];

        this.position[1] = _recordData.rec_position[1];

        this.velocity[0] = _recordData.rec_velocity[0];

        this.velocity[1] = _recordData.rec_velocity[1];

        this.angle = _recordData.rec_angle;

        this.force[0] = _recordData.rec_force[0];

        this.force[1] = _recordData.rec_force[1];

        this.angularForce = _recordData.rec_angularForce;

        this.angularVelocity = _recordData.rec_angularVelocity;

        this.previousAngle = _recordData.rec_previousAngle;

        this.previousPosition[0] = _recordData.rec_previousPosition[0];

        this.previousPosition[1] = _recordData.rec_previousPosition[1];

        this.vlambda[0] = _recordData.rec_vlambda[0];

        this.vlambda[1] = _recordData.rec_vlambda[1];

        this.wlambda = _recordData.rec_wlambda;
    }
}