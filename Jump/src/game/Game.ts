class Game extends egret.DisplayObjectContainer {

    public static stageConfig:StageConfig;

    public static HUMAN_GROUP:number = Math.pow(2, 0);

    public static STAGE_WIDTH:number = 1200;

    public static STAGE_HEIGHT:number = 1920;

    public world:p2.World;

    private worldDt:number;

    public worldDtFix:number = 1;

    public isCoinDouble:boolean = false;

    public ladderMat:p2.Material;

    public humanMat:p2.Material;

    private itemBt:ItemBt;

    public bgContainer:BgContainer;

    public gameContainer:egret.DisplayObjectContainer;

    public mapContainer:egret.DisplayObjectContainer;

    private otherContainer:egret.DisplayObjectContainer;

    public humanContainer:egret.DisplayObjectContainer;

    private iconContainer:egret.DisplayObjectContainer;

    private hintContainer:egret.DisplayObjectContainer;

    private itemBtContainer:egret.DisplayObjectContainer;

    private uiContainer:egret.DisplayObjectContainer;

    public mainPanel:GameMainPanel;

    private alertPanel:GameAlertPanel;

    private hint:egret.Shape;

    private bestScore:number = 0;

    private nowMoney:number = 0;

    private btClickFun:()=>void;

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

        Human.main = this;

        GameOnline.main = this;

        this.createContainers();

        this.createItemBt();

        this.createUi();

        this.createWorldAndPlane();

        this.createHuman();

        this.createHint();

        Reward.initAngle();

        Coin.init(this);

        Item.init(this.itemBt.show.bind(this.itemBt));

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

        SuperEvent.addEventListener("iWin", this.win, this);

        SuperEvent.addEventListener("iLose", this.lose, this);

        this.bgContainer.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBg, this);

        // if(Game.stageConfig.maxLevel > 0){

        //     Terminal.create(this.otherContainer, Game.stageConfig.maxLevel);
        // }
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

        this.bgContainer = new BgContainer();

        this.addChild(this.bgContainer);

        this.gameContainer = new egret.DisplayObjectContainer();

        this.gameContainer.touchChildren = false;

        this.addChild(this.gameContainer);
        
        this.bgContainer.init(this.gameContainer);

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

        this.mainPanel.createBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickCreateBt, this);

        this.mainPanel.joinBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickJoinBt, this);
    }

    private clickCreateBt(e:egret.TouchEvent):void{

        GameOnline.start(0, parseInt(this.mainPanel.playerNum.text));
    }

    private clickJoinBt(e:egret.TouchEvent):void{

        GameOnline.start(parseInt(this.mainPanel.playerNum.text), 1);
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

        this.hint.visible = false;

        this.world.accumulator = 0;

        this.world.time = 0;

        SuperEvent.removeEventListener("iWin", this.win, this);

        SuperEvent.removeEventListener("iLose", this.win, this);

        this.bgContainer.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBg, this);

        this.overCallBack(this.bestScore, this.nowMoney);
    }

    private resumeReal():void{

        SuperTicker.getInstance().addEventListener(this.update, this);
    }

    private createWorldAndPlane():void{

        this.ladderMat = new p2.Material(1);

        this.humanMat = new p2.Material(2);

        //创建world
        this.world = new p2.World({gravity:Main.config.gameConfig.gravity});
        this.world.emitImpactEvent = false;
        this.world.sleepMode = p2.World.NO_SLEEPING;

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

        Human.create(this.world, Main.config.gameConfig.humanLength, Main.config.gameConfig.humanRadius, Main.config.gameConfig.humanStartPos[0][0], Main.config.gameConfig.humanStartPos[0][1]);
    }

    public update(_dt:number):void{
        
        let dt = _dt * this.worldDtFix * Main.config.gameConfig.worldTimeFix;
        
        let humanDisplay:egret.DisplayObject = Human.human.displays[0];

        if(humanDisplay.x + this.gameContainer.x < 0){

            this.hint.visible = true;

            this.hint.y = humanDisplay.y + this.gameContainer.y;    
        }
        else if(this.hint.visible){
            
            this.hint.visible = false;
        }

        if(Human.human.firstJump){

            Human.human.update(dt);

            this.bgContainer.update();

            this.gameContainer.x = Human.human.containerX;

            this.gameContainer.y = Human.human.containerY;
        }

        Enemy.update(dt);

        Human.update(dt);

        Line.update();

        Coin.update(_dt);

        Item.update(_dt);

        // if(Game.stageConfig.maxLevel > 0){

        //     Terminal.update();
        // }

        if(Enemy.enemies.length < Game.stageConfig.maxEnemyNum && Math.random() < Game.stageConfig.enemyPropProbability * dt * 0.001){

            let nowLevel:number = Math.floor(this.gameContainer.y / Main.config.gameConfig.factor / Main.config.gameConfig.unitHeight);

            let targetLevel:number = nowLevel + Main.config.gameConfig.propHeightFix;

            if(Game.stageConfig.maxLevel == 0 || targetLevel + Main.config.gameConfig.finalPropHeightFix < Game.stageConfig.maxLevel){
                
                let x:number = (targetLevel + 0.5) * Main.config.gameConfig.unitWidth;

                let y:number = (targetLevel + 1.5) * Main.config.gameConfig.unitHeight;

                Enemy.create(this.world, Main.config.gameConfig.humanLength, Main.config.gameConfig.humanRadius, x, y);
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
        
        let worldRealDt:number = _dt * 0.001 * Main.config.gameConfig.physicalTimeFix;

        this.world.step(this.worldDt, worldRealDt * this.worldDtFix * Main.config.gameConfig.worldTimeFix, 10);
    }

    public setScore(_score:number):void{

        if(_score > this.bestScore){

            this.bestScore = _score;

            this.mainPanel.score.text = this.bestScore.toString();
        }
    }

    public win():void{

        SuperTicker.getInstance().removeEventListener(this.update, this);

        this.alertPanel.visible = true;

        this.alertPanel.message.text = "You win!";

        this.alertPanel.bt.label = "Restart";

        this.btClickFun = this.gameOver;

        this.itemBt.reset();
    }

    public lose():void{

        this.hint.visible = false;

        SuperTicker.getInstance().removeEventListener(this.update, this);

        this.alertPanel.visible = true;

        this.alertPanel.message.text = "You score is:" + this.bestScore;

        this.alertPanel.bt.label = "Restart";

        this.btClickFun = this.gameOver;

        this.itemBt.reset();
    }

    private reset():void{

        Human.reset();

        Enemy.reset();

        Line.reset();

        Coin.reset();

        Item.reset();

        // Terminal.reset();

        this.bestScore = 0;

        this.mainPanel.score.text = this.bestScore.toString();

        this.nowMoney = 0;

        this.mainPanel.money.text = "$" + this.nowMoney;

        Human.human.reset();

        this.gameContainer.x = Human.human.containerX;

        this.gameContainer.y = Human.human.containerY;

        this.bgContainer.reset();
    }

    public touchBg(e: egret.TouchEvent): void {

        this.Jump();
    }

    private Jump():void{

        if(!Human.human.firstJump){

            Human.human.firstJump = true;

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

                console.log("no jump!");
            }
        }
    }

    public Jump2(_human:Human): void {

        if(!_human.firstJump){

            _human.firstJump = true;

            _human.gravityScale = Main.config.gameConfig.humanGravityScale;

            // SuperTicker.getInstance().addEventListener(this.update, this);

            _human.jump(Main.config.gameConfig.firstJumpAngle, Main.config.gameConfig.firstJumpForce, Main.config.gameConfig.firstJumpPoint);

        }else{

            let result:HumanJumpResult = _human.checkCanJump();

            if(result == HumanJumpResult.LADDER || result == HumanJumpResult.HUMAN){

                _human.jump(Main.config.gameConfig.jumpAngle, Main.config.gameConfig.jumpForce, Main.config.gameConfig.jumpPoint);
            }
            else if(result == HumanJumpResult.GLINE){

                this.moneyChange(Main.config.gameConfig.greenLineMoneyChange);

                _human.jump(Main.config.gameConfig.lineJumpAngle, Main.config.gameConfig.lineJumpForce, Main.config.gameConfig.lineJumpPoint);
            }
            else if(result == HumanJumpResult.RLINE){

                this.moneyChange(Main.config.gameConfig.redLineMoneyChange);

                _human.jump(Main.config.gameConfig.lineJumpAngle, Main.config.gameConfig.lineJumpForce, Main.config.gameConfig.lineJumpPoint);
            }
            else{

                console.log("no jump!");
            }
        }
    }

    public moneyChange(_v:number):void{

        this.nowMoney += _v;

        this.mainPanel.money.text = "$" + this.nowMoney;
    }
}
