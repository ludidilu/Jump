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
var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.canClick = true;
        _this.nowHeight = 0;
        _this.heightAddSpeed = 0.02;
        _this.physicalTimeFix = 1.3;
        _this.factor = 80;
        _this.unitHeight = 2.4;
        _this.unitWidth = 2;
        _this.unitNum = 20;
        _this.changeUnitNum = 5;
        _this.humanLength = 0.7;
        _this.humanRadius = 0.3;
        _this.jumpAngle = Math.PI * 0.25 + 0.15;
        _this.jumpForce = [100, 150];
        _this.jumpForceTick = 3;
        _this.jumpDisableTick = 10;
        _this.friction = 0;
        _this.relaxation = 10;
        _this.humanSleepXFix = -0.003;
        //debug模式，使用图形绘制
        _this.isDebug = true;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    Main.prototype.onAddToStage = function (event) {
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     */
    Main.prototype.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     */
    Main.prototype.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    };
    /**
     * preload资源组加载进度
     */
    Main.prototype.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     */
    Main.prototype.createGameScene = function () {
        var mat = new p2.Material(1);
        var bg = new egret.Shape();
        bg.graphics.beginFill(0x00ff00);
        bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        bg.graphics.endFill();
        this.addChild(bg);
        this.mapContainer = new egret.DisplayObjectContainer();
        this.addChild(this.mapContainer);
        //egret.Profiler.getInstance().run();
        //创建world
        var world = new p2.World();
        world.sleepMode = p2.World.BODY_SLEEPING;
        //创建plane
        var planeShape = new p2.Plane();
        var planeBody = new p2.Body();
        planeBody.addShape(planeShape);
        planeBody.displays = [];
        planeShape.material = mat;
        world.addBody(planeBody);
        var verticesOrigin = [[this.unitWidth, this.unitHeight], [this.unitHeight - this.unitWidth, this.unitHeight], [0, this.unitWidth], [0, 0]];
        var conDisplay = new egret.Shape();
        conDisplay.graphics.beginFill(0xff0000);
        conDisplay.graphics.moveTo(this.unitWidth * this.unitNum * this.factor, 0);
        conDisplay.graphics.lineTo(this.unitWidth * this.unitNum * this.factor, this.unitHeight * this.unitNum * -this.factor);
        var vertices = [];
        vertices.push([this.unitWidth * this.unitNum, 0]);
        vertices.push([this.unitWidth * this.unitNum, this.unitHeight * this.unitNum]);
        for (var m = this.unitNum - 1; m > -1; m--) {
            for (var i = 1; i < verticesOrigin.length; i++) {
                var arr = verticesOrigin[i];
                var arr2 = [arr[0] + m * this.unitWidth, arr[1] + m * this.unitHeight];
                vertices.push(arr2);
                conDisplay.graphics.lineTo((arr[0] + m * this.unitWidth) * this.factor, (arr[1] + m * this.unitHeight) * -this.factor);
            }
        }
        conDisplay.graphics.lineTo(this.unitWidth * this.unitNum * this.factor, 0);
        conDisplay.graphics.endFill();
        var container = new egret.DisplayObjectContainer();
        container.addChild(conDisplay);
        this.mapContainer.addChild(container);
        // let con:p2.Convex = new p2.Convex({vertices:vertices});
        // con.material = mat;
        var conBody = new p2.Body();
        conBody.fromPolygon(vertices);
        // conBody.addShape(con);
        // conBody.position = [5,1];
        conBody.displays = [container];
        conBody.position = [0, 0];
        world.addBody(conBody);
        var minX = 10000000;
        var minY = 10000000;
        for (var i = 0; i < conBody.shapes.length; i++) {
            var shape = conBody.shapes[i];
            shape.material = mat;
            var pos = shape.position;
            for (var m = 0; m < shape.vertices.length; m++) {
                var x = shape.vertices[m][0] + pos[0];
                if (x < minX) {
                    minX = x;
                }
                var y = shape.vertices[m][1] + pos[1];
                if (y < minY) {
                    minY = y;
                }
            }
        }
        conDisplay.x = minX * this.factor;
        conDisplay.y = minY * -this.factor;
        conBody.position = [-minX, -minY];
        egret.Ticker.getInstance().register(function (dt) {
            if (dt < 10) {
                return;
            }
            if (dt > 1000) {
                return;
            }
            var lastY = self.mapContainer.y;
            self.mapContainer.x -= self.heightAddSpeed * dt * self.unitWidth / self.unitHeight;
            self.mapContainer.y += self.heightAddSpeed * dt;
            world.step(dt / 1000 * self.physicalTimeFix);
            if (self.human) {
                if (self.human.sleepState == p2.Body.SLEEPY || self.human.sleepState == p2.Body.SLEEPING) {
                    self.human.position = [self.human.position[0] + self.humanSleepXFix, self.human.position[1]];
                }
                if (self.human.position[1] * self.factor - self.stage.stageHeight * 0.5 > self.mapContainer.y) {
                    var addValue = self.human.position[1] * self.factor - self.stage.stageHeight * 0.5 - self.mapContainer.y;
                    self.mapContainer.x -= addValue * self.unitWidth / self.unitHeight;
                    self.mapContainer.y += addValue;
                }
            }
            var changeHeightValue = (self.nowHeight + 1) * self.changeUnitNum * self.unitHeight * self.factor;
            if (lastY < changeHeightValue && self.mapContainer.y >= changeHeightValue) {
                self.nowHeight++;
                conBody.position = [conBody.position[0] + self.unitWidth * self.changeUnitNum, conBody.position[1] + self.unitHeight * self.changeUnitNum];
            }
            var stageHeight = egret.MainContext.instance.stage.stageHeight;
            var l = world.bodies.length;
            for (var i = 0; i < l; i++) {
                var boxBody = world.bodies[i];
                var box = boxBody.displays[0];
                if (box) {
                    box.x = boxBody.position[0] * self.factor;
                    box.y = stageHeight - boxBody.position[1] * self.factor;
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
        var conMat2 = new p2.ContactMaterial(mat, mat);
        conMat2.friction = self.friction;
        conMat2.relaxation = self.relaxation;
        world.addContactMaterial(conMat2);
        function addOneBox(e) {
            // var positionX: number = Math.floor(e.stageX / factor);
            // var positionY: number = Math.floor((egret.MainContext.instance.stage.stageHeight - e.stageY) / factor);
            if (!self.human) {
                var positionX = e.stageX / self.factor;
                var positionY = (egret.MainContext.instance.stage.stageHeight - e.stageY) / self.factor;
                var display;
                //添加方形刚体
                //var boxShape: p2.Shape = new p2.Rectangle(2, 1);
                var boxShape = new p2.Capsule({ length: self.humanLength, radius: self.humanRadius });
                self.human = new p2.Body({ mass: 1, position: [positionX, positionY], angularVelocity: 0 });
                self.human.addShape(boxShape);
                world.addBody(self.human);
                boxShape.material = mat;
                if (self.isDebug) {
                    display = self.createBox((boxShape.length + boxShape.radius * 2) * self.factor, boxShape.radius * 2 * self.factor);
                }
                else {
                    display = self.createBitmapByName("rect");
                }
                display.width = (boxShape.length + boxShape.radius * 2) * self.factor;
                display.height = boxShape.radius * 2 * self.factor;
                display.anchorOffsetX = display.width / 2;
                display.anchorOffsetY = display.height / 2;
                self.human.displays = [display];
                self.mapContainer.addChild(display);
            }
            else if (self.canClick && (world.overlapKeeper.bodiesAreOverlapping(self.human, conBody) || self.human.sleepState != p2.Body.AWAKE)) {
                console.log("click jump");
                var tickNum_1 = 0;
                self.human.angle = self.jumpAngle;
                self.human.angularVelocity = 0;
                self.canClick = false;
                var fun_1;
                fun_1 = function (dt) {
                    if (tickNum_1 < self.jumpForceTick) {
                        self.human.applyForce(self.jumpForce, [0, 0]);
                    }
                    if (tickNum_1 > self.jumpDisableTick) {
                        self.canClick = true;
                        egret.Ticker.getInstance().unregister(fun_1, this);
                    }
                    tickNum_1++;
                };
                egret.Ticker.getInstance().register(fun_1, this);
            }
            else {
                console.log("no jump!");
            }
        }
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     */
    Main.prototype.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 创建一个圆形
     */
    Main.prototype.createBall = function (r) {
        var shape = new egret.Shape();
        shape.graphics.beginFill(0xfff000);
        shape.graphics.drawCircle(r, r, r);
        shape.graphics.endFill();
        return shape;
    };
    /**
     * 创建一个方形
     */
    Main.prototype.createBox = function (width, height) {
        var shape = new egret.Shape();
        shape.graphics.beginFill(0xfff000);
        shape.graphics.drawRect(0, 0, width, height);
        shape.graphics.endFill();
        return shape;
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
//# sourceMappingURL=Main.js.map