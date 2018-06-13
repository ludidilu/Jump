//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    private circle:egret.Shape;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        console.log("openDataContext onAddToStage");

        wx.onMessage(this.getMessage.bind(this));
    }

    private getMessage(_data:any):void{

        console.log("openDataContext getMessage");

        for(let key in _data){

            console.log("key:" + key + "   value:" + _data[key]);
        }



        this.circle = new egret.Shape();

        this.circle.graphics.beginFill(0xff0000);

        this.circle.graphics.drawCircle(0,0,100);

        this.circle.graphics.endFill();

        this.addChild(this.circle);

        this.circle.x = 300;

        this.circle.y = 300;

        egret.startTick(this.tick, this);

        let keyList:string[] = ["score","zxasd12"];

        let param = {keyList:keyList, success:this.getUserCloudStorageSuccess.bind(this), fail:this.getUserCloudStorageFail.bind(this), complete:this.getUserCloudStorageComplete.bind(this)};

        wx.getUserCloudStorage(param);

        param = {keyList:keyList, success:this.getFriendCloudStorageSuccess.bind(this), fail:this.getFriendCloudStorageFail.bind(this), complete:this.getFriendCloudStorageComplete.bind(this)};

        wx.getFriendCloudStorage(param);
    }

    private getUserCloudStorageSuccess(data:{KVDataList:{key:string,value:string}[]}):void{
        console.log("getUserCloudStorage success");

        for(let i:number = 0 ; i < data.KVDataList.length ; i++){
            console.log("key:" + data.KVDataList[i].key + "   value:" + data.KVDataList[i].value);
        }
    }

    private getUserCloudStorageFail():void{    
        console.log("getUserCloudStorage fail");
    }

    private getUserCloudStorageComplete():void{
        console.log("getUserCloudStorage complete");
    }

    private getFriendCloudStorageSuccess(data:{avatarUrl:string, nickname:string, openid:string, KVDataList:{key:string, value:string}[]}[]):void{
        console.log("getFriendCloudStorage success");

        for(let i:number = 0 ; i < data.length ; i++){
            console.log("avatarUrl:" + data[i].avatarUrl + "  nickname:" + data[i].nickname);
        }
    }

    private getFriendCloudStorageFail():void{    
        console.log("getFriendCloudStorage fail");
    }

    private getFriendCloudStorageComplete():void{
        console.log("getFriendCloudStorage complete");
    }

    private tick(dt:number):boolean{

        this.circle.x += 0.1;

        return false;
    }
}