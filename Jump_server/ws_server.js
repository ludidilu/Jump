let messageTag = ["tag_join","tag_command","tag_getLag"];

let lagTest = true;

let lagMin = 20;

let lagMax = 80;

let lagList = [];

let isLagRunning = false;

let uid = 1;

let roomId = 1;

let playerDic = {};

let roomDic = {};

setInterval(update, 16);

const ws = require("ws");

const WebSocketServer = ws.Server;

let wsServer = new WebSocketServer({port:1999});

wsServer.on("connection", connection);

function connection(client){
	
	client.clientUid = uid;

	playerDic[uid] = client;

	sendData(client, "connectOver", uid);
	
	console.log("one user connection:" + uid);
	
	let disconnectDele = function(){

		disconnect(client);
	};
	
	client.on("close", disconnectDele);
	
	uid++;
	
	let delegate = function(_str){
		
		let obj = JSON.parse(_str);
		
		let tag = obj.tag;
		
		let data = obj.data;
		
		getData(client, tag, data);
	};
	
	client.on("message", delegate);
}

function disconnect(client){

	if(playerDic[client.clientUid]){

		if(client.roomUid){
			
			let room = roomDic[client.roomUid];

			if(room){
				
				let index = room.player.indexOf(client.clientUid);
				
				if(index != -1){
					
					room.player.splice(index, 1);

					if(room.player.length == 0){
		
						console.log("remove room:" + room.uid);
		
						delete roomDic[room.uid];
					}
				}
			}
		}

		console.log("remove player:" + client.clientUid);

		delete playerDic[client.clientUid];
	}
}

function getData(client, tag, data){

	if(!lagTest){

		getDataReal(client, tag, data);
	}
	else{

		let runTime = new Date().getTime() + lagMin + Math.random() * (lagMax - lagMin);

		let dele = function(){

			getDataReal(client, tag, data);
		}

		addLagTest(dele, runTime);
	}
}

function getDataReal(client, tag, data){

	if(tag == "tag_join"){
		
		console.log("user join:" + client.clientUid);

		let roomUid;

		let roomOid;

		if(data.roomUid == 0){

			roomUid = "room" + roomId;

			roomOid = roomId;

			roomId++;
		}
		else{

			roomUid = "room" + data.roomUid;

			roomOid = data.roomUid;
		}
		
		let room;

		if(roomDic[roomUid]){

			room = roomDic[roomUid];

			if(room.index != -1){

				return;
			}
		}
		else{

			room = {uid:roomUid, player:[], index:-1, command:[], playerNum:data.playerNum, sync:[]};

			roomDic[roomUid] = room;
		}
		
		client.roomUid = roomUid;

		room.player.push(client.clientUid);

		room.sync.push({});

		sendDataToRoom(room, "tag_refresh", {arr:room.player, roomUid:roomOid});

		if(room.player.length == room.playerNum){

			room.index = 0;

			sendDataToRoom(room, "tag_start");
		}
	}
	else if(tag == "tag_command"){

		let room = roomDic[client.roomUid];

		if(room && room.command.indexOf(client.clientUid) == -1){

			room.command.push(client.clientUid);
		}
	}
	else if(tag == "tag_getLag"){

		sendData(client, "tag_getLag", data);
	}
	else if(tag == "tag_check_sync"){

		let room = roomDic[client.roomUid];

		if(room){

			let index = room.player.indexOf(client.clientUid);

			if(index != -1){

				room.sync[index][data.index] = data.obj;

				for(let i = 0 ; i < room.sync.length ; i++){

					if(i != index){

						let dd = room.sync[i];

						if(dd[data.index]){

							let ddd = dd[data.index];

							for(let key in ddd){

								if(ddd[key].x != data.obj[key].x || ddd[key].y != data.obj[key].y || ddd[key].forceX != data.obj[key].forceX || ddd[key].forceY != data.obj[key].forceY){

									throw "sync error    index:" + data.index + "  uid:" + key + "   x:" + ddd[key].x + "," + data.obj[key].x + "   y:" + ddd[key].y + "," + data.obj[key].y + "   forceX:" + ddd[key].forceX + "," + data.obj[key].forceX + "   forceY:" + ddd[key].forceY + "," + data.obj[key].forceY;
								}
							}

							//for(let key in ddd){

								//console.log("sync ok    index:" + data.index + "  uid:" + key + "   x:" + ddd[key].x + "   y:" + ddd[key].y);
							//}
						}
					}
				}
			}
		}
	}
}

function update(){

	for(let key in roomDic){

		let room = roomDic[key];

		if(room.index > -1){

			let arr = [];

			for(let i = 0 ; i < room.command.length ; i++){

				arr.push(room.command[i]);
			}

			//let command = {index:room.index, arr:room.command};

			let command = {index:room.index, arr:arr};

			sendDataToRoom(room, "tag_command", command);

			room.command.length = 0;

			room.index++;
		}
	}
}

function sendDataToRoom(room, tag, data){
	
	for(let key in room.player){
		
		let client = playerDic[room.player[key]];
		
		sendData(client, tag, data);
	}
}

function sendData(client, tag, data){

	if(!lagTest){
		
		sendDataReal(client, tag, data);
	}
	else{
		
		let runTime = new Date().getTime() + lagMin + Math.random() * (lagMax - lagMin);

		let dele = function(){

			sendDataReal(client, tag, data);
		}

		addLagTest(dele, runTime);
	}
}

function sendDataReal(client, tag, data){
	
	if(client.readyState === ws.OPEN){
			
		client.send(JSON.stringify({tag:tag, data:data}));
		
	}else{
		
		disconnect(client);
	}
}

function addLagTest(dele, runTime){

	lagList.push({dele:dele, runTime:runTime});

	if(!isLagRunning && lagList.length == 1){

		setTimeout(lagRun, runTime - (new Date().getTime()));
	}
}

function lagRun(){

	isLagRunning = true;

	let nowTime = new Date().getTime();

	let obj = lagList.shift();

	obj.dele();

	while(lagList.length > 0){

		obj = lagList[0];

		let gap = obj.runTime - nowTime;

		if(gap <= 0){

			lagList.shift();

			obj.dele();
		}
		else{

			setTimeout(lagRun, gap);

			break;
		}
	}

	isLagRunning = false;
}
