//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     */
    private loadingView: LoadingUI;

    private human:p2.Body;

    private canClick:boolean = true;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    }
    /**
     * preload资源组加载完成
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    }
    /**
     * preload资源组加载进度
     */
    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }
    //debug模式，使用图形绘制
    private isDebug: boolean = true;

    /**
     * 创建游戏场景
     */
    private createGameScene(): void {

        

        let mat:p2.Material = new p2.Material(1);

        let bg:egret.Shape = new egret.Shape();
        bg.graphics.beginFill(0x00ff00);
        bg.graphics.drawRect(0,0,this.stage.stageWidth, this.stage.stageHeight);
        bg.graphics.endFill();
        this.addChild(bg);

        //egret.Profiler.getInstance().run();
        var factor: number = 50;

        //创建world
        var world: p2.World = new p2.World();
        world.sleepMode = p2.World.BODY_SLEEPING;

        //创建plane
        var planeShape: p2.Plane = new p2.Plane();
        var planeBody: p2.Body = new p2.Body();
        planeBody.addShape(planeShape);
        planeBody.displays = [];
        planeShape.material = mat;
        
        world.addBody(planeBody);

        // let vertices = [[0,0], [1,0], [1,1]];
        // let vertices2 = [[0,0], [1,0], [1,-1]];

        let unitWidth:number = 2;

        let unitHeight:number = 2.4;

        let unitNum:number = 10;

        let verticesOrigin = [[unitWidth, unitHeight], [unitHeight - unitWidth, unitHeight],[0, unitWidth],[0,0]];

        // let verticesOrigin = [[0,0], [unitWidth,0], [unitWidth,unitHeight], [unitHeight - unitWidth,unitHeight],[0,unitWidth]];

        // let vertices = [[0,0], [1,0], [1,1.2]];

        let conDisplay:egret.Shape = new egret.Shape();

        conDisplay.graphics.beginFill(0xff0000);

        conDisplay.graphics.moveTo(unitWidth * unitNum * factor, 0);

        conDisplay.graphics.lineTo(unitWidth * unitNum * factor, unitHeight * unitNum * -factor);

        let vertices = [];

        vertices.push([unitWidth * unitNum, 0]);

        vertices.push([unitWidth * unitNum, unitHeight * unitNum]);

        for(let m:number = unitNum - 1 ; m > -1 ; m--){

            for(let i:number = 1 ; i < verticesOrigin.length ; i++){
                let arr = verticesOrigin[i];
                let arr2 = [arr[0] + m * unitWidth,arr[1] + m * unitHeight];

                vertices.push(arr2);

                conDisplay.graphics.lineTo((arr[0] + m * unitWidth) * factor, (arr[1] + m * unitHeight) * -factor);
            }
        }

        conDisplay.graphics.lineTo(unitWidth * unitNum * factor, 0);

        conDisplay.graphics.endFill();

        let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

        container.addChild(conDisplay);

        this.addChild(container);

        // let con:p2.Convex = new p2.Convex({vertices:vertices});
        // con.material = mat;
        let conBody:p2.Body = new p2.Body();
        conBody.fromPolygon(vertices);
        // conBody.addShape(con);
        // conBody.position = [5,1];
        conBody.displays = [container];
        conBody.position = [0,0];
        world.addBody(conBody);

        let minX:number = 10000000;
        let minY:number = 10000000;

        for(let i:number = 0; i < conBody.shapes.length ; i++){

            let shape:p2.Convex = <p2.Convex>conBody.shapes[i];

            shape.material = mat;

            let pos:number[] = shape.position;

            for(let m:number = 0; m < shape.vertices.length ; m++){

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

        conDisplay.x = minX * factor;

        conDisplay.y = minY * -factor;

        conBody.position = [-minX, -minY];

        egret.Ticker.getInstance().register(function(dt) {
            if (dt < 10) {
                return;
            }
            if (dt > 1000) {
                return;
            }
            world.step(dt / 1000 * 1.3);

            var stageHeight: number = egret.MainContext.instance.stage.stageHeight;
            var l = world.bodies.length;
            for (var i: number = 0; i < l; i++) {
                var boxBody: p2.Body = world.bodies[i];
                var box: egret.DisplayObject = boxBody.displays[0];
                if (box) {
                    box.x = boxBody.position[0] * factor;
                    box.y = stageHeight - boxBody.position[1] * factor;
                    box.rotation = 360 - (boxBody.angle + boxBody.shapes[0].angle) * 180 / Math.PI;
                    if (boxBody.sleepState == p2.Body.SLEEPING) {
                        box.alpha = 0.5;
                    }
                    else {
                        box.alpha = 1;
                    }
                }
            }
        }, this);

        //鼠标点击添加刚体
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, addOneBox, this);
        var self = this;


        let conMat2:p2.ContactMaterial = new p2.ContactMaterial(mat, mat);
        conMat2.friction = 0;
        conMat2.relaxation = 10;
        // conMat2.contactSkinSize = 0.0001;

        world.addContactMaterial(conMat2);

        function addOneBox(e: egret.TouchEvent): void {
            // var positionX: number = Math.floor(e.stageX / factor);
            // var positionY: number = Math.floor((egret.MainContext.instance.stage.stageHeight - e.stageY) / factor);

            if(!self.human){

                var positionX: number = e.stageX / factor;
                var positionY: number = (egret.MainContext.instance.stage.stageHeight - e.stageY) / factor;

                var display: egret.DisplayObject;
                
                //添加方形刚体
                //var boxShape: p2.Shape = new p2.Rectangle(2, 1);
                var boxShape: p2.Capsule = new p2.Capsule({length: 1, radius: 0.5});
                self.human = new p2.Body({ mass: 1, position: [positionX, positionY], angularVelocity: 0 });
                self.human.addShape(boxShape);
                world.addBody(self.human);
                boxShape.material = mat;

                if(self.isDebug){
                    display = self.createBox(((<p2.Capsule>boxShape).length + (<p2.Capsule>boxShape).radius * 2) * factor,(<p2.Capsule>boxShape).radius * 2 * factor);
                }else{
                    display = self.createBitmapByName("rect");
                }
                display.width = ((<p2.Capsule>boxShape).length + (<p2.Capsule>boxShape).radius * 2) * factor;
                display.height = (<p2.Capsule>boxShape).radius * 2 * factor;
                

                display.anchorOffsetX = display.width / 2;
                display.anchorOffsetY = display.height / 2;

                self.human.displays = [display];
                self.addChild(display);

                // self.human.gravityScale = 0;
            }
            else if((world.overlapKeeper.bodiesAreOverlapping(self.human, conBody) || self.human.sleepState != p2.Body.AWAKE) && self.canClick){

                console.log("click jump");

                let forceNum = 0;

                let fun:Function;
                
                self.human.angle = Math.PI * 0.25;

                self.human.angularVelocity = 0;

                self.canClick = false;

                fun = function(dt){

                    self.human.applyForce([100,120],[0,0]);

                    forceNum++;

                    if(forceNum > 3){

                        self.canClick = true;

                        egret.Ticker.getInstance().unregister(fun, this);
                    }
                };

                egret.Ticker.getInstance().register(fun, this);
            }
            else{
                console.log("no jump!");
            }
        }
    }
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     */
    private createBitmapByName(name: string): egret.Bitmap {
        var result: egret.Bitmap = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
    /**
     * 创建一个圆形
     */
    private createBall(r: number): egret.Shape {
        var shape = new egret.Shape();
        shape.graphics.beginFill(0xfff000);
        shape.graphics.drawCircle(r, r, r);
        shape.graphics.endFill();
        return shape;
    }
    /**
     * 创建一个方形
     */
    private createBox(width:number,height:number): egret.Shape {
        var shape = new egret.Shape();
        shape.graphics.beginFill(0xfff000);
        shape.graphics.drawRect(0,0,width,height);
        shape.graphics.endFill();
        return shape;
    }
}
