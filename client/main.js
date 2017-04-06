const manager = new Manager(document);
const playerLocal = manager.createPlayer();
playerLocal.element.classList.add('local');
playerLocal.run();

const connectionManager = new ConnectionManager(manager);
connectionManager.connect(9000)

const playerKeys = [
	{
		left: 65,
		right: 68,
		down: 83,
		drop: 32,
		rotateClock: 69,
		rotateCount: 81,
		pause: 80,
	}
]

document.addEventListener('keydown', handleKeydown);

function handleKeydown(event) {
	playerKeys.forEach( (key, index) => {
		const player = playerLocal.player;
		if(!player.isDead){
			if(event.keyCode === key.left) {
				//'a'
				player.movePiece(-1)
			} else if (event.keyCode === key.right) {
				//'d'
				player.movePiece(1)
			} else if (event.keyCode === key.down) {
				//'s' accelerate drop
				player.dropPiece()
			} else if (event.keyCode === key.rotateClock) {
				//'e' for rotate clockwise
				player.rotatePiece(1);
			} else if (event.keyCode === key.rotateCount) {
				//'q' for rotate counter-clockwise
				player.rotatePiece(-1)
			} else if (event.keyCode === key.drop) {
				//'Spacebar' for quick drop
				player.instantDrop();
			} else if (event.keyCode === key.pause) {
				//'p' for pause
			}
		}
	})
}


//todo make drop interval dynamic based on player progress and have score increased as
//a multiplier of that somehow
//todo, accelerate a fixed number of times with score multiplier increase as well

//TODO: improve wall kick handling (sometimes it kicks the piece two squares over without even rotating)

//todo Add in other player preview screen to show their action
//Is there a way to prerender canvases to return snapshots of the other players score?
//That would be way easier than rendering two more canvases concurrently

//TODO: Add in player names