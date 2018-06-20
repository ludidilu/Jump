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

            case "getUserCloudStorage":

            let keyList:string[] = _data.data;

            let param = {keyList:keyList, success:this.getUserCloudStorageSuccess.bind(this), fail:this.getUserCloudStorageFail.bind(this), complete:this.getUserCloudStorageComplete.bind(this)};

            wx.getUserCloudStorage(param);

            break;

            case "getFriendCloudStorage":

            keyList = _data.data;

            param = {keyList:keyList, success:this.getFriendCloudStorageSuccess.bind(this), fail:this.getFriendCloudStorageFail.bind(this), complete:this.getFriendCloudStorageComplete.bind(this)};

            wx.getFriendCloudStorage(param);

            break;

            default:

            if(this.container){

                throw new Error("duplicate talk!");
            }
        }

        // let keyList:string[] = ["score","zxasd12"];

        // let param = {keyList:keyList, success:this.getUserCloudStorageSuccess.bind(this), fail:this.getUserCloudStorageFail.bind(this), complete:this.getUserCloudStorageComplete.bind(this)};

        // wx.getUserCloudStorage(param);

        // param = {keyList:keyList, success:this.getFriendCloudStorageSuccess.bind(this), fail:this.getFriendCloudStorageFail.bind(this), complete:this.getFriendCloudStorageComplete.bind(this)};

        // wx.getFriendCloudStorage(param);
    }

    private getUserCloudStorageSuccess(data:{errMsg:string,KVDataList:{key:string,value:string}[]}):void{

        let str:string = JSON.stringify(data);

        console.log("openDataContext getUserCloudStorage success");

        for(let i:number = 0 ; i < data.KVDataList.length ; i++){
            console.log("key:" + data.KVDataList[i].key + "   value:" + data.KVDataList[i].value);
        }

        this.container = StringTool.stringToObj(str, this.stage.stageWidth);

        this.addChild(this.container);
    }

    private getUserCloudStorageFail():void{    
        console.log("openDataContext getUserCloudStorage fail");
    }

    private getUserCloudStorageComplete():void{
        console.log("openDataContext getUserCloudStorage complete");
    }

    private getFriendCloudStorageSuccess(data:{errMsg:string,data:{avatarUrl:string, nickname:string, openid:string, KVDataList:{key:string, value:string}[]}[]}):void{

        let str:string = JSON.stringify(data);

        console.log("openDataContext getFriendCloudStorage success    stringLength:" + str.length);

        for(let i:number = 0 ; i < data.data.length ; i++){
            console.log("avatarUrl:" + data.data[i].avatarUrl + "  nickname:" + data.data[i].nickname);
        }

        this.container = StringTool.stringToObj(str, this.stage.stageWidth);

        this.addChild(this.container);
    }

    private getFriendCloudStorageFail():void{    
        console.log("getFriendCloudStorage fail");
    }

    private getFriendCloudStorageComplete():void{
        console.log("getFriendCloudStorage complete");
    }
}