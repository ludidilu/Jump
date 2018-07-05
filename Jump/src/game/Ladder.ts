class Ladder extends BodyObj{

    private static gameContainer:egret.DisplayObjectContainer;

    public static ladder:Ladder;

    private static nowHeight:number;

    private static changeHeightValue:number;

    public static create(_world:p2.World, _gameContainer:egret.DisplayObjectContainer, _mapContainer:egret.DisplayObjectContainer, _mat:p2.Material):void{

        this.gameContainer = _gameContainer;

        let verticesOrigin:number[][] = [[Main.config.gameConfig.unitWidth, Main.config.gameConfig.unitHeight], [Main.config.gameConfig.triangleWidth, Main.config.gameConfig.unitHeight],[0, Main.config.gameConfig.unitHeight - Main.config.gameConfig.triangleHeight],[0,0]];

        let conDisplay:egret.Shape = new egret.Shape();

        conDisplay.graphics.beginFill(0xff0000);

        let factorFix:number = 0.2;

        let factor:number = Main.config.gameConfig.factor * factorFix;

        conDisplay.graphics.moveTo((Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum + Main.config.gameConfig.ladderWidthFix) * factor, 0);

        conDisplay.graphics.lineTo((Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum + Main.config.gameConfig.ladderWidthFix) * factor, Main.config.gameConfig.unitHeight * Main.config.gameConfig.unitNum * -factor);

        let vertices:number[][] = [];

        vertices.push([Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum + Main.config.gameConfig.ladderWidthFix, -Main.config.gameConfig.ladderHeightFix]);

        vertices.push([Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum + Main.config.gameConfig.ladderWidthFix, Main.config.gameConfig.unitHeight * Main.config.gameConfig.unitNum]);

        for(let m:number = Main.config.gameConfig.unitNum - 1 ; m > -1 ; m--){

            for(let i:number = 1, n:number = verticesOrigin.length ; i < n ; i++){

                let arr:number[] = verticesOrigin[i];

                let arr2:number[];

                if(m == 0 && i == n - 1){

                    arr2 = [arr[0] + m * Main.config.gameConfig.unitWidth,arr[1] + m * Main.config.gameConfig.unitHeight - Main.config.gameConfig.ladderHeightFix];

                    conDisplay.graphics.lineTo((arr[0] + m * Main.config.gameConfig.unitWidth) * factor, (arr[1] + m * Main.config.gameConfig.unitHeight - Main.config.gameConfig.ladderHeightFix) * -factor);
                }
                else{

                    arr2 = [arr[0] + m * Main.config.gameConfig.unitWidth,arr[1] + m * Main.config.gameConfig.unitHeight];

                    conDisplay.graphics.lineTo((arr[0] + m * Main.config.gameConfig.unitWidth) * factor, (arr[1] + m * Main.config.gameConfig.unitHeight) * -factor);
                }

                vertices.push(arr2);
            }
        }

        conDisplay.graphics.lineTo((Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum + Main.config.gameConfig.ladderWidthFix) * factor, -Main.config.gameConfig.ladderHeightFix * factor);

        conDisplay.graphics.endFill();

        let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

        container.addChild(conDisplay);
        
        conDisplay.scaleX = 1 / factorFix;

        conDisplay.scaleY = 1 / factorFix;

        _mapContainer.addChild(container);

        this.ladder = new Ladder();
        this.ladder.bodyType = BodyObjType.LADDER;
        this.ladder.fromPolygon(vertices);
        this.ladder.displays = [container];
        _world.addBody(this.ladder);

        let minX:number = Number.MAX_VALUE;
        let minY:number = Number.MAX_VALUE;

        for(let i:number = 0, n:number = this.ladder.shapes.length; i < n ; i++){

            let shape:p2.Convex = <p2.Convex>this.ladder.shapes[i];

            shape.material = _mat;

            shape.collisionGroup = Game.LADDER_GROUP;

            shape.collisionMask = Game.HUMAN_GROUP | Game.ENEMY_GROUP;

            let pos:number[] = shape.position;

            for(let m:number = 0, l:number = shape.vertices.length; m < l ; m++){

                let x:number = shape.vertices[m][0] + pos[0];

                if(x < minX){

                    minX = x;
                }

                let y:number = shape.vertices[m][1] + pos[1];

                if(y < minY){

                    minY = y;
                }
            }
        }

        for(let i:number = 0, n:number = this.ladder.shapes.length; i < n ; i++){

            let shape:p2.Shape = this.ladder.shapes[i];

            shape.position[0] -= minX;

            shape.position[1] = shape.position[1] - minY - Main.config.gameConfig.ladderHeightFix;
        }
    }

    public static update():void{

        if(Game.stageConfig.maxLevel == 0 || this.nowHeight < Game.stageConfig.maxLevel - Main.config.gameConfig.unitNum){

            if(this.gameContainer.y > this.changeHeightValue){

                let addNum:number = Math.floor((this.gameContainer.y - this.changeHeightValue) / (Main.config.gameConfig.ladderChangeUnitNum * Main.config.gameConfig.unitHeight * Main.config.gameConfig.factor)) + 1;

                if(Game.stageConfig.maxLevel > 0 && this.nowHeight + addNum > Game.stageConfig.maxLevel - Main.config.gameConfig.unitNum){

                    addNum = Game.stageConfig.maxLevel - Main.config.gameConfig.unitNum - this.nowHeight;
                }

                this.setNowHeight(this.nowHeight + addNum);

                let ladderX:number = this.ladder.position[0] + (Main.config.gameConfig.unitWidth * Main.config.gameConfig.ladderChangeUnitNum * addNum);

                let ladderY:number = this.ladder.position[1] + (Main.config.gameConfig.unitHeight * Main.config.gameConfig.ladderChangeUnitNum * addNum);

                this.ladder.setPosition(ladderX, ladderY);

                this.ladder.updateDisplaysPosition();
            }
        }
    }

    private static setNowHeight(_v:number):void{

        this.nowHeight = _v;

        this.changeHeightValue = (this.nowHeight + 1 + Main.config.gameConfig.ladderChangeUnitFix) * Main.config.gameConfig.ladderChangeUnitNum * Main.config.gameConfig.unitHeight * Main.config.gameConfig.factor;
    }

    public static reset():void{

        this.ladder.setPosition(0, 0);

        this.ladder.updateDisplaysPosition();

        this.setNowHeight(0);
    }
}