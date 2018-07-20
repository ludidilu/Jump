class Ladder extends BodyObj{

    public static create(_mapContainer:egret.DisplayObjectContainer, _mat:p2.Material, _collisionGroup:number):Ladder{

        let verticesOrigin:number[][] = [[Main.config.gameConfig.unitWidth, Main.config.gameConfig.unitHeight], [Main.config.gameConfig.triangleWidth, Main.config.gameConfig.unitHeight],[0, Main.config.gameConfig.unitHeight - Main.config.gameConfig.triangleHeight],[0,0]];

        let conDisplay:egret.Shape;

        let factorFix:number;

        let factor:number;

        let container:egret.DisplayObjectContainer;

        let tex:egret.Texture;

        if(_mapContainer){

            container = new egret.DisplayObjectContainer();

            _mapContainer.addChild(container);

            tex = RES.getRes("game_json.taijie");

            conDisplay = new egret.Shape();

            conDisplay.graphics.beginFill(0xff0000, 0.5);

            factorFix = 0.2;

            factor = Main.config.gameConfig.factor * factorFix;

            conDisplay.graphics.moveTo((Main.config.gameConfig.unitWidth * Main.config.gameConfig.ladderShowNum + Main.config.gameConfig.ladderWidthFix) * factor, 0);

            conDisplay.graphics.lineTo((Main.config.gameConfig.unitWidth * Main.config.gameConfig.ladderShowNum + Main.config.gameConfig.ladderWidthFix) * factor, Main.config.gameConfig.unitHeight * Main.config.gameConfig.ladderShowNum * -factor);
        }
        
        let vertices:number[][] = [];

        vertices.push([Main.config.gameConfig.unitWidth * Main.config.gameConfig.ladderNum + Main.config.gameConfig.ladderWidthFix, -Main.config.gameConfig.ladderHeightFix]);

        vertices.push([Main.config.gameConfig.unitWidth * Main.config.gameConfig.ladderNum + Main.config.gameConfig.ladderWidthFix, Main.config.gameConfig.unitHeight * Main.config.gameConfig.ladderNum]);

        for(let m:number = Main.config.gameConfig.ladderNum - 1 ; m > -1 ; m--){

            for(let i:number = 1, n:number = verticesOrigin.length ; i < n ; i++){

                let arr:number[] = verticesOrigin[i];

                let arr2:number[];

                if(m == 0 && i == n - 1){

                    arr2 = [arr[0] + m * Main.config.gameConfig.unitWidth,arr[1] + m * Main.config.gameConfig.unitHeight - Main.config.gameConfig.ladderHeightFix];
                }
                else{

                    arr2 = [arr[0] + m * Main.config.gameConfig.unitWidth,arr[1] + m * Main.config.gameConfig.unitHeight];
                }

                vertices.push(arr2);
            }
        }

        if(_mapContainer){

            for(let m:number = Main.config.gameConfig.ladderShowNum - 1 ; m > -1 ; m--){

                for(let i:number = 1, n:number = verticesOrigin.length ; i < n ; i++){

                    let arr:number[] = verticesOrigin[i];

                    if(m == 0 && i == n - 1){

                        conDisplay.graphics.lineTo((arr[0] + m * Main.config.gameConfig.unitWidth) * factor, (arr[1] + m * Main.config.gameConfig.unitHeight - Main.config.gameConfig.ladderHeightFix) * -factor);
                    }
                    else{

                        conDisplay.graphics.lineTo((arr[0] + m * Main.config.gameConfig.unitWidth) * factor, (arr[1] + m * Main.config.gameConfig.unitHeight) * -factor);
                    }
                }

                let bp:egret.Bitmap = new egret.Bitmap(tex);

                bp.x = m * Main.config.gameConfig.unitWidth * Main.config.gameConfig.factor;

                bp.y = -(m + 1) * Main.config.gameConfig.unitHeight * Main.config.gameConfig.factor;

                bp.scaleX = bp.scaleY = Main.config.gameConfig.factor / 80;

                container.addChild(bp);
            }
        }

        let ladder:Ladder = new Ladder();

        ladder.bodyType = BodyObjType.LADDER;

        ladder.fromPolygon(vertices);

        if(_mapContainer){

            conDisplay.graphics.lineTo((Main.config.gameConfig.unitWidth * Main.config.gameConfig.ladderShowNum + Main.config.gameConfig.ladderWidthFix) * factor, Main.config.gameConfig.ladderHeightFix * factor);

            conDisplay.graphics.endFill();

            // container.addChild(conDisplay);
            
            conDisplay.scaleX = 1 / factorFix;

            conDisplay.scaleY = 1 / factorFix;

            tex = RES.getRes("game_json.001");
            
            let bp:egret.Bitmap = new egret.Bitmap(tex);

            bp.y = -Main.config.gameConfig.ladderShowNum * Main.config.gameConfig.unitHeight * Main.config.gameConfig.factor;

            bp.x = 50 * Main.config.gameConfig.factor / 40;//hard code

            bp.scaleY = Main.config.gameConfig.ladderShowNum * Main.config.gameConfig.unitHeight * Main.config.gameConfig.factor / bp.height;

            bp.scaleX = bp.scaleY * Main.config.gameConfig.unitWidth / Main.config.gameConfig.unitHeight;

            container.addChild(bp);

            tex = RES.getRes("game_json.terminal1");

            ladder.terminal = new egret.Bitmap(tex);

            ladder.terminal.scaleX = ladder.terminal.scaleY = Main.config.gameConfig.factor / 160;

            ladder.terminal.x = ((Main.config.gameConfig.ladderShowNum - 1) * Main.config.gameConfig.unitWidth + Main.config.gameConfig.finalLadderXFix) * Main.config.gameConfig.factor - ladder.terminal.width * ladder.terminal.scaleX * 0.5;

            ladder.terminal.y = -Main.config.gameConfig.ladderShowNum * Main.config.gameConfig.unitHeight * Main.config.gameConfig.factor - ladder.terminal.height * ladder.terminal.scaleY;

            container.addChild(ladder.terminal);

            ladder.displays = [container];

            // container.cacheAsBitmap = true;
        }
        else{

            ladder.displays = [];
        }
        
        let minX:number = Number.MAX_VALUE;
        let minY:number = Number.MAX_VALUE;

        for(let i:number = 0, n:number = ladder.shapes.length; i < n ; i++){

            let shape:p2.Convex = <p2.Convex>ladder.shapes[i];

            shape.material = _mat;

            shape.collisionGroup = _collisionGroup;

            shape.collisionMask = Game.HUMAN_GROUP;

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

        for(let i:number = 0, n:number = ladder.shapes.length; i < n ; i++){

            let shape:p2.Shape = ladder.shapes[i];

            shape.position[0] -= minX;

            shape.position[1] = shape.position[1] - minY - Main.config.gameConfig.ladderHeightFix;
        }

        return ladder;
    }

    public terminal:egret.Bitmap;

    private lastY:number;

    public update(_x:number):void{

        let index:number = Math.floor(_x / Main.config.gameConfig.unitWidth);

        let ladderIndex:number = index - Main.config.gameConfig.ladderFix;

        if(Game.stageConfig.maxLevel > 0 && ladderIndex > Game.stageConfig.maxLevel - Main.config.gameConfig.ladderNum){

            ladderIndex = Game.stageConfig.maxLevel - Main.config.gameConfig.ladderNum;
        }

        let ladderX:number = Main.config.gameConfig.unitWidth * ladderIndex;

        let ladderY:number = Main.config.gameConfig.unitHeight * ladderIndex;

        this.setPosition(ladderX, ladderY);

        if(this.displays.length > 0){

            let ladderShowIndex:number = index - Main.config.gameConfig.ladderShowFix;

            if(ladderShowIndex < 0){

                ladderShowIndex = 0;
            }
            else if(Game.stageConfig.maxLevel > 0 && ladderShowIndex > Game.stageConfig.maxLevel - Main.config.gameConfig.ladderShowNum){

                ladderShowIndex = Game.stageConfig.maxLevel - Main.config.gameConfig.ladderShowNum;
            }

            let ladderShowY:number = Main.config.gameConfig.unitHeight * ladderShowIndex;

            let targetY:number = Game.STAGE_HEIGHT - ladderShowY * Main.config.gameConfig.factor;

            if(targetY > this.lastY){

                return;
            }

            this.lastY = targetY;

            let ladderShowX:number = Main.config.gameConfig.unitWidth * ladderShowIndex;

            let targetX:number = ladderShowX * Main.config.gameConfig.factor;

            let display:egret.DisplayObject = this.displays[0];

            display.x = targetX;

            display.y = targetY;
        }
    }

    public reset():void{

        this.setPosition(0, 0);

        if(this.displays.length > 0){

            let targetY:number = Game.STAGE_HEIGHT;

            this.lastY = targetY;

            let targetX:number = 0;

            let display:egret.DisplayObject = this.displays[0];

            display.x = targetX;

            display.y = targetY;
        }
    }

}