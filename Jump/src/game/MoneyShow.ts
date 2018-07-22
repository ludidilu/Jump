class MoneyShow{

    private particle:particle.GravityParticleSystem;

    public init(_container:egret.DisplayObjectContainer):void{

        let texture:egret.Texture = RES.getRes("game_json.dollar");

        let config = RES.getRes("particle_json");

        this.particle = new particle.GravityParticleSystem(texture, config);

        this.particle.emissionRate = 0.001;

        this.particle.x = 0;

        this.particle.y = _container.stage.stageHeight;

        _container.addChild(this.particle);

        SuperTicker.getInstance().addEventListener(this.update, this);
    }

    public start():void{

        this.particle.start(1);
    }

    private update(_dt:number):void{

        if(this.particle.numParticles != 0){

            // SuperTicker.getInstance().removeEventListener(this.update, this);

            // this.particle.stop(true);

            console.log("particle:" + this.particle.numParticles);
        }
    }
}