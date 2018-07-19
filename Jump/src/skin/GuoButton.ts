class GuoButton extends eui.Button implements  eui.UIComponent {

    protected childrenCreated():void{

        super.childrenCreated();

        let data = RES.getRes("guo_json");
        let txtr:egret.Texture = RES.getRes("guo_png");
        let mcFactory:egret.MovieClipDataFactory = new egret.MovieClipDataFactory( data, txtr );

        let mc:egret.MovieClip = new egret.MovieClip(mcFactory.generateMovieClipData("guo"));

        this.addChild(mc);

		mc.y = -140;

        mc.play(-1);
    }
}