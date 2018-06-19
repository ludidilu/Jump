class Config{

    public heightAddSpeed:number = 0.625;

    public physicalTimeFix:number = 1.3;

    public worldTimeFix:number = 1;

    public factor:number = 80;

    public unitHeight:number = 2.4;

    public unitWidth:number = 2;

    public triangleWidth:number = 0.3;

    public triangleHeight:number = 0.4;

    public unitNum:number = 20;

    public changeUnitNum:number = 5;

    public humanLength:number = 0.7;

    public humanRadius:number = 0.3;

    public jumpAngle:number = Math.PI * 0.25 + 0.15;

    public jumpForce:number[] = [80,145];

    public jumpPoint:number[] = [0,0];

    public jumpDisableTime:number = 300;

    public friction:number = 0;

    public relaxation:number = 10;

    public restitution:number = 0;

    public humanDampling:number = 0.1;

    public humanAngularDampling:number = 0.1;

    public humanGravityScale:number = 1;

    public humanSleepXFix:number = -0.5;

    public enemyJumpProbability:number = 1;

    public enemyPropProbability:number = 0.2;

    public propHeightFix:number = 10;

    public maxEnemyNum:number = 2;

    public cameraFollowSpeedFix:number = 0.02;

    public firstCameraFollowTime:number = 1000;

    public fps:number = 60;

    public humanStartPos:number[] = [100,100];

    public firstJumpAngle:number = Math.PI * 0.25 + 0.15;

    public firstJumpForce:number[] = [100, 100];

    public firstJumpPoint:number[] = [0,0];

    public lineWidth:number = 0.5;

    public lineJumpAngle:number = 1;

    public lineJumpForce:number[] = [400,600];

    public lineJumpPoint:number[] = [0,0];

    public linePropProbability:number = 0.2;

    public maxLineNum:number = 1;

    public coinPropProbability:number = 0.3;

    public maxCoinNum:number = 3;

    public coinRadius:number = 0.3;

    public coinForce:number[] = [-100,0];

    public coinFriction:number = 0;

    public coinRelaxation:number = 100;

    public coinRestitution:number = 0.8;

    public coinDampling:number = 0.1;

    public coinAngularDampling:number = 0.1;

    public coinGravityScale:number = 1;

    public coinMoveToHumanSpeed:number = 8;

    public coinMoveToHumanAngularSpeed:number = 0.2;

    public coinMoveToHumanRadius:number = 5;

    public gravity:number[] = [0, -9.78];

    public humanFixForce:number[] = [0,-0.3];

    public humanFixForcePoint:number[] = [0.35,0];

    public solverIterations:number = 1;

    public itemRadius:number = 0.5;

    public itemForce:number[] = [-100,0];

    public itemFriction:number = 0;

    public itemRelaxation:number = 100;

    public itemRestitution:number = 0.8;

    public itemDampling:number = 0.1;

    public itemAngularDampling:number = 0.1;

    public itemGravityScale:number = 1;

    public humanBigSize:number = 2;

    public humanBigMassFix:number = 2;

    public humanBigJumpForceFix:number = 2;

    public humanFeatherMassFix:number = 0.5;

    public humanFeatherJumpForceFix:number = 0.5;

    public humanSlowFix:number = 0.5;
}