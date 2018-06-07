class Enemy extends Human{

    public static jumpAngle:number;

    public static jumpForce:number[];

    public static jumpForceTick:number;

    public static jumpProbability:number;

    public updateDisplaysPosition(_dt:number):void{

        super.updateDisplaysPosition(_dt);

        if(Math.random() < Enemy.jumpProbability * _dt * 0.001){

            if(this.checkCanJump()){

                this.jump(Enemy.jumpAngle, Enemy.jumpForce, Enemy.jumpForceTick);
            }
        }
    }

    public static create(_world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material):Enemy{
        
        let enemy:Enemy = new Enemy({ mass: 1 });

        Human.initHuman(enemy, _world, _length, _radius, _container, _mat, 0x0000ff);

        return enemy;
    }
}