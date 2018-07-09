let messageTag = ["tag_join","tag_command","tag_getLag"];

let player = [];

let lagTest = false;

let lagMin = 50;

let lagMax = 100;

let lagList = [];

let isLagRunning = false;

let io = require('socket.io')();

io.on('connection', connection);

io.listen(1999);

let uid = 1;

let roomId = 1;

let playerDic = {};

let roomDic = {};

setInterval(update, 16);


function connection(client){

	client.clientUid = uid;

	playerDic[uid] = client;

	sendData(client, "connectOver", uid);
	
	console.log("one user connection:" + uid);

	let disconnect = function(reason){

		if(client.roomUid){
			
			let room = roomDic[client.roomUid];

			room.player.splice(room.player.indexOf(client.clientUid), 1);

			if(room.player.length == 0){

				console.log("remove room:" + room.uid);

				delete roomDic[room.uid];
			}
		}

		console.log("remove player:" + client.clientUid);

		delete playerDic[client.clientUid];
	};

	client.on("disconnect", disconnect);
	
	uid++;

	for(let key in messageTag){

		let tag = messageTag[key];

		let delegate = function(data){

			getData(client, tag, data);
		};

		client.on(tag, delegate);
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

		if(data == 0){

			roomUid = "room" + roomId;

			roomId++;
		}
		else{

			roomUid = "room" + data;
		}
		
		client.join(roomUid);
		
		client.roomUid = roomUid;

		let room;

		if(roomDic[roomUid]){

			room = roomDic[roomUid];
		}
		else{

			room = {uid:roomUid, player:[], index:-1, command:[]};

			roomDic[roomUid] = room;
		}

		room.player.push(client.clientUid);

		console.log("roomUid:" + roomUid);

		sendDataToRoom(roomUid, "tag_refresh", {arr:room.player});

		if(room.player.length == 1){

			room.index = 0;

			sendDataToRoom(roomUid, "tag_start");
		}
	}
	else if(tag == "tag_command"){

		let room = roomDic[client.roomUid];

		if(room.command.indexOf(client.clientUid) == -1){

			console.log("user command:" + client.clientUid + "  time:" + room.index);

			room.command.push(client.clientUid);
		}
	}
	else if(tag == "tag_getLag"){

		sendData(client, "tag_getLag", data);
	}
}

function update(){

	for(let key in roomDic){

		let room = roomDic[key];

		if(room.index > -1){

			let command = {index:room.index, arr:room.command};

			sendDataToRoom(key, "tag_command", command);

			room.command.length = 0;

			room.index++;
		}
	}
}

function sendDataToRoom(room, tag, data){

	if(!lagTest){

		io.sockets.in(room).emit(tag, data);
	}
	else{
		
		let runTime = new Date().getTime() + lagMin + Math.random() * (lagMax - lagMin);

		let dele = function(){

			io.sockets.in(room).emit(tag, data);
		}

		addLagTest(dele, runTime);
	}
}

function sendData(client, tag, data){

	if(!lagTest){

		client.emit(tag, data);
	}
	else{
		
		let runTime = new Date().getTime() + lagMin + Math.random() * (lagMax - lagMin);

		let dele = function(){

			client.emit(tag, data);
		}

		addLagTest(dele, runTime);
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