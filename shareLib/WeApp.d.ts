declare class getUserInfoParam{
    public withCredentials:boolean;
    public lang:string;
    public timeout:number;
    public success:(_param:getUserInfoSuccess)=>void;
    public fail:()=>void;
    public complete:()=>void;
}

declare class getUserInfoSuccess{
    public userInfo:getUserInfo;
    public rawData:string;
    public signature:string;
    public encryptedData:string;
    public iv:string;
}

declare class getUserInfo{
    public nickName:string;
    public avatarUrl:string;
    public gender:string;
    public city:string;
    public province:string;
    public country:string;
    public language:string;
}

declare class ContextAttributes{

    public antialias:boolean;
    public preserveDrawingBuffer:boolean;
    public antialiasSamples:number;
}

declare interface Canvas{

    getContext(contextType: string, contextAttributes: ContextAttributes): RenderingContext;
}

declare interface RenderingContext {}

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

    public static getUserInfo(_param:getUserInfoParam):void;
    public static getOpenDataContext():OpenDataContext;
    public static onMessage(callback: (data:any)=>void): void;
    public static createCanvas():Canvas;
    public static getSharedCanvas(): Canvas;
    public static setUserCloudStorage(object: {KVDataList:{key:string,value:string}[],success:(res:any)=>void,fail:(res:any)=>void,complete:(res:any)=>void}):void;
    public static getUserCloudStorage(object: {keyList:string[],success:(res:{KVDataList:{key:string,value:string}[]})=>void,fail:(res:any)=>void,complete:(res:any)=>void}):void;
    public static getFriendCloudStorage(object: {keyList:string[],success:(res:{avatarUrl:string, nickname:string, openid:string, KVDataList:{key:string, value:string}[]}[])=>void,fail:(res:any)=>void,complete:(res:any)=>void}): void;
}
