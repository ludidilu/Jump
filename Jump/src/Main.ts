class Main extends egret.DisplayObjectContainer {

    public static config:Config;

    public static isWeixin:boolean;

    private game:Game;

    private mainPanel:MainPanel;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event):void {

        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

        console.log("version:" + 32200);

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

    private start():void{

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

            WeixinData.init();
        }

        this.initGame();

        this.initMainPanel();
    }

    private initMainPanel():void{

        this.mainPanel = new MainPanel();

        this.addChild(this.mainPanel);

        this.mainPanel.challengeBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.challengeBtClick, this);

        this.mainPanel.endlessBt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.endlessBtClick, this);
    }

    private initGame():void{

        this.game = new Game();

        this.addChild(this.game);

        this.game.visible = false;
    }

    private challengeBtClick(e:egret.TouchEvent):void{

        this.game.visible = true;

        this.game.start(Main.config.stageConfig[1], this.gameOver.bind(this));

        this.mainPanel.visible = false;
    }

    private endlessBtClick(e:egret.TouchEvent):void{

        this.game.visible = true;

        this.game.start(Main.config.stageConfig[0], this.gameOver.bind(this));

        this.mainPanel.visible = false;
    }

    private gameOver(_score:number, _money:number):void{

        this.game.visible = false;

        this.mainPanel.visible = true;
    }
}
