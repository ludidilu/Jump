class Game extends egret.DisplayObjectContainer {

    public static stageConfig:StageConfig;

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

    private firstCameraFollowTime:number;

    private firstCameraPosX:number;

    private mainPanel:GameMainPanel;

    private alertPanel:GameAlertPanel;

    private hint:egret.Shape;

    private bestScore:number = 0;

    private nowMoney:number = 0;

    private btClickFun:()=>void;

    private firstJump:boolean = false;

    private overCallBack:(_level:number, _money:number)=>void;

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
    }

    public start(_stageConfig:StageConfig, _overCallBack:(_level:number, _money:number)=>void):void{

        this.reset();

        Game.stageConfig = _stageConfig;

        this.overCallBack = _overCallBack;

        if(Game.stageConfig.maxLevel > 0){

            Terminal.create(this.otherContainer, Game.stageConfig.maxLevel);
        }
    }

    private pause():void{

        SuperTicker.getInstance().pause();

        if(SuperTicker.getInstance().hasEventListener(this.update, this)){

            SuperTicker.getInstance().removeEventListener(this.update, this);

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

        this.bg.touchEnabled = true;

        this.bg.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBg, this);
    }

    private createItemBt():void{

        this.itemBt = new ItemBt();

        this.itemBtContainer.addChild(this.itemBt);

        this.itemBt.x = 80;

        this.itemBt.y = this.stage.stageHeight - 80;
    }

    private createUi():void{

        this.mainPanel = new GameMainPanel();

        this.mainPanel.touchEnabled = false;

        this.uiContainer.addChild(this.mainPanel);

        this.mainPanel.score.text = this.bestScore.toString();

        this.alertPanel = new GameAlertPanel();

        this.alertPanel.touchEnabled = false;

        this.uiContainer.addChild(this.alertPanel);

        this.alertPanel.visible = false;

        this.alertPanel.bt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.btClick, this);

        this.mainPanel.shareBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickShareBt, this);
    }

    private clickShareBt(e:egret.TouchEvent):void{

        console.log("share!!!");

        wx.shareAppMessage({query:"a=1,b=2"});
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

    private gameOver():void{

        this.overCallBack(this.bestScore, this.nowMoney);
    }

    private resumeReal():void{

        SuperTicker.getInstance().addEventListener(this.update, this);
    }

    private createLadder():void{

        Ladder.create(this.world, this.gameContainer, this.mapContainer, this.ladderMat);
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

        this.worldDt = 1 / Main.config.gameConfig.physicsEngineFps * Main.config.gameConfig.physicalTimeFix;
    }

    private createHuman():void{

        let human:Human = Human.create(this.world, Main.config.gameConfig.humanLength, Main.config.gameConfig.humanRadius, this.humanContainer, this.humanMat, Main.config.gameConfig.humanStartPos[0], Main.config.gameConfig.humanStartPos[1]);

        this.humanDisplay = human.displays[0];
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

        this.gameContainer.y += Game.stageConfig.heightAddSpeed * Main.config.gameConfig.factor * dt * 0.001;

        let targetY:number = Human.human.position[1] * Main.config.gameConfig.factor - this.stage.stageHeight * 0.5;

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
        
        let xPos:number = Human.human.position[0] / Main.config.gameConfig.unitWidth;

        let xLevel:number = Math.floor(xPos);

        if(Game.stageConfig.maxLevel > 0 && xLevel + 1 >= Game.stageConfig.maxLevel){

            let xPosFix:number = (xPos - Game.stageConfig.maxLevel + 1) * Main.config.gameConfig.unitWidth;

            if(xPosFix > Main.config.gameConfig.finalLadderXFix){

                this.setScore(Game.stageConfig.maxLevel);

                this.win();

                return;
            }
            else{

                this.setScore(Game.stageConfig.maxLevel - 1);
            }
        }
        else{

            let xPosFix:number = (xPos - xLevel) * Main.config.gameConfig.unitWidth;

            if(xPosFix > Main.config.gameConfig.ladderXFix){

                this.setScore(xLevel + 1);
            }
            else{

                this.setScore(xLevel);
            }
        }

        let p:egret.Point = this.gameContainer.localToGlobal(this.humanDisplay.x, this.humanDisplay.y);

        if(p.y > this.stage.stageHeight + (Main.config.gameConfig.humanLength * 0.5 + Main.config.gameConfig.humanRadius) * Human.human.sizeFix * Main.config.gameConfig.factor){

            this.lose();

            return;
        }

        if(this.humanDisplay.x + this.gameContainer.x < 0){

            this.hint.visible = true;

            this.hint.y = this.humanDisplay.y + this.gameContainer.y;    
        }
        else if(this.hint.visible){
            
            this.hint.visible = false;
        }

        Human.human.updateDisplaysPosition(dt);

        Enemy.update(dt);

        Line.update();

        Coin.update(_dt);

        Item.update(_dt);

        Ladder.update();

        if(Game.stageConfig.maxLevel > 0){

            Terminal.update();
        }

        if(Enemy.enemies.length < Game.stageConfig.maxEnemyNum && Math.random() < Game.stageConfig.enemyPropProbability * dt * 0.001){

            let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.gameConfig.factor / Main.config.gameConfig.unitHeight);

            let targetLevel:number = nowLevel + Main.config.gameConfig.propHeightFix;

            if(Game.stageConfig.maxLevel == 0 || targetLevel + Main.config.gameConfig.finalPropHeightFix < Game.stageConfig.maxLevel){
                
                let x:number = (targetLevel + 0.5) * Main.config.gameConfig.unitWidth;

                let y:number = (targetLevel + 1.5) * Main.config.gameConfig.unitHeight;

                Enemy.create(this.world, Main.config.gameConfig.humanLength, Main.config.gameConfig.humanRadius, this.humanContainer, this.humanMat, x, y);
            }
        }

        if(Line.lineArr.length < Game.stageConfig.maxLineNum && Math.random() < Game.stageConfig.linePropProbability * dt * 0.001){

            let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.gameConfig.factor / Main.config.gameConfig.unitHeight);

            let targetLevel:number = nowLevel + Main.config.gameConfig.propHeightFix;

            if(Game.stageConfig.maxLevel == 0 || targetLevel + Main.config.gameConfig.finalPropHeightFix < Game.stageConfig.maxLevel){

                let y:number = (targetLevel + 0.5) * Main.config.gameConfig.unitHeight;

                Line.create(y, this.otherContainer);
            }
        }

        if(Coin.coins.length < Game.stageConfig.maxCoinNum && Math.random() < Game.stageConfig.coinPropProbability * dt * 0.001){

            let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.gameConfig.factor / Main.config.gameConfig.unitHeight);

            let targetLevel:number = nowLevel + Main.config.gameConfig.propHeightFix;

            if(Game.stageConfig.maxLevel == 0 || targetLevel + Main.config.gameConfig.finalPropHeightFix < Game.stageConfig.maxLevel){

                let x:number = targetLevel * Main.config.gameConfig.unitWidth + Main.config.gameConfig.triangleWidth * 2 + Math.random() * (Main.config.gameConfig.unitWidth - Main.config.gameConfig.triangleWidth * 2 - Main.config.gameConfig.coinRadius);

                Coin.create(this.humanContainer, Game.stageConfig.coinXSpeed, Game.stageConfig.coinJumpHeight, x);
            }
        }

        if(Item.items.length < Game.stageConfig.maxItemNum && Math.random() < Game.stageConfig.itemPropProbability * dt * 0.001){

            let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.gameConfig.factor / Main.config.gameConfig.unitHeight);

            let targetLevel:number = nowLevel + Main.config.gameConfig.propHeightFix;

            if(Game.stageConfig.maxLevel == 0 || targetLevel + Main.config.gameConfig.finalPropHeightFix < Game.stageConfig.maxLevel){

                let x:number = targetLevel * Main.config.gameConfig.unitWidth + Main.config.gameConfig.triangleWidth * 2 + Math.random() * (Main.config.gameConfig.unitWidth - Main.config.gameConfig.triangleWidth * 2 - Main.config.gameConfig.itemRadius);

                Item.create(this.humanContainer, Game.stageConfig.itemXSpeed, Game.stageConfig.itemJumpHeight, x);
            }
        }
    }

    private setScore(_score:number):void{

        if(_score > this.bestScore){

            this.bestScore = _score;

            this.mainPanel.score.text = this.bestScore.toString();
        }
    }

    private win():void{

        SuperTicker.getInstance().removeEventListener(this.update, this);

        this.alertPanel.visible = true;

        this.alertPanel.message.text = "You win!";

        this.alertPanel.bt.label = "Restart";

        this.btClickFun = this.gameOver;

        this.itemBt.reset();
    }

    private lose():void{

        this.hint.visible = false;

        SuperTicker.getInstance().removeEventListener(this.update, this);

        this.alertPanel.visible = true;

        this.alertPanel.message.text = "You score is:" + this.bestScore;

        this.alertPanel.bt.label = "Restart";

        this.btClickFun = this.gameOver;

        this.itemBt.reset();
    }

    private reset():void{

        this.gameContainer.x = 0;
        
        this.gameContainer.y = 0;

        this.firstJump = false;

        this.firstCameraFollowTime = 0;

        Ladder.reset();

        Enemy.reset();

        Line.reset();

        Coin.reset();

        Item.reset();

        Terminal.reset();

        this.bestScore = 0;

        this.mainPanel.score.text = this.bestScore.toString();

        this.nowMoney = 0;

        this.mainPanel.money.text = "$" + this.nowMoney;

        Human.human.reset();

        Human.human.setPosition(Main.config.gameConfig.humanStartPos[0], Main.config.gameConfig.humanStartPos[1]);

        Human.human.updateDisplaysPosition(0);

        this.gameContainer.x = -this.humanDisplay.x + this.stage.stageWidth * 0.5;

        this.gameContainer.y = -this.humanDisplay.y + this.stage.stageHeight * 0.5;

        this.firstCameraPosX = this.gameContainer.x;
    }

    private touchBg(e: egret.TouchEvent): void {

        if(!this.firstJump){

            this.firstJump = true;

            SuperTicker.getInstance().addEventListener(this.update, this);

            Human.human.jump(Main.config.gameConfig.firstJumpAngle, Main.config.gameConfig.firstJumpForce, Main.config.gameConfig.firstJumpPoint);

        }else{

            let result:HumanJumpResult = Human.human.checkCanJump();

            if(result == HumanJumpResult.LADDER || result == HumanJumpResult.HUMAN){

                Human.human.jump(Main.config.gameConfig.jumpAngle, Main.config.gameConfig.jumpForce, Main.config.gameConfig.jumpPoint);
            }
            else if(result == HumanJumpResult.GLINE){

                this.moneyChange(Main.config.gameConfig.greenLineMoneyChange);

                Human.human.jump(Main.config.gameConfig.lineJumpAngle, Main.config.gameConfig.lineJumpForce, Main.config.gameConfig.lineJumpPoint);
            }
            else if(result == HumanJumpResult.RLINE){

                this.moneyChange(Main.config.gameConfig.redLineMoneyChange);

                Human.human.jump(Main.config.gameConfig.lineJumpAngle, Main.config.gameConfig.lineJumpForce, Main.config.gameConfig.lineJumpPoint);
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
