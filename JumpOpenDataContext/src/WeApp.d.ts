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

declare interface OpenDataContext {
    /**
     * 向开放数据域发送消息
     */
    postMessage(message: {}): void;
}

declare class wx{
    public static onHide(param:()=>void):void;
    public static onShow(param:()=>void):void;

    public static getUserInfo(_param:getUserInfoParam);
    public static getOpenDataContext():OpenDataContext;
    public static onMessage(callback: (data:any)=>void): void;
}