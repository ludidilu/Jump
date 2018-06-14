class Main extends egret.DisplayObjectContainer {

    public static config:Config;

    public static HUMAN_GROUP:number = Math.pow(2, 0);

    public static LADDER_GROUP:number = Math.pow(2, 1);

    public static COIN_GROUP:number = Math.pow(2, 2);

    private world:p2.World;

    private ladderMat:p2.Material;

    private humanMat:p2.Material;

    private coinMat:p2.Material;

    private humanDisplay:egret.DisplayObject;

    private human:Human;

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

    public static isWeixin:boolean;

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

        try{

            wx.onHide(this.pause.bind(this));

            wx.onShow(this.resume.bind(this));

            Main.isWeixin = true;

            console.log("is weixin");

        }catch(e){

            egret.lifecycle.onPause = this.pause.bind(this);

            egret.lifecycle.onResume = this.resume.bind(this);

            Main.isWeixin = false;

            console.log("is not weixin");
        }

        if(Main.isWeixin){

            let param:getUserInfoParam = {withCredentials:false, lang:"zh_CN", timeout:3000, success: this.weixinSuccess.bind(this), fail: this.weixinFail, complete:this.weixinComplete}

            wx.getUserInfo(param);
        }

        this.reset();
    }

    private bitmap: egret.Bitmap;

    private weixinSuccess(_param:getUserInfoSuccess):void{

        console.log("weixinSuccess!");

        for(let key in _param.userInfo){

            console.log("key:" + key + "   value:" + _param.userInfo[key]);
        }

        RES.getResByUrl(_param.userInfo.avatarUrl, this.getWeixinImage, this, RES.ResourceItem.TYPE_IMAGE);

        
        

        let kv = {key:"score",value:"12"};

        let kv2 = {key:"zxasd12",value:"12322"};

        let data = {KVDataList: [kv, kv2],success:this.setUserCloudStorageSuccess.bind(this), fail:this.setUserCloudStorageFail.bind(this), complete:this.setUserCloudStorageComplete.bind(this)};

        wx.setUserCloudStorage(data);
    }

    private sendTalk(_cmd:any):void{

        WeixinTalk.talk(_cmd, this.getTalk.bind(this));
    }

    private getTalk(_str:string):void{

        console.log("gettalk:" + _str);
    }

    private setUserCloudStorageSuccess():void{
        console.log("setUserCloudStorageSuccess");
        
    }

    private setUserCloudStorageFail():void{
        console.log("setUserCloudStorageFail");
    }

    private setUserCloudStorageComplete():void{
        console.log("setUserCloudStorageComplete");
    }

    private getWeixinImage(_tex:egret.Texture):void{

        let bp:egret.Bitmap = new egret.Bitmap(_tex);

        this.uiContainer.addChild(bp);
    }

    private weixinFail():void{
        console.log("weixinFail!");
    }

    private weixinComplete():void{
        console.log("weixinComplete!");
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

        this.alertPanel.bt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.btClick, this);

        this.mainPanel.shareBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickShareBt, this);
    }

    private clickShareBt(e:egret.TouchEvent):void{

        wx.shareAppMessage({success:this.shareSuccess.bind(this), fail:this.shareFail.bind(this), complete:this.shareComplete.bind(this)});
    }

    private shareSuccess(v):void{
        console.log("shareSuccess:" + v);
    }

    private shareFail(v):void{
        console.log("shareFail:" + v);

        for(let key in v){
            console.log("key:" + key + "  value:" + v[key]);
        }
    }

    private shareComplete(v):void{
        console.log("shareComplete");
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

            shape.material = this.ladderMat;

            shape.collisionGroup = Main.LADDER_GROUP;

            shape.collisionMask = Main.HUMAN_GROUP | Main.COIN_GROUP;

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

        this.ladderMat = new p2.Material(1);

        this.humanMat = new p2.Material(2);

        this.coinMat = new p2.Material(3);

        //创建world
        this.world = new p2.World({gravity:Main.config.gravity});
        this.world.sleepMode = p2.World.BODY_SLEEPING;

        let conMat:p2.ContactMaterial = new p2.ContactMaterial(this.ladderMat, this.humanMat);
        conMat.friction = Main.config.friction;
        conMat.relaxation = Main.config.relaxation;
        conMat.restitution = Main.config.restitution;

        this.world.addContactMaterial(conMat);

        conMat = new p2.ContactMaterial(this.humanMat, this.humanMat);
        conMat.friction = Main.config.friction;
        conMat.relaxation = Main.config.relaxation;
        conMat.restitution = Main.config.restitution;

        this.world.addContactMaterial(conMat);

        conMat = new p2.ContactMaterial(this.ladderMat, this.coinMat);
        conMat.friction = Main.config.coinFriction;
        conMat.relaxation = Main.config.coinRelaxation;
        conMat.restitution = Main.config.coinRestitution;

        this.world.addContactMaterial(conMat);

        //创建plane
        var planeShape: p2.Plane = new p2.Plane();
        var planeBody: p2.Body = new p2.Body();
        planeBody.addShape(planeShape);
        planeBody.displays = [];
        planeShape.material = this.ladderMat;

        this.world.addBody(planeBody);
    }

    private createHuman():void{

        this.human = Human.create(this.world, Main.config.humanLength, Main.config.humanRadius, this.humanContainer, this.humanMat, Main.config.humanStartPos);

        this.humanDisplay = this.human.displays[0];
    }

    private update(dt:number):void{

        if (dt < 10) {
            return;
        }
        if (dt > 1000) {
            return;
        }

        if(Main.isWeixin && !WeixinTalk.isTalking()){

            if(Math.random() < 0.01){

                console.log("sendTalk!");

                this.sendTalk({command:Math.random().toString()});
            }
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

            Coin.update();

            if(Enemy.enemies.length < Main.config.maxEnemyNum && Math.random() < Main.config.enemyPropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.factor / Main.config.unitHeight);

                let targetLevel:number = nowLevel + Main.config.propHeightFix;

                let x:number = (targetLevel + 0.5) * Main.config.unitWidth;

                let y:number = (targetLevel + 0.5) * Main.config.unitHeight;

                Enemy.create(this.world, Main.config.humanLength, Main.config.humanRadius, this.humanContainer, this.humanMat, [x,y]);
            }

            if(Line.lineArr.length < Main.config.maxLineNum && Math.random() < Main.config.linePropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.factor / Main.config.unitHeight);

                let targetLevel:number = nowLevel + Main.config.propHeightFix;

                let y:number = (targetLevel + 0.5) * Main.config.unitHeight + (Math.random() - 0.5) * Main.config.unitHeight;

                Line.create(y, this.otherContainer);
            }

            if(Coin.coins.length < Main.config.maxCoinNum && Math.random() < Main.config.coinPropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.factor / Main.config.unitHeight);

                let targetLevel:number = nowLevel + Main.config.propHeightFix;

                let x:number = (targetLevel + 0.5) * Main.config.unitWidth + (Math.random() - 0.5) * (Main.config.unitWidth - Main.config.coinRadius * 2);

                let y:number = (targetLevel + 1) * Main.config.unitHeight + Math.random() * (Main.config.unitHeight - Main.config.coinRadius * 2);

                Coin.create(this.world, this.humanContainer, this.coinMat, [x,y]);
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

        Coin.reset();

        Line.reset();

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

            this.human.jump(Main.config.firstJumpAngle, Main.config.firstJumpForce, Main.config.firstJumpPoint);

        }else{

            let result:HumanJumpResult = this.human.checkCanJump();

            if(result == HumanJumpResult.LADDER || result == HumanJumpResult.HUMAN){

                this.human.jump(Main.config.jumpAngle, Main.config.jumpForce, Main.config.jumpPoint);
            }
            else if(result == HumanJumpResult.LINE){

                this.human.jump(Main.config.lineJumpAngle, Main.config.lineJumpForce, Main.config.lineJumpPoint);
            }
            else{

                console.log("no jump!");
            }
        }
    }
}
