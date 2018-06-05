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

    private mapContainer:egret.DisplayObjectContainer;

    private nowHeight:number = 0;

    //*****config
    private heightAddSpeed:number = 0.05;

    private physicalTimeFix:number = 1.3;

    private factor:number = 80;

    private unitHeight:number = 2.4;

    private unitWidth:number = 2;

    private unitNum:number = 10;

    private changeUnitNum:number = 5;

    private humanLength:number = 0.7;

    private humanRadius:number = 0.3;

    private jumpAngle:number = Math.PI * 0.25 + 0.15;

    private jumpForce:number[] = [100,150];

    private jumpForceTick:number = 3;

    private jumpDisableTime:number = 300;

    private friction:number = 0;

    private relaxation:number = 10;

    private humanSleepXFix:number = -0.003;
    //*****

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

        this.mapContainer = new egret.DisplayObjectContainer();

        this.addChild(this.mapContainer);

        //egret.Profiler.getInstance().run();

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

        let verticesOrigin = [[this.unitWidth, this.unitHeight], [this.unitHeight - this.unitWidth, this.unitHeight],[0, this.unitWidth],[0,0]];

        let conDisplay:egret.Shape = new egret.Shape();

        conDisplay.graphics.beginFill(0xff0000);

        conDisplay.graphics.moveTo(this.unitWidth * this.unitNum * this.factor, 0);

        conDisplay.graphics.lineTo(this.unitWidth * this.unitNum * this.factor, this.unitHeight * this.unitNum * -this.factor);

        let vertices = [];

        vertices.push([this.unitWidth * this.unitNum, 0]);

        vertices.push([this.unitWidth * this.unitNum, this.unitHeight * this.unitNum]);

        for(let m:number = this.unitNum - 1 ; m > -1 ; m--){

            for(let i:number = 1 ; i < verticesOrigin.length ; i++){
                let arr = verticesOrigin[i];
                let arr2 = [arr[0] + m * this.unitWidth,arr[1] + m * this.unitHeight];

                vertices.push(arr2);

                conDisplay.graphics.lineTo((arr[0] + m * this.unitWidth) * this.factor, (arr[1] + m * this.unitHeight) * -this.factor);
            }
        }

        conDisplay.graphics.lineTo(this.unitWidth * this.unitNum * this.factor, 0);

        conDisplay.graphics.endFill();

        let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

        container.addChild(conDisplay);

        this.mapContainer.addChild(container);

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

        conDisplay.x = minX * this.factor;

        conDisplay.y = minY * -this.factor;

        conBody.position = [-minX, -minY];

        egret.Ticker.getInstance().register(function(dt) {
            if (dt < 10) {
                return;
            }
            if (dt > 1000) {
                return;
            }

            let lastY = self.mapContainer.y;

            self.mapContainer.x -= self.heightAddSpeed * dt * self.unitWidth / self.unitHeight;
            self.mapContainer.y += self.heightAddSpeed * dt;

            world.step(dt / 1000 * self.physicalTimeFix);

            if(self.human){

                if(self.human.sleepState == p2.Body.SLEEPY || self.human.sleepState == p2.Body.SLEEPING){

                    self.human.position = [self.human.position[0] + self.humanSleepXFix, self.human.position[1]];
                }

                if(self.human.position[1] * self.factor - self.stage.stageHeight * 0.5 > self.mapContainer.y){

                    let addValue = self.human.position[1] * self.factor - self.stage.stageHeight * 0.5 - self.mapContainer.y;

                    self.mapContainer.x -= addValue * self.unitWidth / self.unitHeight;
                    self.mapContainer.y += addValue;
                }
            }

            let changeHeightValue:number = (self.nowHeight + 1) * self.changeUnitNum * self.unitHeight * self.factor;

            if(lastY < changeHeightValue && self.mapContainer.y >= changeHeightValue){

                self.nowHeight++;

                conBody.position = [conBody.position[0] + self.unitWidth * self.changeUnitNum, conBody.position[1] + self.unitHeight * self.changeUnitNum];
            }

            var stageHeight: number = egret.MainContext.instance.stage.stageHeight;
            var l = world.bodies.length;
            for (var i: number = 0; i < l; i++) {
                var boxBody: p2.Body = world.bodies[i];
                var box: egret.DisplayObject = boxBody.displays[0];
                if (box) {
                    box.x = boxBody.position[0] * self.factor;
                    box.y = stageHeight - boxBody.position[1] * self.factor;
                    box.rotation = 360 - (boxBody.angle + boxBody.shapes[0].angle) * 180 / Math.PI;
                    // if (boxBody.sleepState == p2.Body.SLEEPING) {
                    //     box.alpha = 0.5;
                    // }
                    // else {
                    //     box.alpha = 1;
                    // }
                }
            }

        }, this);

        //鼠标点击添加刚体
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, addOneBox, this);
        var self = this;


        let conMat2:p2.ContactMaterial = new p2.ContactMaterial(mat, mat);
        conMat2.friction = self.friction;
        conMat2.relaxation = self.relaxation;

        world.addContactMaterial(conMat2);

        function addOneBox(e: egret.TouchEvent): void {
            // var positionX: number = Math.floor(e.stageX / factor);
            // var positionY: number = Math.floor((egret.MainContext.instance.stage.stageHeight - e.stageY) / factor);

            if(!self.human){

                var positionX: number = e.stageX / self.factor;
                var positionY: number = (egret.MainContext.instance.stage.stageHeight - e.stageY) / self.factor;

                var display: egret.DisplayObject;
                
                //添加方形刚体
                //var boxShape: p2.Shape = new p2.Rectangle(2, 1);
                var boxShape: p2.Capsule = new p2.Capsule({length: self.humanLength, radius: self.humanRadius});
                self.human = new p2.Body({ mass: 1, position: [positionX, positionY], angularVelocity: 0 });
                self.human.addShape(boxShape);
                world.addBody(self.human);
                boxShape.material = mat;

                if(self.isDebug){
                    display = self.createBox(((<p2.Capsule>boxShape).length + (<p2.Capsule>boxShape).radius * 2) * self.factor,(<p2.Capsule>boxShape).radius * 2 * self.factor);
                }else{
                    display = self.createBitmapByName("rect");
                }
                display.width = ((<p2.Capsule>boxShape).length + (<p2.Capsule>boxShape).radius * 2) * self.factor;
                display.height = (<p2.Capsule>boxShape).radius * 2 * self.factor;
                

                display.anchorOffsetX = display.width / 2;
                display.anchorOffsetY = display.height / 2;

                self.human.displays = [display];
                self.mapContainer.addChild(display);
            }
            else if(self.canClick && (world.overlapKeeper.bodiesAreOverlapping(self.human, conBody) || self.human.sleepState != p2.Body.AWAKE)){

                console.log("click jump");

                let time = 0;

                let tick = 0;
                
                self.human.angle = self.jumpAngle;

                self.human.angularVelocity = 0;

                self.canClick = false;

                let fun:Function;

                fun = function(dt){

                    time += dt;

                    if(tick < self.jumpForceTick){

                        tick++;

                        self.human.applyForce(self.jumpForce,[0,0]);
                    }

                    if(time > self.jumpDisableTime){

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
