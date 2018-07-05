class MoveBodyObj extends BodyObj{

    public radius:number;

    public uid:number;

    public updateDisplaysPosition(_dt?:number):void{

        let shape:p2.Shape = this.shapes[0];

        let posIndex:number = Math.floor(this.position[0] / Main.config.gameConfig.unitWidth);

        let minX:number = posIndex * Main.config.gameConfig.unitWidth;

        let maxX:number = minX + Main.config.gameConfig.unitWidth;

        let minY:number = (posIndex + 1) * Main.config.gameConfig.unitHeight;

        let maxY:number = minY + Main.config.gameConfig.unitHeight;

        if(this.position[1] - this.radius - Main.config.gameConfig.collisionCheckFix < minY){

            shape.collisionMask = shape.collisionMask | Math.pow(2, this.uid);
        }
        else if(this.position[1] - this.radius - Main.config.gameConfig.collisionCheckFix < maxY && this.position[0] + this.radius + Main.config.gameConfig.collisionCheckFix > maxX){

            shape.collisionMask = shape.collisionMask | Math.pow(2, this.uid);
        }
        else{

            shape.collisionMask = shape.collisionMask & ~Math.pow(2, this.uid);
        }

        super.updateDisplaysPosition();
    }
}