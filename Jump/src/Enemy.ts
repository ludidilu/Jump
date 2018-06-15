class Enemy extends Human{

    private static pool:Enemy[] = [];

    public static enemies:Enemy[] = [];

    public updateDisplaysPosition(_dt:number):void{

        super.updateDisplaysPosition(_dt);

        if(Math.random() < Main.config.enemyJumpProbability * _dt * 0.001){

            let result:HumanJumpResult = this.checkCanJump();

            if(result == HumanJumpResult.LADDER || result == HumanJumpResult.HUMAN){

                this.jump(Main.config.jumpAngle, Main.config.jumpForce, Main.config.jumpPoint);
            }
            else if(result == HumanJumpResult.LINE){

                this.jump(Main.config.lineJumpAngle, Main.config.lineJumpForce, Main.config.lineJumpPoint);
            }
        }
    }

    public static create(_world:p2.World, _length:number, _radius:number, _container:egret.DisplayObjectContainer, _mat:p2.Material, _pos:number[]):Enemy{

        let enemy:Enemy;

        if(Enemy.pool.length == 0){

            enemy = new Enemy({ mass: 1, damping :Main.config.humanDampling, angularDampling:Main.config.humanAngularDampling });

            Human.initHuman(true, enemy, _world, _length, _radius, _container, _mat, 0x0000ff, _pos);
        }
        else{

            enemy = Enemy.pool.pop();

            enemy.position[0] = _pos[0];

            enemy.position[1] = _pos[1];

            _container.addChild(enemy.displays[0]);

            _world.addBody(enemy);

            enemy.updateDisplaysPosition(0);

            Human.humanArr.push(enemy);
        }

        this.enemies.push(enemy);

        return enemy;
    }

    private static release(_enemy:Enemy):void{

        _enemy.reset();

        _enemy.world.removeBody(_enemy);

        let display:egret.DisplayObject = _enemy.displays[0];

        display.parent.removeChild(display);

        Human.humanArr.splice(Human.humanArr.indexOf(_enemy), 1);

        this.pool.push(_enemy);
    }

    public static update(_dt:number):void{

        for(let i:number = this.enemies.length - 1; i > -1 ; i--){

            let enemy:Enemy = this.enemies[i];

            enemy.updateDisplaysPosition(_dt);

            let enemyDisplay:egret.DisplayObject = enemy.displays[0];

            let p:egret.Point = enemyDisplay.parent.parent.localToGlobal(enemyDisplay.x, enemyDisplay.y);

            if(p.y > enemyDisplay.stage.stageHeight){

                this.release(enemy);

                this.enemies.splice(i,1);
            }
        }
    }

    public static reset():void{

        for(let i:number = 0, n:number = this.enemies.length; i < n ; i++){

            let enemy:Enemy = this.enemies[i];

            this.release(enemy);
        }

        this.enemies.length = 0;
    }
}