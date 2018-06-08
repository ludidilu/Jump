class Config{

    public heightAddSpeed:number = 0.625;

    // public heightAddSpeed:number = 0;

    public physicalTimeFix:number = 1.3;

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

    public jumpDisableTime:number = 300;

    public friction:number = 0;

    public relaxation:number = 10;

    public humanSleepXFix:number = -0.5;

    public enemyJumpProbability:number = 1;

    public enemyPropProbability:number = 0.2;

    // public enemyPropProbability:number = 0;

    public enemyPropHeightFix:number = 5;

    public maxEnemyNum:number = 2;

    public cameraFollowSpeedFix:number = 0.02;
}