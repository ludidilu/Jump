class Human extends BodyObj{

    public static humanSleepXFix:number;

    private tick:number;

    private jumpAngle:number;

    private jumpForce:number[];

    public updateDisplaysPosition():void{

        if(this.sleepState == p2.Body.SLEEPY || this.sleepState == p2.Body.SLEEPING){

            this.position = [this.position[0] + Human.humanSleepXFix, this.position[1]];

            this.sleepState = p2.Body.AWAKE;
        }

        super.updateDisplaysPosition();
    }

    public jump(_jumpAngle:number, _jumpForce:number[], _jumpTick:number):void{

        this.angle = _jumpAngle;

        this.jumpAngle = _jumpAngle;

        this.jumpForce = _jumpForce;

        this.tick = _jumpTick;

        this.angularVelocity = 0;

        egret.Ticker.getInstance().register(this.jumpReal, this);
    }

    private jumpReal(_dt:number):void{

        if(this.tick > 0){

            this.tick--;

            this.applyForce(this.jumpForce,[0,0]);
        }
        else{

            egret.Ticker.getInstance().unregister(this.jumpReal, this);
        }
    }
}