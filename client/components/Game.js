class Game {

	constructor(props) {
		//create canvas
		this.element = props.element;
		this.canvas = this.element.querySelector('.gameCanvas');
		this.canvas.width = props.CANVAS_WIDTH;
		this.canvas.height = props.CANVAS_HEIGHT;

		this.ctx = this.canvas.getContext('2d');
		//Add the canvas context into the existing props defining canvas structure
		this.props = Object.assign({}, props, {ctx: this.ctx});

		this.player = new Player(this.props);
		
		this.paused = false;
		//Used to control drop timing
		this.DROP_INIT = 1000;
		this.speedModifier = 1;

		this.dropInterval = this.DROP_INIT; //in milliseconds
		this.dropCounter = 0;
		this.lastTime = 0;

		this.run = this.run.bind(this);

	}



	drawGameBG() {
		let ctx = this.props.ctx;
		//This is the Sidebar color
		ctx.fillStyle = 'rgba(175,150,200, .3)';
		ctx.fillRect(0,0, this.props.CANVAS_WIDTH, this.props.CANVAS_HEIGHT);	
		//Playing area black
		ctx.fillStyle = 'rgba(0,0,0, 1)';
		ctx.fillRect(0,0, this.props.BOARD_WIDTH * this.props.TILESIZE + 2, this.props.BOARD_HEIGHT * this.props.TILESIZE);	
		//Border of playing area
		ctx.strokeStyle = 'white';
		ctx.strokeRect(0,0, this.props.BOARD_WIDTH * this.props.TILESIZE + 2, this.props.BOARD_HEIGHT * this.props.TILESIZE);
		//Border and fill of preview area
		ctx.strokeRect(this.props.TILESIZE * this.props.BOARD_WIDTH + 10, 10, 100, 100);
		ctx.fillStyle = 'rgba(100,100,150, .5)';
		ctx.fillRect(this.props.TILESIZE * this.props.BOARD_WIDTH + 10, 10, 100, 100);	
	}

	draw() {
		cls(this.props);
		this.drawGameBG();
		if(this.paused && !this.player.isDead) {
			this.drawPaused();
		} else {
			this.player.board.render();
			this.player.render();		
		}
	}

	//Works locally but not remotely
	drawPaused() {
		let ctx = this.props.ctx;
		ctx.strokeStyle = 'white';
		//Border of playing area
		ctx.strokeRect(1 * this.props.TILESIZE, 8 * this.props.TILESIZE, 10 * this.props.TILESIZE, 4 * this.props.TILESIZE);
		canvasText(ctx, 'PAUSED', undefined, '25px', 6 * this.props.TILESIZE, 10.5 * this.props.TILESIZE, 'white', 'center')		
	}

	//requestAnimationFrame returns callback with single argument of timestamp
	//On first run through needs to have a placeholder of 0
	run(time = 0) {

		//This is an attempt to stop the glitching where localInstances of copies are automatically drawing drops between
		//remote updates
		//Note: It's not working. Perhaps I'm broadcasting redundantly instead. But this may still cut down on a bit cycles on the
		//local client
		if(this.props.isLocal) {

			//Not in use yet. Will allow the game to speed up
			this.dropInterval = this.DROP_INIT * this.speedModifier;
			
			const deltaTime = time - this.lastTime;
			this.lastTime = time;
			this.dropCounter += deltaTime;
			if(!this.paused) {
				if (this.dropCounter > this.dropInterval) {
					if(!this.player.isDead) {
						//This last IF is because the program was running initially without a board or piece to merge and throwing an error
						if(this.player.board.matrix.length && this.player.activePiece.matrix !== undefined) {

							this.player.dropPiece();
							this.dropCounter = 0;						
							this.updateDropInterval()
						}
					}
				}
			}
			requestAnimationFrame(this.run);					
		}

		this.draw();			
		
	}

	updateDropInterval() {
		// if (player.linesCleared) <- Could add handling only in this case for efficiency
		this.speedModifier = .7 - (this.player.level * 0.05);
	}

	sendLocalState() {
		//Send local state to server to broadcast to all other players
		return {
			board: this.player.board.matrix,
			activePieceMatrix: this.player.activePiece.matrix,
			activePiecePos: this.player.activePiece.pos,
			nextPieceMatrix: this.player.nextPiece.matrix,
			score: this.player.score,
		}
	}

	receiveRemoteState(state) {
		//Update local copies of remote instance's state
		this.player.board.matrix = Object.assign(state.boardMatrix);
		this.player.activePiece.matrix = Object.assign(state.activePieceMatrix);
		this.player.activePiece.pos = Object.assign(state.activePiecePos);
		this.player.nextPiece.matrix = Object.assign(state.nextPieceMatrix);
		this.player.updateScore(Object.assign(state.score));
		this.draw();
	}



}
