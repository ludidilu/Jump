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

    private container:egret.DisplayObjectContainer;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        console.log("openDataContext onAddToStage");

        wx.onMessage(this.getMessage.bind(this));
    }

    private getMessage(_data:any):void{

        let str:string = _data.command;

        switch(str){

            case "talkOver":

            if(this.container){

                this.removeChild(this.container);

                this.container = null;
            }

            break;

            case "getUserInfo":

            let openIdList:string[] = _data.data;

            let getUserInfoParam = {openIdList:openIdList, lang:"zh_CN", success:this.getUserInfoSuccess.bind(this), fail:this.callApiFail.bind(this), complete:this.callApiComplete.bind(this)};

            wx.getUserInfo(getUserInfoParam);

            break;

            case "getUserCloudStorage":

            let keyList:string[] = _data.data;

            let getUserCloudStorageParam = {keyList:keyList, success:this.getUserCloudStorageSuccess.bind(this), fail:this.callApiFail.bind(this), complete:this.callApiComplete.bind(this)};

            wx.getUserCloudStorage(getUserCloudStorageParam);

            break;

            case "getFriendCloudStorage":

            keyList = _data.data;

            let getFriendCloudStorageParam = {keyList:keyList, success:this.getFriendCloudStorageSuccess.bind(this), fail:this.callApiFail.bind(this), complete:this.callApiComplete.bind(this)};

            wx.getFriendCloudStorage(getFriendCloudStorageParam);

            break;

            default:

            if(this.container){

                throw new Error("duplicate talk!");
            }
        }
    }

    private callBackData(obj:any):void{

        let str:string = JSON.stringify(obj);

        this.container = StringTool.stringToObj(str, this.stage.stageWidth);

        this.addChild(this.container);
    }

    private getUserInfoSuccess(data:{data:userInfo[]}):void{

        console.log("getUserInfoSuccess:" + data);

        this.callBackData(data);
    }

    private callApiFail(obj:any):void{

        console.log("callApiFail");
        
        for(let key in obj){

            console.log("key:" + key + "  value:" + obj[key]);
        }
    }

    private callApiComplete(obj:any):void{

        console.log("getUserInfoComplete");

        for(let key in obj){

            console.log("key:" + key + "  value:" + obj[key]);
        }
    }

    private getUserCloudStorageSuccess(data:{KVDataList:KVData[]}):void{

        this.callBackData(data);
    }

    private getFriendCloudStorageSuccess(data:{data:userGameData[]}):void{

        this.callBackData(data);
    }
}