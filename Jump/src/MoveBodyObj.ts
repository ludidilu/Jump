class MoveBodyObj extends BodyObj{

    public radius:number;

    public updateDisplaysPosition(_dt?:number):void{

        let posIndex:number = Math.floor(this.position[0] / Main.config.unitWidth);

        let minX:number = posIndex * Main.config.unitWidth;

        let maxX:number = minX + Main.config.unitWidth;

        let minY:number = (posIndex + 1) * Main.config.unitHeight;

        let maxY:number = minY + Main.config.unitHeight;

        if(this.position[1] - this.radius - Main.config.collisionCheckFix < minY){

            this.shapes[0].collisionMask = this.shapes[0].collisionMask | Main.LADDER_GROUP;
        }
        else if(this.position[1] - this.radius - Main.config.collisionCheckFix < maxY && this.position[0] + this.radius + Main.config.collisionCheckFix > maxX){

            this.shapes[0].collisionMask = this.shapes[0].collisionMask | Main.LADDER_GROUP;
        }
        else{

            this.shapes[0].collisionMask = this.shapes[0].collisionMask & ~Main.LADDER_GROUP;
        }

        super.updateDisplaysPosition();
    }
}