declare class KVData{

    public key:string;
    public value:string;
}

declare class userGameData{

    public avatarUrl:string;
    public nickname:string;
    public openId:string;
    public KVDataList:KVData[];
}

declare interface Canvas{

    width:number;

    height:number;
}

declare class OpenDataContext {
    /**
     * 向开放数据域发送消息
     */
    public postMessage(message: {}): void;

    public canvas:Canvas;
}

declare class wx{
    public static onHide(param:()=>void):void;
    public static onShow(param:()=>void):void;

    public static getUserInfo(object:{openIdList:string[],lang:string,success:(data:{data:userInfo[]})=>void,fail:(res:any)=>void,complete:(res:any)=>void}):void;
    public static getOpenDataContext():OpenDataContext;
    public static onMessage(callback: (data:any)=>void): void;
    public static createCanvas():Canvas;
    public static getSharedCanvas(): Canvas;
    public static setUserCloudStorage(object: {KVDataList:KVData[],success:(res:any)=>void,fail:(res:any)=>void,complete:(res:any)=>void}):void;
    public static getUserCloudStorage(object: {keyList:string[],success:(res:{KVDataList:KVData[]})=>void,fail:(res:any)=>void,complete:(res:any)=>void}):void;
    public static getFriendCloudStorage(object: {keyList:string[],success:(res:{data:userGameData[]})=>void,fail:(res:any)=>void,complete:(res:any)=>void}): void;
    public static getGroupCloudStorage(object: {shareTicket:string,success:(res:{data:userGameData[]})=>void,fail:(res:any)=>void,complete:(res:any)=>void}):void;

    public static shareAppMessage(object:{title?:string, imageUrl?:string, query?:string}):void;
}
