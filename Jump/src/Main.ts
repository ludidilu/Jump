class Faaa implements RES.PromiseTaskReporter{

    public onProgress(current: number, total: number):void{

        console.log("current:" + current + "  total:" + total);
    }

    public onCancel():void{

        console.log("cancel");
    }
}

class Main extends egret.DisplayObjectContainer {

    public static readonly CHALLENGE_SCORE:string = "challengeScore";

    public static readonly ENDLESS_SCORE:string = "endlessScore";

    public static readonly MONEY:string = "money";

    public static config:Config;

    public static isWeixin:boolean;

    private game:Game;

    private mainPanel:MainPanel;

    private rankPanel:RankPanel;

    private rankArr:eui.ArrayCollection = new eui.ArrayCollection();

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event):void {

        // Connection.init();

        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

        console.log("version:" + 32201);

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

        this.start();
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

    private async start():Promise<void>{

        this.stage.frameRate = Main.config.mainConfig.fps;

        try{

            let hide:(param:()=>void)=>void = wx.onHide;

            Main.isWeixin = true;

            console.log("is weixin");

        }catch(e){

            Main.isWeixin = false;

            console.log("is not weixin");
        }

        if(Main.isWeixin){

            await WeixinData.init().catch(this.promiseCatch);
        }

        this.initGame();

        this.initMainPanel();

        this.refreshMainPanel();

        this.initRankPanel();
    }

    private promiseCatch(reason):void{

        console.log("reason:" + reason);
    }

    private refreshMainPanel():void{

        if(Main.isWeixin){

            this.mainPanel.scoreGroup.visible = true;

            let str:string = KVDataTools.getValue(WeixinData.userInfo.KVDataList, Main.CHALLENGE_SCORE);

            if(!str){

                str = "0"
            }
            
            this.mainPanel.challengeScore.text = str;

            str = KVDataTools.getValue(WeixinData.userInfo.KVDataList, Main.ENDLESS_SCORE);

            if(!str){

                str = "0"
            }

            this.mainPanel.endlessScore.text = str;

            str = KVDataTools.getValue(WeixinData.userInfo.KVDataList, Main.MONEY);

            if(!str){

                str = "0"
            }

            this.mainPanel.money.text = str;
        }
        else{

            this.mainPanel.scoreGroup.visible = false;
        }
    }

    private initMainPanel():void{

        this.mainPanel = new MainPanel();

        this.addChild(this.mainPanel);

        this.mainPanel.challengeBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.challengeBtClick, this);

        this.mainPanel.endlessBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.endlessBtClick, this);

        if(Main.isWeixin){

            this.mainPanel.rankBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.rankBtClick, this);

            this.mainPanel.fenxiangBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.fenxiangBtClick, this);
        }
        else{

            this.mainPanel.rankBt.visible = false;

            this.mainPanel.fenxiangBt.visible = false;
        }
    }

    private fenxiangBtClick(e:egret.TouchEvent):void{

        wx.shareAppMessage({query:"a=1,b=2"});
    }

    private rankBtClick(e:egret.TouchEvent):void{

        this.rankPanel.visible = true;
    }

    private initRankPanel():void{

        this.rankPanel = new RankPanel();

        this.addChild(this.rankPanel);

        // this.rankPanel.scroller.viewport = this.rankPanel.list;

        this.rankPanel.list.itemRenderer = RankCell;

        this.rankPanel.list.itemRendererSkinName = "RankCellSkin";

        this.rankPanel.list.dataProvider = this.rankArr;

        if(!Main.isWeixin){

            this.rankPanel.visible = false;
        }
        else{

            for(let i:number = 0, m:number = WeixinData.friendData.length; i < m ; i++){

                this.rankArr.addItem(WeixinData.friendData[i]);
            }
        }

        this.rankPanel.visible = false;
    }

    private initGame():void{

        this.game = new Game();

        this.addChild(this.game);

        this.game.visible = false;
    }

    private challengeBtClick(e:egret.TouchEvent):void{

        let self:Main = this;

        self.mainPanel.visible = false;

        self.game.visible = true;

        if(Main.isWeixin){

            let scoreStr:string = KVDataTools.getValue(WeixinData.userInfo.KVDataList, Main.CHALLENGE_SCORE);

            let score:number;

            if(scoreStr){

                score = Number(scoreStr);
            }
            else{

                score = 0;
            }

            let moneyStr:string = KVDataTools.getValue(WeixinData.userInfo.KVDataList, Main.MONEY);

            let money:number;

            if(moneyStr){

                money = Number(moneyStr);
            }
            else{

                money = 0;
            }

            let stageIndex:number;

            if(!score){

                score = 0;

                stageIndex = 1;
            }
            else if(score < Main.config.stageConfig.length - 1){

                stageIndex = score + 1;
            }
            else{

                stageIndex = Main.config.stageConfig.length - 1;
            }

            let stageConfig:StageConfig = Main.config.stageConfig[stageIndex]

            let cb:(_score:number, _money:number)=>void = function(_score:number, _money:number):void{

                console.log("challenge game over score:" + _score + "  money:" + _money);

                self.game.visible = false;

                let kv:KVData[] = [];

                if(_score == stageConfig.maxLevel && stageIndex > score){

                    kv.push({key:Main.CHALLENGE_SCORE, value: stageIndex.toString()})
                }

                if(_money > 0){

                    kv.push({key:Main.MONEY, value:(money + _money).toString()});
                }

                if(kv.length > 0){

                    self.setUserData(kv);
                }
                else{

                    self.mainPanel.visible = true;
                }
            };

            self.game.start(stageConfig, cb);
        }
        else{

            let stageConfig:StageConfig = Main.config.stageConfig[1];

            self.game.start(stageConfig, this.gameOver.bind(this));
        }
    }

    private endlessBtClick(e:egret.TouchEvent):void{

        let self:Main = this;

        self.mainPanel.visible = false;

        self.game.visible = true;

        if(Main.isWeixin){

            let scoreStr:string = KVDataTools.getValue(WeixinData.userInfo.KVDataList, Main.ENDLESS_SCORE);

            let score:number;

            if(scoreStr){

                score = Number(scoreStr);
            }
            else{

                score = 0;
            }

            let moneyStr:string = KVDataTools.getValue(WeixinData.userInfo.KVDataList, Main.MONEY);

            let money:number;

            if(moneyStr){

                money = Number(moneyStr);
            }
            else{

                money = 0;
            }

            let cb:(_score:number, _money:number)=>void = function(_score:number, _money:number):void{

                console.log("endless game over score:" + _score + "  money:" + _money);

                self.game.visible = false;

                let kv:KVData[] = [];

                if(_score > score){

                    kv.push({key:Main.ENDLESS_SCORE, value:_score.toString()});
                }

                if(_money > 0){

                    kv.push({key:Main.MONEY, value:(money + _money).toString()});
                }

                if(kv.length > 0){

                    self.setUserData(kv);
                }
                else{

                    self.mainPanel.visible = true;
                }
            };

            self.game.start(Main.config.stageConfig[0], cb);
        }
        else{

            self.game.start(Main.config.stageConfig[0], this.gameOver.bind(this));
        }
    }
    
    private async setUserData(_kv:KVData[]):Promise<void>{

        await WeixinData.setUserData(_kv);

        this.refreshMainPanel();

        this.mainPanel.visible = true;
    }

    private gameOver(_score:number, _money:number):void{

        this.game.visible = false;

        this.mainPanel.visible = true;
    }
}
