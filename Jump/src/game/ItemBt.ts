enum ItemBtState{

    FREE,
    CAN_USE,
    IN_USE
}

class ItemBt extends egret.DisplayObjectContainer{

    private tf:egret.TextField;

    private maskSp:egret.Shape;

    private timeLeft:number;

    public effect:ItemEffect;

    public btState:ItemBtState = ItemBtState.FREE;

    constructor() {

        super();


        let bg:egret.Shape = new egret.Shape();

        bg.graphics.beginFill(0x00ffff);

        bg.graphics.drawCircle(0, 0, 50);

        bg.graphics.endFill();

        this.addChild(bg);


        this.maskSp = new egret.Shape();

        this.maskSp.graphics.beginFill(0x000000);

        this.maskSp.graphics.drawRect(-50, -50, 100, 100);

        this.maskSp.graphics.endFill();

        this.maskSp.anchorOffsetY = 50;

        this.maskSp.y = 50;

        this.addChild(this.maskSp);

        
        let sp:egret.Shape = new egret.Shape();

        sp.graphics.beginFill(0xff00ff);

        sp.graphics.drawCircle(0, 0, 50);

        sp.graphics.endFill();

        sp.mask = this.maskSp;

        this.addChild(sp);



        this.tf = new egret.TextField();

        this.tf.x = -50;

        this.tf.y = -50;

        this.tf.width = 100;

        this.tf.height = 100;

        this.tf.textAlign = egret.HorizontalAlign.CENTER;

        this.tf.verticalAlign = egret.VerticalAlign.MIDDLE;

        this.tf.size = 60;

        this.tf.bold = true;

        this.tf.text = "B";

        this.addChild(this.tf);

        this.touchChildren = false;

        this.visible = false;

        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.click, this);
    }

    private click(e: egret.TouchEvent):void{

        this.touchEnabled = false;

        this.btState = ItemBtState.IN_USE;

        this.timeLeft = Main.config.gameConfig.itemEffectTime;

        this.tf.textColor = 0x000000;

        this.setEffect(true);
    }


    private setPercent(_p:number):void{

        this.maskSp.scaleY = _p;
    }

    public reset():void{

        if(this.btState == ItemBtState.CAN_USE){

            this.touchEnabled = false;

            this.visible = false;

            SuperTicker.getInstance().removeEventListener(this.update, this);

            this.btState = ItemBtState.FREE;
        }
        else if(this.btState == ItemBtState.IN_USE){

            this.visible = false;

            SuperTicker.getInstance().removeEventListener(this.update, this);

            this.btState = ItemBtState.FREE;

            this.setEffect(false);
        }
    }

    public show(_effect:ItemEffect):void{

        if(this.btState != ItemBtState.IN_USE){

            this.effect = _effect;

            switch(this.effect){

                case ItemEffect.BIG:

                this.tf.text = "B";

                break;

                case ItemEffect.DOUBLE:

                this.tf.text = "D";

                break;

                case ItemEffect.FEATHER:

                this.tf.text = "F";

                break;

                case ItemEffect.MAGNET:

                this.tf.text = "M";

                break;

                case ItemEffect.SLOW:

                this.tf.text = "S";

                break;
            }

            if(this.btState == ItemBtState.FREE){

                this.tf.textColor = 0xffffff;

                SuperTicker.getInstance().addEventListener(this.update, this);

                this.btState = ItemBtState.CAN_USE;

                this.touchEnabled = true;

                this.visible = true;
            }
            
            this.timeLeft = Main.config.gameConfig.itemBtTime;
        }
    }

    private setEffect(_b:boolean):void{

        switch(this.effect){

            case ItemEffect.BIG:

            Human.human.setBig(_b);

            break;

            case ItemEffect.DOUBLE:

            Human.human.setDouble(_b);

            break;

            case ItemEffect.FEATHER:

            Human.human.setFeather(_b);

            break;

            case ItemEffect.MAGNET:

            Human.human.setMagnet(_b);

            break;

            case ItemEffect.SLOW:

            Human.human.setSlow(_b);

            break;
        }
    }

    private update(_dt:number):void{

        this.timeLeft -= _dt;

        if(this.timeLeft < 0){

            SuperTicker.getInstance().removeEventListener(this.update, this);

            this.visible = false;

            if(this.btState == ItemBtState.IN_USE){

                this.setEffect(false);
            }
            else{

                this.touchEnabled = false;
            }

            this.btState = ItemBtState.FREE;
        }
        else{

            if(this.btState == ItemBtState.CAN_USE){

                this.setPercent(this.timeLeft / Main.config.gameConfig.itemBtTime);
            }
            else{

                this.setPercent(this.timeLeft / Main.config.gameConfig.itemEffectTime);
            }
        }
    }
}