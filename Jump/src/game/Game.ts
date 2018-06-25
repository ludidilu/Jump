class Game extends egret.DisplayObjectContainer {

    public static Config:GameConfig;

    public static HUMAN_GROUP:number = Math.pow(2, 0);

    public static LADDER_GROUP:number = Math.pow(2, 1);

    public static ENEMY_GROUP:number = Math.pow(2, 2);

    private world:p2.World;

    private worldDt:number;

    public worldDtFix:number = 1;

    public isCoinDouble:boolean = false;

    private ladderMat:p2.Material;

    private humanMat:p2.Material;

    private humanDisplay:egret.DisplayObject;

    private human:Human;

    private conBody:BodyObj;

    private bg:egret.Shape;

    private itemBt:ItemBt;

    private bgContainer:egret.DisplayObjectContainer;

    private gameContainer:egret.DisplayObjectContainer;

    private mapContainer:egret.DisplayObjectContainer;

    private otherContainer:egret.DisplayObjectContainer;

    private humanContainer:egret.DisplayObjectContainer;

    private iconContainer:egret.DisplayObjectContainer;

    private hintContainer:egret.DisplayObjectContainer;

    private itemBtContainer:egret.DisplayObjectContainer;

    private uiContainer:egret.DisplayObjectContainer;

    private nowHeight:number = 0;

    private firstCameraFollowTime:number;

    private firstCameraPosX:number;

    private mainPanel:MainPanel;

    private alertPanel:AlertPanel;

    private hint:egret.Shape;

    private bestScore:number = 0;

    private nowMoney:number = 0;

    private btClickFun:()=>void;

    private firstJump:boolean = false;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event):void {

        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

        this.init();
    }

    private init():void{

        this.createContainers();

        this.createBg();

        this.createItemBt();

        this.createUi();

        this.createWorldAndPlane();

        this.createLadder();

        this.createHuman();

        this.createHint();

        Reward.initAngle();

        Coin.init(this);

        Item.init(this.itemBt.show.bind(this.itemBt));

        Human.main = this;

        if(Main.isWeixin){

            wx.onHide(this.pause.bind(this));

            wx.onShow(this.resume.bind(this));
        }
        else{

            egret.lifecycle.onPause = this.pause.bind(this);

            egret.lifecycle.onResume = this.resume.bind(this);
        }

        this.reset();
    }

    private pause():void{

        SuperTicker.getInstance().pause();

        if(SuperTicker.getInstance().hasEventListener(this.update, this)){

            SuperTicker.getInstance().removeEventListener(this.update, this);

            this.bg.touchEnabled = false;

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

        this.iconContainer = new egret.DisplayObjectContainer();

        this.gameContainer.addChild(this.iconContainer);

        this.hintContainer = new egret.DisplayObjectContainer();

        this.hintContainer.touchChildren = false;

        this.addChild(this.hintContainer);

        this.itemBtContainer = new egret.DisplayObjectContainer();

        this.addChild(this.itemBtContainer);

        this.uiContainer = new egret.DisplayObjectContainer();

        this.addChild(this.uiContainer);
    }

    private createBg():void{

        this.bg = new egret.Shape();

        this.bg.graphics.beginFill(0x666666);

        this.bg.graphics.drawRect(0,0,this.stage.stageWidth, this.stage.stageHeight);

        this.bg.graphics.endFill();

        this.bgContainer.addChild(this.bg);

        this.bg.touchEnabled = false;

        this.bg.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.addOneBox, this);
    }

    private createItemBt():void{

        this.itemBt = new ItemBt();

        this.itemBtContainer.addChild(this.itemBt);

        this.itemBt.x = 80;

        this.itemBt.y = this.stage.stageHeight - 80;
    }

    private createUi():void{

        this.mainPanel = new MainPanel();

        this.mainPanel.touchEnabled = false;

        this.uiContainer.addChild(this.mainPanel);

        this.mainPanel.score.text = this.bestScore.toString();

        this.alertPanel = new AlertPanel();

        this.alertPanel.touchEnabled = false;

        this.uiContainer.addChild(this.alertPanel);

        this.alertPanel.visible = false;

        this.alertPanel.bt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.btClick, this);

        this.mainPanel.shareBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickShareBt, this);
    }

    private clickShareBt(e:egret.TouchEvent):void{

        console.log("share!!!");

        // wx.shareAppMessage({success:this.shareSuccess.bind(this), fail:this.shareFail.bind(this), complete:this.shareComplete.bind(this)});

        // this.pause();

        // SuperTicker.getInstance().resume();

        let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.gameConfig.factor / Main.config.gameConfig.unitHeight);

        let targetLevel:number = nowLevel + Main.config.gameConfig.propHeightFix;

        let x:number = (targetLevel + 0.5) * Main.config.gameConfig.unitWidth;

        this.human.reset();

        if(Math.random() < 0.5){

            Coin.create(this.humanContainer, -1 + Math.random() - 0.5, 2, x);
        }
        else{

            Item.create(this.humanContainer, -1 + Math.random() - 0.5, 2, x);
        }
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

        this.bg.touchEnabled = true;
    }

    private createLadder():void{

        let verticesOrigin = [[Main.config.gameConfig.unitWidth, Main.config.gameConfig.unitHeight], [Main.config.gameConfig.triangleWidth, Main.config.gameConfig.unitHeight],[0, Main.config.gameConfig.unitHeight - Main.config.gameConfig.triangleHeight],[0,0]];

        let conDisplay:egret.Shape = new egret.Shape();

        conDisplay.graphics.beginFill(0xff0000);

        let factorFix:number = 0.2;

        let factor:number = Main.config.gameConfig.factor * factorFix;

        conDisplay.graphics.moveTo(Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum * factor, 0);

        conDisplay.graphics.lineTo(Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum * factor, Main.config.gameConfig.unitHeight * Main.config.gameConfig.unitNum * -factor);

        let vertices = [];

        vertices.push([Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum, 0]);

        vertices.push([Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum, Main.config.gameConfig.unitHeight * Main.config.gameConfig.unitNum]);

        for(let m:number = Main.config.gameConfig.unitNum - 1 ; m > -1 ; m--){

            for(let i:number = 1, n:number = verticesOrigin.length ; i < n ; i++){

                let arr = verticesOrigin[i];

                let arr2 = [arr[0] + m * Main.config.gameConfig.unitWidth,arr[1] + m * Main.config.gameConfig.unitHeight];

                vertices.push(arr2);

                conDisplay.graphics.lineTo((arr[0] + m * Main.config.gameConfig.unitWidth) * factor, (arr[1] + m * Main.config.gameConfig.unitHeight) * -factor);
            }
        }

        conDisplay.graphics.lineTo(Main.config.gameConfig.unitWidth * Main.config.gameConfig.unitNum * factor, 0);

        conDisplay.graphics.endFill();

        let container:egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

        container.addChild(conDisplay);
        
        conDisplay.scaleX = 1 / factorFix;

        conDisplay.scaleY = 1 / factorFix;

        this.mapContainer.addChild(container);

        this.conBody = new BodyObj();
        this.conBody.bodyType = BodyObjType.LADDER;
        this.conBody.fromPolygon(vertices);
        this.conBody.displays = [container];
        this.world.addBody(this.conBody);

        let minX:number = Number.MAX_VALUE;
        let minY:number = Number.MAX_VALUE;

        for(let i:number = 0, n:number = this.conBody.shapes.length; i < n ; i++){

            let shape:p2.Convex = <p2.Convex>this.conBody.shapes[i];

            shape.material = this.ladderMat;

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

        for(let i:number = 0, n:number = this.conBody.shapes.length; i < n ; i++){

            let shape:p2.Shape = this.conBody.shapes[i];

            shape.position[0] -= minX;

            shape.position[1] -= minY;
        }

        this.conBody.updateDisplaysPosition();

        Human.conBody = this.conBody;
    }

    private createWorldAndPlane():void{

        this.ladderMat = new p2.Material(1);

        this.humanMat = new p2.Material(2);

        //创建world
        this.world = new p2.World({gravity:Main.config.gameConfig.gravity});
        this.world.sleepMode = p2.World.BODY_SLEEPING;

        (<p2.GSSolver>this.world.solver).iterations = Main.config.gameConfig.solverIterations;

        // this.world.on("beginContact", this.beginContact, this);

        let conMat:p2.ContactMaterial = new p2.ContactMaterial(this.ladderMat, this.humanMat);
        conMat.friction = Main.config.gameConfig.friction;
        conMat.relaxation = Main.config.gameConfig.relaxation;
        conMat.restitution = Main.config.gameConfig.restitution;

        this.world.addContactMaterial(conMat);

        conMat = new p2.ContactMaterial(this.humanMat, this.humanMat);
        conMat.friction = Main.config.gameConfig.friction;
        conMat.relaxation = Main.config.gameConfig.relaxation;
        conMat.restitution = Main.config.gameConfig.restitution;

        this.world.addContactMaterial(conMat);

        //创建plane
        // var planeShape: p2.Plane = new p2.Plane();
        // var planeBody: p2.Body = new p2.Body();
        // planeBody.addShape(planeShape);
        // planeBody.displays = [];
        // planeShape.material = this.ladderMat;

        // this.world.addBody(planeBody);

        this.worldDt = 1 / Main.config.gameConfig.physicsEngineFps * Main.config.gameConfig.physicalTimeFix;
    }

    // private beginContact(aa:{bodyA:BodyObj,bodyB:BodyObj}):void{

    //     // console.log("beginContact   bodyA:" + aa.bodyA.bodyType + "  bodyB:" + aa.bodyB.bodyType);

    //     if(aa.bodyA.bodyType == BodyObjType.HUMAN && aa.bodyB.bodyType == BodyObjType.REWARD){
            
    //         (<Reward>aa.bodyB).isOver = true;
    //     }
    //     else if(aa.bodyA.bodyType == BodyObjType.REWARD && aa.bodyB.bodyType == BodyObjType.HUMAN){
            
    //         (<Reward>aa.bodyA).isOver = true;
    //     }
    // }

    private createHuman():void{

        this.human = Human.create(this.world, Main.config.gameConfig.humanLength, Main.config.gameConfig.humanRadius, this.humanContainer, this.humanMat, Main.config.gameConfig.humanStartPos[0], Main.config.gameConfig.humanStartPos[1]);

        this.humanDisplay = this.human.displays[0];
    }

    private update(_dt:number):void{

        if (_dt < 10) {
            return;
        }
        if (_dt > 1000) {
            return;
        }

        if(Main.isWeixin && !WeixinTalk.isTalking()){

            // if(Math.random() < 0.01){

            //     console.log("sendTalk!");

            //     this.sendTalk({command:Math.random().toString()});
            // }
        }

        let worldRealDt:number = _dt * 0.001 * Main.config.gameConfig.physicalTimeFix;

        this.world.step(this.worldDt, worldRealDt * this.worldDtFix * Main.config.gameConfig.worldTimeFix, 10);

        let dt = _dt * this.worldDtFix * Main.config.gameConfig.worldTimeFix;

        // this.world.step(1 / 60 * Main.config.physicalTimeFix, dt * 0.001 * Main.config.physicalTimeFix);

        this.gameContainer.y += Main.config.gameConfig.heightAddSpeed * Main.config.gameConfig.factor * dt * 0.001;

        let targetY:number = this.human.position[1] * Main.config.gameConfig.factor - this.stage.stageHeight * 0.5;

        if(targetY > this.gameContainer.y){

            this.gameContainer.y = this.gameContainer.y + (targetY - this.gameContainer.y) * Main.config.gameConfig.cameraFollowSpeedFix;
        }

        let targetX:number = -this.gameContainer.y * Main.config.gameConfig.unitWidth / Main.config.gameConfig.unitHeight;

        this.firstCameraFollowTime += dt;

        if(this.firstCameraFollowTime < Main.config.gameConfig.firstCameraFollowTime){

            let nowX:number = this.stage.stageWidth * 0.5 - this.humanDisplay.x;

            this.gameContainer.x = nowX + (targetX - nowX) * this.firstCameraFollowTime / Main.config.gameConfig.firstCameraFollowTime;

        }else{

            this.gameContainer.x = targetX;
        }

        let changeHeightValue:number = (this.nowHeight + 1) * Main.config.gameConfig.changeUnitNum * Main.config.gameConfig.unitHeight * Main.config.gameConfig.factor;

        if(this.gameContainer.y > changeHeightValue){

            this.nowHeight++;

            let ladderX:number = this.conBody.position[0] + Main.config.gameConfig.unitWidth * Main.config.gameConfig.changeUnitNum;

            let ladderY:number = this.conBody.position[1] + Main.config.gameConfig.unitHeight * Main.config.gameConfig.changeUnitNum;

            this.conBody.setPosition(ladderX, ladderY);

            this.conBody.updateDisplaysPosition();
        }

        

        let humanY:number = Math.floor(this.human.position[1] / Main.config.gameConfig.unitHeight);

        if(this.human.position[0] > (humanY - 1) * Main.config.gameConfig.unitWidth && this.human.position[0] < humanY * Main.config.gameConfig.unitWidth){

            // console.log("get score:" + humanY);

            if(humanY > this.bestScore){

                this.bestScore = humanY;

                this.mainPanel.score.text = this.bestScore.toString();
            }
        }

        let p:egret.Point = this.gameContainer.localToGlobal(this.humanDisplay.x, this.humanDisplay.y);

        if(p.y > this.stage.stageHeight + (Main.config.gameConfig.humanLength * 0.5 + Main.config.gameConfig.humanRadius) * this.human.sizeFix * Main.config.gameConfig.factor){

            console.log("lose!!!");

            this.hint.visible = false;

            SuperTicker.getInstance().removeEventListener(this.update, this);

            this.alertPanel.visible = true;

            this.alertPanel.message.text = "You score is:" + this.bestScore;

            this.alertPanel.bt.label = "Restart";

            this.btClickFun = this.restart;

            this.bg.touchEnabled = false;

            this.itemBt.reset();
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

            Line.update();

            Coin.update(_dt);

            Item.update(_dt);

            if(Enemy.enemies.length < Main.config.gameConfig.maxEnemyNum && Math.random() < Main.config.gameConfig.enemyPropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.gameConfig.factor / Main.config.gameConfig.unitHeight);

                let targetLevel:number = nowLevel + Main.config.gameConfig.propHeightFix;

                let x:number = (targetLevel + 0.5) * Main.config.gameConfig.unitWidth;

                let y:number = (targetLevel + 1.5) * Main.config.gameConfig.unitHeight;

                Enemy.create(this.world, Main.config.gameConfig.humanLength, Main.config.gameConfig.humanRadius, this.humanContainer, this.humanMat, x, y);
            }

            if(Line.lineArr.length < Main.config.gameConfig.maxLineNum && Math.random() < Main.config.gameConfig.linePropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.gameConfig.factor / Main.config.gameConfig.unitHeight);

                let targetLevel:number = nowLevel + Main.config.gameConfig.propHeightFix;

                // let y:number = (targetLevel + 0.5) * Main.config.unitHeight + (Math.random() - 0.5) * Main.config.unitHeight;

                let y:number = (targetLevel + 0.5) * Main.config.gameConfig.unitHeight;

                Line.create(y, this.otherContainer);
            }

            if(Coin.coins.length < Main.config.gameConfig.maxCoinNum && Math.random() < Main.config.gameConfig.coinPropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.gameConfig.factor / Main.config.gameConfig.unitHeight);

                let targetLevel:number = nowLevel + Main.config.gameConfig.propHeightFix;

                let x:number = targetLevel * Main.config.gameConfig.unitWidth + Main.config.gameConfig.triangleWidth * 2 + Math.random() * (Main.config.gameConfig.unitWidth - Main.config.gameConfig.triangleWidth * 2 - Main.config.gameConfig.coinRadius);

                Coin.create(this.humanContainer, Main.config.gameConfig.coinXSpeed, Main.config.gameConfig.coinJumpHeight, x);
            }

            if(Item.items.length < Main.config.gameConfig.maxItemNum && Math.random() < Main.config.gameConfig.itemPropProbability * dt * 0.001){

                let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.gameConfig.factor / Main.config.gameConfig.unitHeight);

                let targetLevel:number = nowLevel + Main.config.gameConfig.propHeightFix;

                let x:number = targetLevel * Main.config.gameConfig.unitWidth + Main.config.gameConfig.triangleWidth * 2 + Math.random() * (Main.config.gameConfig.unitWidth - Main.config.gameConfig.triangleWidth * 2 - Main.config.gameConfig.itemRadius);

                Item.create(this.humanContainer, Main.config.gameConfig.itemXSpeed, Main.config.gameConfig.itemJumpHeight, x);
            }
        }
    }

    private reset():void{

        this.conBody.setPosition(0, 0);

        this.conBody.updateDisplaysPosition();

        this.gameContainer.x = 0;
        
        this.gameContainer.y = 0;

        this.nowHeight = 0;

        this.firstJump = false;

        this.firstCameraFollowTime = 0;

        Enemy.reset();

        Line.reset();

        Coin.reset();

        Item.reset();

        this.bestScore = 0;

        this.mainPanel.score.text = this.bestScore.toString();

        this.nowMoney = 0;

        this.mainPanel.money.text = "$" + this.nowMoney;

        this.human.reset();

        this.human.setPosition(Main.config.gameConfig.humanStartPos[0], Main.config.gameConfig.humanStartPos[1]);

        this.human.updateDisplaysPosition(0);

        this.gameContainer.x = -this.humanDisplay.x + this.stage.stageWidth * 0.5;

        this.gameContainer.y = -this.humanDisplay.y + this.stage.stageHeight * 0.5;

        this.firstCameraPosX = this.gameContainer.x;

        this.bg.touchEnabled = true;
    }

    private addOneBox(e: egret.TouchEvent): void {

        if(!this.firstJump){

            this.firstJump = true;

            SuperTicker.getInstance().addEventListener(this.update, this);

            this.human.jump(Main.config.gameConfig.firstJumpAngle, Main.config.gameConfig.firstJumpForce, Main.config.gameConfig.firstJumpPoint);

        }else{

            let result:HumanJumpResult = this.human.checkCanJump();

            if(result == HumanJumpResult.LADDER || result == HumanJumpResult.HUMAN){

                this.human.jump(Main.config.gameConfig.jumpAngle, Main.config.gameConfig.jumpForce, Main.config.gameConfig.jumpPoint);
            }
            else if(result == HumanJumpResult.GLINE){

                this.moneyChange(Main.config.gameConfig.greenLineMoneyChange);

                this.human.jump(Main.config.gameConfig.lineJumpAngle, Main.config.gameConfig.lineJumpForce, Main.config.gameConfig.lineJumpPoint);
            }
            else if(result == HumanJumpResult.RLINE){

                this.moneyChange(Main.config.gameConfig.redLineMoneyChange);

                this.human.jump(Main.config.gameConfig.lineJumpAngle, Main.config.gameConfig.lineJumpForce, Main.config.gameConfig.lineJumpPoint);
            }
            else{

                // console.log("no jump!");
            }
        }
    }

    public moneyChange(_v:number):void{

        this.nowMoney += _v;

        this.mainPanel.money.text = "$" + this.nowMoney;
    }
}
