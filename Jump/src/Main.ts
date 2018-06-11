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

    private firstCameraFollowTime:number;

    private firstCameraPosX:number;

    private conBodyX:number;

    private conBodyY:number;

    private mainPanel:MainPanel;

    private alertPanel:AlertPanel;

    private bestScore:number = 0;

    private config:Config;

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

        this.config = await RES.getResAsync("config_json");
    }

    /**
     * 创建游戏场景
     */
    private createGameScene(): void {

        this.stage.frameRate = this.config.fps;

        BodyObj.factor = this.config.factor;

        Human.humanSleepXFix = this.config.humanSleepXFix;

        Human.jumpDisableTime = this.config.jumpDisableTime;

        Enemy.jumpAngle = this.config.jumpAngle;

        Enemy.jumpForce = this.config.jumpForce;

        Enemy.jumpProbability = this.config.enemyJumpProbability;

        this.createContainers();

        this.createBg();

        this.createUi();
        
        this.createWorldAndPlane();

        this.createLadder();

        this.createHuman();

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

        this.mapContainer = new egret.DisplayObjectContainer();

        this.mapContainer.touchChildren = false;

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

        let verticesOrigin = [[this.config.unitWidth, this.config.unitHeight], [this.config.triangleWidth, this.config.unitHeight],[0, this.config.unitHeight - this.config.triangleHeight],[0,0]];

        let conDisplay:egret.Shape = new egret.Shape();

        conDisplay.graphics.beginFill(0xff0000);

        let factorFix:number = 0.2;

        let factor:number = this.config.factor * factorFix;

        conDisplay.graphics.moveTo(this.config.unitWidth * this.config.unitNum * factor, 0);

        conDisplay.graphics.lineTo(this.config.unitWidth * this.config.unitNum * factor, this.config.unitHeight * this.config.unitNum * -factor);

        let vertices = [];

        vertices.push([this.config.unitWidth * this.config.unitNum, 0]);

        vertices.push([this.config.unitWidth * this.config.unitNum, this.config.unitHeight * this.config.unitNum]);

        for(let m:number = this.config.unitNum - 1 ; m > -1 ; m--){

            for(let i:number = 1, n:number = verticesOrigin.length ; i < n ; i++){

                let arr = verticesOrigin[i];

                let arr2 = [arr[0] + m * this.config.unitWidth,arr[1] + m * this.config.unitHeight];

                vertices.push(arr2);

                conDisplay.graphics.lineTo((arr[0] + m * this.config.unitWidth) * factor, (arr[1] + m * this.config.unitHeight) * -factor);
            }
        }

        conDisplay.graphics.lineTo(this.config.unitWidth * this.config.unitNum * factor, 0);

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

        conDisplay.x = minX * this.config.factor;

        conDisplay.y = minY * -this.config.factor;

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
        conMat2.friction = this.config.friction;
        conMat2.relaxation = this.config.relaxation;

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

        this.human = Human.create(this.world, this.config.humanLength, this.config.humanRadius, this.mapContainer, this.mat, this.config.humanStartPos);

        this.humanDisplay = this.human.displays[0];
    }

    private update(dt:number):void{

        if (dt < 10) {
            return;
        }
        if (dt > 1000) {
            return;
        }

        this.world.step(1 / this.config.fps * this.config.physicalTimeFix);

        let lastY:number = this.mapContainer.y;

        this.mapContainer.y += this.config.heightAddSpeed * this.config.factor * dt * 0.001;

        let targetY:number = this.human.position[1] * this.config.factor - this.stage.stageHeight * 0.5;

        if(targetY > this.mapContainer.y){

            this.mapContainer.y = this.mapContainer.y + (targetY - this.mapContainer.y) * this.config.cameraFollowSpeedFix;
        }

        let targetX:number = -this.mapContainer.y * this.config.unitWidth / this.config.unitHeight;

        this.firstCameraFollowTime += dt;

        if(this.firstCameraFollowTime < this.config.firstCameraFollowTime){

            let nowX:number = this.stage.stageWidth * 0.5 - this.humanDisplay.x;

            this.mapContainer.x = nowX + (targetX - nowX) * this.firstCameraFollowTime / this.config.firstCameraFollowTime;

        }else{

            this.mapContainer.x = targetX;
        }

        let changeHeightValue:number = (this.nowHeight + 1) * this.config.changeUnitNum * this.config.unitHeight * this.config.factor;

        if(lastY < changeHeightValue && this.mapContainer.y >= changeHeightValue){

            this.nowHeight++;

            this.conBody.position[0] = this.conBody.position[0] + this.config.unitWidth * this.config.changeUnitNum;

            this.conBody.position[1] = this.conBody.position[1] + this.config.unitHeight * this.config.changeUnitNum;

            this.conBody.updateDisplaysPosition();
        }

        let humanY:number = Math.floor(this.human.position[1] / this.config.unitHeight);

        if(this.human.position[0] > (humanY - 1) * this.config.unitWidth && this.human.position[0] < humanY * this.config.unitWidth){

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

            this.alertPanel.bt.label = "Restart";

            this.btClickFun = this.restart;

            this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.addOneBox, this);

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

                    this.removeEnemy(enemy);

                    this.enemies.splice(i,1);
                }
            }

            if(this.enemies.length < this.config.maxEnemyNum && Math.random() < this.config.enemyPropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.mapContainer.y / this.config.factor / this.config.unitHeight);

                let targetLevel:number = nowLevel + this.config.enemyPropHeightFix;

                let x:number = (targetLevel + 0.5) * this.config.unitWidth;

                let y:number = (targetLevel + 1.5) * this.config.unitHeight;

                let enemy:Enemy = Enemy.create(this.world, this.config.humanLength, this.config.humanRadius, this.mapContainer, this.mat, [x,y]);

                this.enemies.push(enemy);
            }
        }
    }

    private reset():void{

        this.conBody.position[0] = this.conBodyX;

        this.conBody.position[1] = this.conBodyY;

        this.conBody.updateDisplaysPosition();

        this.mapContainer.x = 0;
        
        this.mapContainer.y = 0;

        this.nowHeight = 0;

        this.firstJump = false;

        this.firstCameraFollowTime = 0;

        Human.humanArr.length = 1;

        for(let i:number = 0, n:number = this.enemies.length; i < n ; i++){

            let enemy:Enemy = this.enemies[i];

            this.removeEnemy(enemy);
        }

        this.enemies.length = 0;

        this.bestScore = 0;

        this.mainPanel.score.text = this.bestScore.toString();

        this.human.reset();

        this.human.position[0] = this.config.humanStartPos[0];

        this.human.position[1] = this.config.humanStartPos[1];

        this.human.updateDisplaysPosition(0);

        this.mapContainer.x = -this.humanDisplay.x + this.stage.stageWidth * 0.5;

        this.mapContainer.y = -this.humanDisplay.y + this.stage.stageHeight * 0.5;

        this.firstCameraPosX = this.mapContainer.x;

        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.addOneBox, this);
    }

    private removeEnemy(_enemy:Human):void{

        Enemy.release(_enemy);
    }

    private addOneBox(e: egret.TouchEvent): void {

        if(!this.firstJump){

            this.firstJump = true;

            SuperTicker.getInstance().addEventListener(this.update, this);

            this.human.jump(this.config.firstJumpAngle, this.config.firstJumpForce);

        }else if(this.human.checkCanJump()){

            this.human.jump(this.config.jumpAngle, this.config.jumpForce);
        }
        else{

            console.log("no jump!");
        }
    }
}
