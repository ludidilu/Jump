class Reward extends egret.DisplayObjectContainer{

    private static sin:number;

    private static cos:number;

    public radius:number;

    public jumpHeight:number;

    public xSpeed:number;

    public ySpeed:number;

    public worldX:number;

    public worldY:number;

    public static initAngle():void{

        let angle:number = Math.atan(Main.config.gameConfig.triangleWidth / Main.config.gameConfig.triangleHeight);

        Reward.sin = -Math.sin(angle);

        Reward.cos = Math.cos(angle);
    }

    public isHitHuman(_checkDistance:number):boolean{

        let dx:number = this.worldX - Human.human.position[0];

        let dy:number = this.worldY - Human.human.position[1];

        if(dx * dx + dy * dy < _checkDistance){

            let x0:number = Human.headPoint[0];

            let y0:number = Human.headPoint[1];

            let x1:number = Human.footPoint[0];

            let y1:number = Human.footPoint[1];

            let x2:number = this.worldX;

            let y2:number = this.worldY;

            let dist:number = MathTool.checkCircleContactWithLine(x0, y0, x1, y1, x2, y2);

            if(dist < this.radius + Main.config.gameConfig.humanRadius * Human.human.sizeFix){

                return true;
            }
        }
        
        return false;
    }

    public update(_dt:number):void{

        this.worldX += this.xSpeed * _dt * 0.001;

        let nowYSpeed:number = this.ySpeed;

        let newYSpeed:number = this.ySpeed - _dt * 0.001 * Main.config.gameConfig.rewardGravity;

        this.worldY += (nowYSpeed + newYSpeed) * _dt * 0.001 * 0.5;

        let posIndex:number = Math.floor(this.worldX / Main.config.gameConfig.unitWidth);

        let minX:number = posIndex * Main.config.gameConfig.unitWidth;

        let maxX:number = minX + Main.config.gameConfig.unitWidth;

        let minY:number = (posIndex + 1) * Main.config.gameConfig.unitHeight;

        let maxY:number = minY + Main.config.gameConfig.unitHeight;

        if(this.worldX + this.radius > maxX){

            if(this.worldY - this.radius > maxY){

                this.ySpeed = newYSpeed;
            }
            else{

                let x0:number = maxX;

                let y0:number = maxY - Main.config.gameConfig.triangleHeight;

                let x1:number = maxX + Main.config.gameConfig.triangleWidth;

                let y1:number = maxY;

                let x2:number = this.worldX;

                let y2:number = this.worldY;

                let dist:number = MathTool.checkCircleContactWithLine(x0, y0, x1, y1, x2, y2);

                if(dist < this.radius){

                    this.worldX -= (this.radius - dist) * Reward.cos;

                    this.worldY -= (this.radius - dist) * Reward.sin;

                    this.xSpeed += newYSpeed * Reward.cos;

                    this.ySpeed = newYSpeed * Reward.sin;
                }
                else{

                    this.ySpeed = newYSpeed;
                }
            }
        }
        else if(this.worldX < minX + Main.config.gameConfig.triangleWidth){

            if(this.worldY - this.radius > minY){

                this.ySpeed = newYSpeed;
            }
            else{

                let x0:number = minX;

                let y0:number = minY - Main.config.gameConfig.triangleHeight;

                let x1:number = minX + Main.config.gameConfig.triangleWidth;

                let y1:number = minY;

                let x2:number = this.worldX;

                let y2:number = this.worldY;

                let dist:number = MathTool.checkCircleContactWithLine(x0, y0, x1, y1, x2, y2);

                if(dist < this.radius){

                    this.worldX -= (this.radius - dist) * Reward.cos;

                    this.worldY -= (this.radius - dist) * Reward.sin;

                    this.xSpeed += newYSpeed * Reward.cos;

                    this.ySpeed = newYSpeed * Reward.sin;
                }
                else{

                    this.ySpeed = newYSpeed;
                }
            }
        }
        else{

            if(this.worldY - this.radius < minY){

                this.worldY = (minY + this.radius) * 2 - this.worldY;

                this.ySpeed = Math.sqrt(this.jumpHeight * 2 * Main.config.gameConfig.rewardGravity);
            }
            else{

                this.ySpeed = newYSpeed;
            }
        }

        this.updateDisplaysPosition();
    }

    public updateDisplaysPosition():void{

        this.x = this.worldX * Main.config.gameConfig.factor;

        this.y = this.stage.stageHeight - this.worldY * Main.config.gameConfig.factor;
    }
}