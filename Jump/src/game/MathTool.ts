class MathTool{

    public static checkCircleContactWithLine(_x0:number, _y0:number, _x1:number, _y1:number, _x2:number, _y2:number):number{

        let px:number = _x1 - _x0;

        let py:number = _y1 - _y0;

        let sum:number = px * px + py * py;

        let u:number = ((_x2 - _x0) * px + (_y2 - _y0) * py) / sum;

        if(u > 1){

            u = 1;
        }
        else if(u < 0){

            u = 0;
        }

        let x:number = _x0 + u * px;

        let y:number = _y0 + u * py;

        let dx:number = x - _x2;

        let dy:number = y - _y2;

        return Math.sqrt(dx * dx + dy * dy);
    }
}