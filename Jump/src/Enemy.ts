class Enemy extends Human{

    public static jumpAngle:number;

    public static jumpForce:number[];

    public static jumpProbability:number;

    private static pool:Enemy[] = [];

    public updateDisplaysPosition(_dt:number):void{

        super.updateDisplaysPosition(_dt);

        if(Math.random() < Enemy.jumpProbability * _dt * 0.001){

            if(this.checkCanJump()){

                this.jump(Enemy.jumpAngle, Enemy.jumpForce);
            }
        }
    }

    public static create(_world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _pos:number[]):Enemy{

        let enemy:Enemy;

        if(Enemy.pool.length == 0){

            enemy = new Enemy({ mass: 1 });

            Human.initHuman(enemy, _world, _length, _radius, _container, _mat, 0x0000ff, _pos);
        }
        else{

            enemy = Enemy.pool.pop();

            enemy.position = [_pos[0], _pos[1]];

            _container.addChild(enemy.displays[0]);

            _world.addBody(enemy);

            enemy.updateDisplaysPosition(0);

            Human.humanArr.push(enemy);
        }

        return enemy;
    }

    public static release(_enemy:Enemy):void{

        _enemy.world.removeBody(_enemy);

        let display:egret.DisplayObject = _enemy.displays[0];

        display.parent.removeChild(display);

        Human.humanArr.splice(Human.humanArr.indexOf(_enemy), 1);

        Enemy.pool.push(_enemy);
    }
}