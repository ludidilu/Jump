class SuperEvent{

    private static dic:{[key:string]:{target:any, cb:Function}[]} = {};

    public static addEventListener(_event:string, _cb:Function, _target:any):void{

        let obj:{target:any, cb:Function} = {target:_target, cb:_cb};

        let arr:{target:any, cb:Function}[] = this.dic[_event];

        if(!arr){

            arr = [];

            this.dic[_event] = arr;
        }

        arr.push(obj);
    }

    public static removeEventListener(_event:string, _cb:Function, _target:any):void{

        let arr:{target:any, cb:Function}[] = this.dic[_event];

        if(arr){

            for(let i:number = arr.length - 1 ; i > -1 ; i--){

                let obj:{target:any, cb:Function} = arr[i];

                if(obj.cb == _cb && obj.target == _target){

                    arr.splice(i, 1);

                    if(arr.length == 0){

                        delete this.dic[_event];
                    }

                    break;
                }
            }
        }
    }

    public static dispatchEvent(_event:string, ...arg):void{

        let arr:{target:any, cb:Function}[] = this.dic[_event];

        if(arr){

            let tmpArr:{target:any, cb:Function}[] = [];

            for(let i:number = 0 ; i < arr.length ; i++){

                tmpArr.push(arr[i]);
            }

            for(let i:number = 0 ; i < tmpArr.length ; i++){

                let obj:{target:any, cb:Function} = tmpArr[i];

                if(arr.indexOf(obj) != -1){

                    obj.cb.apply(obj.target, arg);
                }
            }
        }
    }
}