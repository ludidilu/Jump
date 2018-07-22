class MoneyShow{

    private container:egret.DisplayObjectContainer;

    private particle:particle.GravityParticleSystem;

    private showState:number = -1;

    public init(_container:egret.DisplayObjectContainer):void{

        this.container = _container;

        let texture:egret.Texture = RES.getRes("game_json.dollar");

        let config = RES.getRes("particle_json");

        this.particle = new particle.GravityParticleSystem(texture, config);

        this.particle.emissionRate = 0.001;

        this.particle.x = 0;

        this.particle.y = _container.stage.stageHeight;
    }

    public start():void{

        if(this.showState != -1){

            return;
        }

        this.showState = 0;

        egret.startTick(this.update, this);
        
        this.container.addChild(this.particle);

        this.particle.start(1);
    }

    private update(_dt:number):boolean{

        if(this.showState == 0 && this.particle.numParticles != 0){

            this.showState = 1;
        }
        else if(this.showState == 1 && this.particle.numParticles == 0){

            this.showState = -1;

            egret.stopTick(this.update, this);

            this.container.removeChild(this.particle);

            this.particle.stop(true);
        }

        return false;
    }
}