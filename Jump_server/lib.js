module.exports = function(){

	let obj = {};
	
	let p2 = require("./physics.js")();
	
	let ladderMat = new p2.Material(1);
		
	let humanMat = new p2.Material(2);
	
	let conMat1 = new p2.ContactMaterial(ladderMat, humanMat, {friction:0, relaxation:4, restitution:0});
	
	let conMat2 = new p2.ContactMaterial(humanMat, humanMat, {friction:0, relaxation:4, restitution:0});
	
	let BodyObj = function(){
		
		this.kkkk = 234;
		
		this.aaa = function(){
		
			console.log("aasd:" + this.kkkk);
		}
		
	};
	
	BodyObj.prototype = new p2.Body();
	
	let MoveBodyObj = function(){
		
		
	};
	
	MoveBodyObj.prototype = new BodyObj();
	
	let Human = function(){
		
	};
	
	Human.prototype = new MoveBodyObj();
	
	
	//Human.prototype.getArea = function(){
		
		//return 888;
	//}
	
	obj.World = function(){
		
		let kkk = 2;
		
		let world = new p2.World();
	
		world.emitImpactEvent = false;
		
	  world.sleepMode = p2.World.NO_SLEEPING;
	  
	  world.solver.iterations = 10;
	  
	  world.addContactMaterial(conMat1);
	  
	  world.addContactMaterial(conMat2);
	  
	  
	  let oo = new BodyObj();
	  
	  let human = new Human({mass:1, damping:0.1, angularDamping:0.1, gravityScale:1});
	  
	  this.human = human;
	  
	  human.aaa();
	  
	  let iii = human.getArea();
	  
	  console.log("ii:" + iii);
	  
	}
	
	
  
  

	return obj;
}