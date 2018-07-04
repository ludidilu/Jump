let messageTag = ["join","create","getLag"];

let player = [];

let lagTest = false;

let lagMin = 0;

let lagMax = 32;

let lagList = [];

let isLagRunning = false;




let io = require('socket.io')();

io.on('connection', connection);

io.on('disconnect', disconnect);

io.listen(1999);

function connection(client){

	console.log("one user connection");

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

function getDataReal(client, tag, data){

	if(tag == "join"){

		
	}
	else if(tag == "create"){

		
	}
	else if(tag == "getLag"){

		sendData(client, "getLag", data);
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