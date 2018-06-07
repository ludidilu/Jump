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

    private world:p2.World;

    private mat:p2.Material;

    private humanDisplay:egret.DisplayObject;

    private human:Human;

    private enemies:Human[] = [];

    private conBody:BodyObj;

    private bgContainer:egret.DisplayObjectContainer;

    private mapContainer:egret.DisplayObjectContainer;

    private uiContainer:egret.DisplayObjectContainer;

    private nowHeight:number = 0;

    private conBodyX:number;

    private conBodyY:number;

    private mainPanel:MainPanel;

    private alertPanel:AlertPanel;

    private bestScore:number = 0;

    //*****config
    private heightAddSpeed:number = 0.625;

    // private heightAddSpeed:number = 0;

    private physicalTimeFix:number = 1.3;

    private factor:number = 80;

    private unitHeight:number = 2.4;

    private unitWidth:number = 2;

    private triangleWidth:number = 0.3;

    private triangleHeight:number = 0.4;

    private unitNum:number = 20;

    private changeUnitNum:number = 5;

    private humanLength:number = 0.7;

    private humanRadius:number = 0.3;

    private jumpAngle:number = Math.PI * 0.25 + 0.15;

    private jumpForce:number[] = [80,145];

    private jumpForceTick:number = 3;

    private jumpDisableTime:number = 300;

    private friction:number = 0;

    private relaxation:number = 10;

    private humanSleepXFix:number = -0.5;

    private enemyJumpProbability:number = 1;

    private enemyPropProbability:number = 0.2;

    // private enemyPropProbability:number = 0;

    private enemyPropHeightFix:number = 5;

    private maxEnemyNum:number = 2;
    //*****

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event):void {

        egret.lifecycle.onPause = () => {

            SuperTicker.getInstance().pause();
        }

        egret.lifecycle.onResume = () => {
            
            SuperTicker.getInstance().resume();
        }

        egret.registerImplementation("eui.IAssetAdapter", new AssetAdapter());
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

        //初始化Resource资源加载库
        // RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        // RES.loadConfig("resource/default.res.json", "resource/");

        this.loadConfig();
    }

    private async loadConfig():Promise<void>{

        await RES.loadConfig("resource/default.res.json", "resource/");
        await this.loadTheme();
        await RES.loadGroup("preload");

        this.createGameScene();
    }

    private loadTheme():Promise<{}> {
        return new Promise((resolve, reject) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme("resource/default.thm.json", this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this);

        })
    }

    /**
     * 创建游戏场景
     */
    private createGameScene(): void {

        // let mm:MainPanel = new MainPanel();

        // this.addChild(mm);

        BodyObj.factor = this.factor;

        Human.humanSleepXFix = this.humanSleepXFix;

        Human.jumpDisableTime = this.jumpDisableTime;

        Enemy.jumpAngle = this.jumpAngle;

        Enemy.jumpForce = this.jumpForce;

        Enemy.jumpForceTick = this.jumpForceTick;

        Enemy.jumpProbability = this.enemyJumpProbability;

        this.createContainers();

        this.createBg();

        this.createUi();
        
        this.createWorldAndPlane();

        this.createLadder();
        
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.addOneBox, this);
    }

    private createContainers():void{

        this.bgContainer = new egret.DisplayObjectContainer();

        this.addChild(this.bgContainer);

        this.mapContainer = new egret.DisplayObjectContainer();

        this.addChild(this.mapContainer);

        this.uiContainer = new egret.DisplayObjectContainer();

        this.addChild(this.uiContainer);
    }

    private createBg():void{

        let bg:egret.Shape = new egret.Shape();

        bg.graphics.beginFill(0x00ff00);

        bg.graphics.drawRect(0,0,this.stage.stageWidth, this.stage.stageHeight);

        bg.graphics.endFill();

        this.bgContainer.addChild(bg);
    }

    private createUi():void{

        this.mainPanel = new MainPanel();

        this.uiContainer.addChild(this.mainPanel);

        this.mainPanel.score.text = this.bestScore.toString();

        this.alertPanel = new AlertPanel();

        this.uiContainer.addChild(this.alertPanel);

        this.alertPanel.visible = false;

        this.alertPanel.bt.addEventListener(egret.TouchEvent.TOUCH_END, this.btClick, this);

        this.alertPanel.bt.label = "Restart";
    }

    private btClick(e:egret.TouchEvent):void{

        this.reset();

        this.alertPanel.visible = false;

        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.addOneBox, this);
    }

    private createLadder():void{

        let verticesOrigin = [[this.unitWidth, this.unitHeight], [this.triangleWidth, this.unitHeight],[0, this.unitHeight - this.triangleHeight],[0,0]];

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

        this.conBody = new BodyObj();
        this.conBody.fromPolygon(vertices);
        this.conBody.displays = [container];
        this.world.addBody(this.conBody);

        let minX:number = 10000000;
        let minY:number = 10000000;

        for(let i:number = 0; i < this.conBody.shapes.length ; i++){

            let shape:p2.Convex = <p2.Convex>this.conBody.shapes[i];

            shape.material = this.mat;

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

        this.conBodyX = -minX;

        this.conBodyY = -minY;

        this.conBody.position = [-minX, -minY];

        this.conBody.updateDisplaysPosition();

        Human.conBody = this.conBody;
    }

    private createWorldAndPlane():void{

        this.mat = new p2.Material(1);

        //创建world
        this.world = new p2.World();
        this.world.sleepMode = p2.World.BODY_SLEEPING;

        let conMat2:p2.ContactMaterial = new p2.ContactMaterial(this.mat, this.mat);
        conMat2.friction = this.friction;
        conMat2.relaxation = this.relaxation;

        this.world.addContactMaterial(conMat2);


        //创建plane
        var planeShape: p2.Plane = new p2.Plane();
        var planeBody: p2.Body = new p2.Body();
        planeBody.addShape(planeShape);
        planeBody.displays = [];
        planeShape.material = this.mat;

        this.world.addBody(planeBody);
    }

    private update(dt:number):void{

        if (dt < 10) {
            return;
        }
        if (dt > 1000) {
            return;
        }

        let lastY = this.mapContainer.y;

        this.mapContainer.x -= this.heightAddSpeed * this.factor * dt * this.unitWidth / this.unitHeight * 0.001;

        this.mapContainer.y += this.heightAddSpeed * this.factor * dt * 0.001;

        this.world.step(dt / 1000 * this.physicalTimeFix);

        let changeHeightValue:number = (this.nowHeight + 1) * this.changeUnitNum * this.unitHeight * this.factor;

        if(this.human.position[1] * this.factor - this.stage.stageHeight * 0.5 > this.mapContainer.y){

            let addValue = this.human.position[1] * this.factor - this.stage.stageHeight * 0.5 - this.mapContainer.y;

            this.mapContainer.x -= addValue * this.unitWidth / this.unitHeight;

            this.mapContainer.y += addValue;
        }

        if(lastY < changeHeightValue && this.mapContainer.y >= changeHeightValue){

            this.nowHeight++;

            this.conBody.position = [this.conBody.position[0] + this.unitWidth * this.changeUnitNum, this.conBody.position[1] + this.unitHeight * this.changeUnitNum];

            this.conBody.updateDisplaysPosition();
        }

        let humanY:number = Math.floor(this.human.position[1] / this.unitHeight);

        if(this.human.position[0] > (humanY - 1) * this.unitWidth && this.human.position[0] < humanY * this.unitWidth){

            // console.log("get score:" + humanY);

            if(humanY > this.bestScore){

                this.bestScore = humanY;

                this.mainPanel.score.text = this.bestScore.toString();
            }
        }

        let p:egret.Point = this.mapContainer.localToGlobal(this.humanDisplay.x, this.humanDisplay.y);

        if(p.y > this.stage.stageHeight){

            console.log("lose!!!");

            SuperTicker.getInstance().removeEventListener(this.update, this);

            this.alertPanel.visible = true;

            this.alertPanel.message.text = "You score is:" + this.bestScore;

            // this.reset();
        }
        else{

            this.human.updateDisplaysPosition(dt);

            for(let i:number = this.enemies.length - 1; i > -1 ; i--){

                let enemy:Enemy = this.enemies[i];

                enemy.updateDisplaysPosition(dt);

                let enemyDisplay:egret.DisplayObject = enemy.displays[0];

                p = this.mapContainer.localToGlobal(enemyDisplay.x, enemyDisplay.y);

                if(p.y > this.stage.stageHeight){

                    this.removeHuman(enemy);

                    this.enemies.splice(i,1);
                }
            }

            if(this.enemies.length < this.maxEnemyNum && Math.random() < this.enemyPropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.mapContainer.y / this.factor / this.unitHeight);

                let targetLevel:number = nowLevel + this.enemyPropHeightFix;

                let x:number = (targetLevel + 0.5) * this.unitWidth;

                let y:number = (targetLevel + 1.5) * this.unitHeight;

                let enemy:Enemy = Enemy.create(this.world, this.humanLength, this.humanRadius, this.mapContainer, this.mat);

                this.enemies.push(enemy);

                enemy.position = [x,y];

                enemy.updateDisplaysPosition(dt);
            }
        }
    }

    private reset():void{

        this.world.removeBody(this.human);

        this.human = null;

        this.mapContainer.removeChild(this.humanDisplay);

        this.humanDisplay = null;

        this.conBody.position = [this.conBodyX, this.conBodyY];

        this.conBody.updateDisplaysPosition();

        this.mapContainer.x = 0;
        
        this.mapContainer.y = 0;

        this.nowHeight = 0;

        Human.humanArr.length = 0;

        for(let i:number = 0; i < this.enemies.length ; i++){

            let enemy:Enemy = this.enemies[i];

            this.removeHuman(enemy);
        }

        this.enemies.length = 0;

        this.bestScore = 0;

        this.mainPanel.score.text = this.bestScore.toString();
    }

    private removeHuman(_human:Human):void{

        let index:number = Human.humanArr.indexOf(_human);

        Human.humanArr.splice(index, 1);

        this.world.removeBody(_human);

        this.mapContainer.removeChild(_human.displays[0]);
    }

    private addOneBox(e: egret.TouchEvent): void {

        if(!this.human){

            var positionX: number = e.stageX / this.factor;
            var positionY: number = (egret.MainContext.instance.stage.stageHeight - e.stageY) / this.factor;

            this.human = Human.create(this.world, this.humanLength, this.humanRadius, this.mapContainer, this.mat);

            this.humanDisplay = this.human.displays[0];

            this.human.position = [positionX, positionY];

            SuperTicker.getInstance().addEventListener(this.update, this);

            // egret.Ticker.getInstance().register(this.update, this);
        }
        else if(this.human.checkCanJump()){

            this.human.jump(this.jumpAngle, this.jumpForce, this.jumpForceTick);
        }
        else{

            console.log("no jump!");
        }
    }
}
