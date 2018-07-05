class Ladder extends BodyObj{

    // private static gameContainer:egret.DisplayObjectContainer;

    private static ladderWithDisplayObjectPool:Ladder[] = [];

    private static ladderWithoutDisplayObjectPool:Ladder[] = [];

    private static ladderArr:Ladder[] = [];

    public static getLadder(_world:p2.World, _mapContainer:egret.DisplayObjectContainer, _mat:p2.Material, _collisionGroup:number):Ladder{

        let ladder:Ladder;

        if(_mapContainer){

            if(this.ladderWithDisplayObjectPool.length > 0){

                ladder = this.ladderWithDisplayObjectPool.pop();

                for(let i:number = 0, m:number = ladder.shapes.length ; i < m ; i++){

                    ladder.shapes[i].collisionGroup = _collisionGroup;
                }
            }
            else{

                ladder = this.create(_world, _mapContainer, _mat, _collisionGroup);
            }
        }
        else{

            if(this.ladderWithoutDisplayObjectPool.length > 0){

                ladder = this.ladderWithoutDisplayObjectPool.pop();

                for(let i:number = 0, m:number = ladder.shapes.length ; i < m ; i++){

                    ladder.shapes[i].collisionGroup = _collisionGroup;
                }
            }
            else{

                ladder = this.create(_world, _mapContainer, _mat, _collisionGroup);
            }
        }

        return ladder;
    }

    public static create(_world:p2.World, _mapContainer:egret.DisplayObjectContainer, _mat:p2.Material, _collisionGroup:number):Ladder{

        let verticesOrigin:number[][] = [[Main.config.gameConfig.unitWidth, Main.config.gameConfig.unitHeight], [Main.config.gameConfig.triangleWidth, Main.config.gameConfig.unitHeight],[0, Main.config.gameConfig.unitHeight - Main.config.gameConfig.triangleHeight],[0,0]];

        let conDisplay:egret.Shape;

        let factorFix:number;

        let factor:number;

        if(_mapContainer){

            conDisplay = new egret.Shape();

            conDisplay.graphics.beginFill(0xff0000);

            factorFix = 0.2;

            factor = Main.config.gameConfig.factor * factorFix;

            conDisplay.graphics.moveTo((Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum + Main.config.gameConfig.ladderWidthFix) * factor, 0);

            conDisplay.graphics.lineTo((Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum + Main.config.gameConfig.ladderWidthFix) * factor, Main.config.gameConfig.unitHeight * Main.config.gameConfig.unitNum * -factor);
        }
        
        let vertices:number[][] = [];

        vertices.push([Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum + Main.config.gameConfig.ladderWidthFix, -Main.config.gameConfig.ladderHeightFix]);

        vertices.push([Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum + Main.config.gameConfig.ladderWidthFix, Main.config.gameConfig.unitHeight * Main.config.gameConfig.unitNum]);

        for(let m:number = Main.config.gameConfig.unitNum - 1 ; m > -1 ; m--){

            for(let i:number = 1, n:number = verticesOrigin.length ; i < n ; i++){

                let arr:number[] = verticesOrigin[i];

                let arr2:number[];

                if(m == 0 && i == n - 1){

                    arr2 = [arr[0] + m * Main.config.gameConfig.unitWidth,arr[1] + m * Main.config.gameConfig.unitHeight - Main.config.gameConfig.ladderHeightFix];

                    if(_mapContainer){

                        conDisplay.graphics.lineTo((arr[0] + m * Main.config.gameConfig.unitWidth) * factor, (arr[1] + m * Main.config.gameConfig.unitHeight - Main.config.gameConfig.ladderHeightFix) * -factor);
                    }
                }
                else{

                    arr2 = [arr[0] + m * Main.config.gameConfig.unitWidth,arr[1] + m * Main.config.gameConfig.unitHeight];

                    if(_mapContainer){

                        conDisplay.graphics.lineTo((arr[0] + m * Main.config.gameConfig.unitWidth) * factor, (arr[1] + m * Main.config.gameConfig.unitHeight) * -factor);
                    }
                }

                vertices.push(arr2);
            }
        }

        let ladder:Ladder = new Ladder();

        ladder.bodyType = BodyObjType.LADDER;

        ladder.fromPolygon(vertices);

        if(_mapContainer){

            conDisplay.graphics.lineTo((Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum + Main.config.gameConfig.ladderWidthFix) * factor, Main.config.gameConfig.ladderHeightFix * factor);

            conDisplay.graphics.endFill();

            let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

            container.addChild(conDisplay);
            
            conDisplay.scaleX = 1 / factorFix;

            conDisplay.scaleY = 1 / factorFix;

            _mapContainer.addChild(container);

            ladder.displays = [container];
        }
        else{

            ladder.displays = [];
        }
        
        _world.addBody(ladder);

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

    public update(_x:number):void{

        let index:number = Math.floor(_x / Main.config.gameConfig.unitWidth);

        index -= Main.config.gameConfig.ladderChangeUnitFix;

        if(index < 0){

            index = 0;
        }
        else if(index > Game.stageConfig.maxLevel - Main.config.gameConfig.unitNum){

            index = Game.stageConfig.maxLevel - Main.config.gameConfig.unitNum;
        }

        let ladderX:number = Main.config.gameConfig.unitWidth * index;

        let ladderY:number = Main.config.gameConfig.unitHeight * index;

        this.setPosition(ladderX, ladderY);

        if(this.displays.length > 0){

            this.updateDisplaysPosition();
        }
    }

    public remove():void{

        this.world.removeBody(this);

        if(this.displays.length > 0){

            let display:egret.DisplayObject = this.displays[0];

            display.parent.removeChild(display);

            Ladder.ladderWithDisplayObjectPool.push(this);
        }
        else{

            Ladder.ladderWithoutDisplayObjectPool.push(this);
        }
    }

    public reset():void{

        this.setPosition(0, 0);

        if(this.displays.length > 0){

            this.updateDisplaysPosition();
        }
    }
}