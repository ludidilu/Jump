let messageTag = ["tag_join","tag_command","tag_getLag"];

let player = [];

let lagTest = false;

let lagMin = 50;

let lagMax = 100;

let lagList = [];

let isLagRunning = false;

let io = require('socket.io')();

io.on('connection', connection);

io.on('disconnect', disconnect);

io.listen(1999);

let uid = 1;

let arr = [];

function connection(client){

	client.clientUid = uid;

	sendData(client, "connectOver", uid);
	
	console.log("one user connection:" + uid);
	
	uid++;

	for(let key in messageTag){

		let tag = messageTag[key];

		let delegate = function(data){

			getData(client, tag, data);
		};

		client.on(tag, delegate);
	}
}

function disconnect(client){

	console.log("disconnect:" + client);
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

let command = {index:0, arr:[]};

let index = 0;

function getDataReal(client, tag, data){

	if(tag == "tag_join"){
		
		console.log("user join:" + client.clientUid);
		
		client.join("room");
		
		arr.push(client.clientUid);

		sendDataToRoom("room", "tag_refresh", {arr:arr});

		if(arr.length == 2){

			sendDataToRoom("room", "tag_start");

			setInterval(update, 16);
		}
	}
	else if(tag == "tag_command"){

		console.log("user command:" + client.clientUid + "  time:" + command.index);

		command.arr.push(client.clientUid);
	}
	else if(tag == "tag_getLag"){

		sendData(client, "tag_getLag", data);
	}
}

function update(){

	command.index = index;

	sendDataToRoom("room", "tag_command", command);

	command.arr.length = 0;

	index++;
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