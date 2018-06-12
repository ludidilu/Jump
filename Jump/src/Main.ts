class Main extends egret.DisplayObjectContainer {

    public static config:Config;

    private world:p2.World;

    private mat:p2.Material;

    private humanDisplay:egret.DisplayObject;

    private human:Human;

    // private enemies:Human[] = [];

    private conBody:BodyObj;

    private bgContainer:egret.DisplayObjectContainer;

    private gameContainer:egret.DisplayObjectContainer;

    private mapContainer:egret.DisplayObjectContainer;

    private otherContainer:egret.DisplayObjectContainer;

    private humanContainer:egret.DisplayObjectContainer;

    private hintContainer:egret.DisplayObjectContainer;

    private uiContainer:egret.DisplayObjectContainer;

    private nowHeight:number = 0;

    private firstCameraFollowTime:number;

    private firstCameraPosX:number;

    private conBodyX:number;

    private conBodyY:number;

    private mainPanel:MainPanel;

    private alertPanel:AlertPanel;

    private hint:egret.Shape;

    private bestScore:number = 0;

    private btClickFun:()=>void;

    private firstJump:boolean = false;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event):void {

        egret.registerImplementation("eui.IAssetAdapter", new AssetAdapter());
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

        //初始化Resource资源加载库
        // RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        // RES.loadConfig("resource/default.res.json", "resource/");

        this.loadResources();
    }

    private async loadResources():Promise<void>{

        await RES.loadConfig("resource/default.res.json", "resource/");
        await this.loadTheme();
        await RES.loadGroup("preload");
        await this.loadConfig();

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

    private async loadConfig():Promise<void>{

        Main.config = await RES.getResAsync("config_json");
    }

    /**
     * 创建游戏场景
     */
    private createGameScene(): void {

        this.stage.frameRate = Main.config.fps;

        this.createContainers();

        this.createBg();

        this.createUi();
        
        this.createWorldAndPlane();

        this.createLadder();

        this.createHuman();

        this.createHint();

        Line.container = this.otherContainer;

        try{

            wx.onHide(this.pause.bind(this));

            wx.onShow(this.resume.bind(this));

        }catch(e){

            egret.lifecycle.onPause = this.pause.bind(this);

            egret.lifecycle.onResume = this.resume.bind(this);
        }

        this.reset();
    }

    private pause():void{

        SuperTicker.getInstance().pause();

        if(SuperTicker.getInstance().hasEventListener(this.update, this)){

            SuperTicker.getInstance().removeEventListener(this.update, this);

            this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.addOneBox, this);

            this.alertPanel.visible = true;

            this.alertPanel.message.text = "Click to continue";

            this.alertPanel.bt.label = "Resume";

            this.btClickFun = this.resumeReal;
        }
    }

    private resume():void{

        SuperTicker.getInstance().resume();
    }

    private createContainers():void{

        this.bgContainer = new egret.DisplayObjectContainer();

        this.bgContainer.touchChildren = false;

        this.addChild(this.bgContainer);

        this.gameContainer = new egret.DisplayObjectContainer();

        this.gameContainer.touchChildren = false;

        this.addChild(this.gameContainer);

        this.mapContainer = new egret.DisplayObjectContainer();

        this.gameContainer.addChild(this.mapContainer);

        this.otherContainer = new egret.DisplayObjectContainer();

        this.gameContainer.addChild(this.otherContainer);

        this.humanContainer = new egret.DisplayObjectContainer();

        this.gameContainer.addChild(this.humanContainer);

        this.hintContainer = new egret.DisplayObjectContainer();

        this.hintContainer.touchChildren = false;

        this.addChild(this.hintContainer);

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
    }

    private createHint():void{

        this.hint = new egret.Shape;

        this.hint.graphics.beginFill(0xff00ff);
        this.hint.graphics.moveTo(-20,0);
        this.hint.graphics.lineTo(20,20);
        this.hint.graphics.lineTo(20,-20);
        this.hint.graphics.lineTo(-20,0);
        this.hint.graphics.endFill();

        this.hintContainer.addChild(this.hint);

        this.hint.x = 30;
        // this.hint.y = 100;

        this.hint.visible = false;
    }

    private btClick(e:egret.TouchEvent):void{

        this.alertPanel.visible = false;

        this.btClickFun();
    }

    private restart():void{

        this.reset();
    }

    private resumeReal():void{

        SuperTicker.getInstance().addEventListener(this.update, this);

        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.addOneBox, this);
    }

    private createLadder():void{

        let verticesOrigin = [[Main.config.unitWidth, Main.config.unitHeight], [Main.config.triangleWidth, Main.config.unitHeight],[0, Main.config.unitHeight - Main.config.triangleHeight],[0,0]];

        let conDisplay:egret.Shape = new egret.Shape();

        conDisplay.graphics.beginFill(0xff0000);

        let factorFix:number = 0.2;

        let factor:number = Main.config.factor * factorFix;

        conDisplay.graphics.moveTo(Main.config.unitWidth * Main.config.unitNum * factor, 0);

        conDisplay.graphics.lineTo(Main.config.unitWidth * Main.config.unitNum * factor, Main.config.unitHeight * Main.config.unitNum * -factor);

        let vertices = [];

        vertices.push([Main.config.unitWidth * Main.config.unitNum, 0]);

        vertices.push([Main.config.unitWidth * Main.config.unitNum, Main.config.unitHeight * Main.config.unitNum]);

        for(let m:number = Main.config.unitNum - 1 ; m > -1 ; m--){

            for(let i:number = 1, n:number = verticesOrigin.length ; i < n ; i++){

                let arr = verticesOrigin[i];

                let arr2 = [arr[0] + m * Main.config.unitWidth,arr[1] + m * Main.config.unitHeight];

                vertices.push(arr2);

                conDisplay.graphics.lineTo((arr[0] + m * Main.config.unitWidth) * factor, (arr[1] + m * Main.config.unitHeight) * -factor);
            }
        }

        conDisplay.graphics.lineTo(Main.config.unitWidth * Main.config.unitNum * factor, 0);

        conDisplay.graphics.endFill();

        let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

        container.addChild(conDisplay);

        this.mapContainer.addChild(container);

        this.conBody = new BodyObj();
        this.conBody.fromPolygon(vertices);
        this.conBody.displays = [container];
        this.world.addBody(this.conBody);

        let minX:number = Number.MAX_VALUE;
        let minY:number = Number.MAX_VALUE;

        for(let i:number = 0, n:number = this.conBody.shapes.length; i < n ; i++){

            let shape:p2.Convex = <p2.Convex>this.conBody.shapes[i];

            shape.material = this.mat;

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

        conDisplay.x = minX * Main.config.factor;

        conDisplay.y = minY * -Main.config.factor;

        conDisplay.scaleX = 1 / factorFix;

        conDisplay.scaleY = 1 / factorFix;

        this.conBodyX = -minX;

        this.conBodyY = -minY;

        this.conBody.position[0] = -minX;

        this.conBody.position[1] = -minY;

        this.conBody.updateDisplaysPosition();

        Human.conBody = this.conBody;
    }

    private createWorldAndPlane():void{

        this.mat = new p2.Material(1);

        //创建world
        this.world = new p2.World();
        this.world.sleepMode = p2.World.BODY_SLEEPING;

        let conMat2:p2.ContactMaterial = new p2.ContactMaterial(this.mat, this.mat);
        conMat2.friction = Main.config.friction;
        conMat2.relaxation = Main.config.relaxation;

        this.world.addContactMaterial(conMat2);


        //创建plane
        var planeShape: p2.Plane = new p2.Plane();
        var planeBody: p2.Body = new p2.Body();
        planeBody.addShape(planeShape);
        planeBody.displays = [];
        planeShape.material = this.mat;

        this.world.addBody(planeBody);
    }

    private createHuman():void{

        this.human = Human.create(this.world, Main.config.humanLength, Main.config.humanRadius, this.humanContainer, this.mat, Main.config.humanStartPos);

        this.humanDisplay = this.human.displays[0];
    }

    private update(dt:number):void{

        if (dt < 10) {
            return;
        }
        if (dt > 1000) {
            return;
        }

        this.world.step(1 / Main.config.fps * Main.config.physicalTimeFix);

        let lastY:number = this.gameContainer.y;

        this.gameContainer.y += Main.config.heightAddSpeed * Main.config.factor * dt * 0.001;

        let targetY:number = this.human.position[1] * Main.config.factor - this.stage.stageHeight * 0.5;

        if(targetY > this.gameContainer.y){

            this.gameContainer.y = this.gameContainer.y + (targetY - this.gameContainer.y) * Main.config.cameraFollowSpeedFix;
        }

        let targetX:number = -this.gameContainer.y * Main.config.unitWidth / Main.config.unitHeight;

        this.firstCameraFollowTime += dt;

        if(this.firstCameraFollowTime < Main.config.firstCameraFollowTime){

            let nowX:number = this.stage.stageWidth * 0.5 - this.humanDisplay.x;

            this.gameContainer.x = nowX + (targetX - nowX) * this.firstCameraFollowTime / Main.config.firstCameraFollowTime;

        }else{

            this.gameContainer.x = targetX;
        }

        let changeHeightValue:number = (this.nowHeight + 1) * Main.config.changeUnitNum * Main.config.unitHeight * Main.config.factor;

        if(lastY < changeHeightValue && this.gameContainer.y >= changeHeightValue){

            this.nowHeight++;

            this.conBody.position[0] = this.conBody.position[0] + Main.config.unitWidth * Main.config.changeUnitNum;

            this.conBody.position[1] = this.conBody.position[1] + Main.config.unitHeight * Main.config.changeUnitNum;

            this.conBody.updateDisplaysPosition();
        }

        Line.update();

        let humanY:number = Math.floor(this.human.position[1] / Main.config.unitHeight);

        if(this.human.position[0] > (humanY - 1) * Main.config.unitWidth && this.human.position[0] < humanY * Main.config.unitWidth){

            // console.log("get score:" + humanY);

            if(humanY > this.bestScore){

                this.bestScore = humanY;

                this.mainPanel.score.text = this.bestScore.toString();
            }
        }

        let p:egret.Point = this.gameContainer.localToGlobal(this.humanDisplay.x, this.humanDisplay.y);

        if(p.y > this.stage.stageHeight){

            console.log("lose!!!");

            this.hint.visible = false;

            SuperTicker.getInstance().removeEventListener(this.update, this);

            this.alertPanel.visible = true;

            this.alertPanel.message.text = "You score is:" + this.bestScore;

            this.alertPanel.bt.label = "Restart";

            this.btClickFun = this.restart;

            this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.addOneBox, this);

            // this.reset();
        }
        else{

            if(this.humanDisplay.x + this.gameContainer.x < 0){

                this.hint.visible = true;

                this.hint.y = this.humanDisplay.y + this.gameContainer.y;    
            }
            else if(this.hint.visible){
                
                this.hint.visible = false;
            }

            this.human.updateDisplaysPosition(dt);

            Enemy.update(dt);

            if(Enemy.enemies.length < Main.config.maxEnemyNum && Math.random() < Main.config.enemyPropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.factor / Main.config.unitHeight);

                let targetLevel:number = nowLevel + Main.config.enemyPropHeightFix;

                let x:number = (targetLevel + 0.5) * Main.config.unitWidth;

                let y:number = (targetLevel + 1.5) * Main.config.unitHeight;

                let enemy:Enemy = Enemy.create(this.world, Main.config.humanLength, Main.config.humanRadius, this.humanContainer, this.mat, [x,y]);
            }

            if(Line.lineArr.length < Main.config.maxLineNum && Math.random() < Main.config.linePropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.factor / Main.config.unitHeight);

                let targetLevel:number = nowLevel + Main.config.linePropHeightFix;

                let y:number = (targetLevel + 1.5) * Main.config.unitHeight + (Math.random() - 0.5) * Main.config.unitHeight;

                Line.create(y);
            }
        }
    }

    private reset():void{

        this.conBody.position[0] = this.conBodyX;

        this.conBody.position[1] = this.conBodyY;

        this.conBody.updateDisplaysPosition();

        this.gameContainer.x = 0;
        
        this.gameContainer.y = 0;

        this.nowHeight = 0;

        this.firstJump = false;

        this.firstCameraFollowTime = 0;

        Human.humanArr.length = 1;

        Enemy.reset();

        this.bestScore = 0;

        this.mainPanel.score.text = this.bestScore.toString();

        this.human.reset();

        this.human.position[0] = Main.config.humanStartPos[0];

        this.human.position[1] = Main.config.humanStartPos[1];

        this.human.updateDisplaysPosition(0);

        this.gameContainer.x = -this.humanDisplay.x + this.stage.stageWidth * 0.5;

        this.gameContainer.y = -this.humanDisplay.y + this.stage.stageHeight * 0.5;

        this.firstCameraPosX = this.gameContainer.x;

        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.addOneBox, this);
    }

    private addOneBox(e: egret.TouchEvent): void {

        if(!this.firstJump){

            this.firstJump = true;

            SuperTicker.getInstance().addEventListener(this.update, this);

            this.human.jump(Main.config.firstJumpAngle, Main.config.firstJumpForce);

        }else{

            let result:HumanJumpResult = this.human.checkCanJump();

            if(result == HumanJumpResult.LADDER || result == HumanJumpResult.HUMAN){

                this.human.jump(Main.config.jumpAngle, Main.config.jumpForce);
            }
            else if(result == HumanJumpResult.LINE){

                this.human.jump(Main.config.lineJumpAngle, Main.config.lineJumpForce);
            }
            else{

                console.log("no jump!");
            }
        }
    }
}
