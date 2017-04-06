class Player {
	constructor(props){
		this.ctx = props.ctx;
		this.eventHandler = new EventHandler();		
		this.score = 0;
		this.linesCleared = 0;
		this.level = 0;
		this.isDead = false;
		this.colorScheme = props.colorScheme;
		this.board = new Board(props)
		this.activePiece = new Piece(this.board);
		this.nextPiece = new Piece(this.board);
		this.nextPiece.pos.x = this.board.width + 2;
		this.nextPiece.pos.y = 1;
	}

	movePiece(direction) {
		this.activePiece.pos.x += direction;
		if(this.checkBoardCollision()){
			this.activePiece.pos.x -= direction;
			return; //So the position change isn't emitted below (it will be emitted in the reset function instead)
		}
			this.eventHandler.emit('activePiecePos', this.activePiece.pos)		
	}

	rotatePiece(direction) {
		//simulating wall-kick effect. not perfect, needs fixing. especially with I shape
		this.activePiece.rotate(direction);
		if(this.checkBoardCollision()) {
			this.movePiece(direction);
			if(this.checkBoardCollision) {
				this.movePiece(direction);
				if(this.checkBoardCollision) {
					this.movePiece(-direction)
					this.movePiece(-direction)
					if(this.checkBoardCollision()) {
						this.movePiece(-direction)
						if(this.checkBoardCollision()) {
							this.movePiece(direction)
							this.movePiece(direction)
							this.activePiece.rotate(-direction)
						}
					}
				}
			}
		}
		this.eventHandler.emit('activePieceMatrix', this.activePiece.matrix);		
	}

	handleDropCollision() {
		this.activePiece.pos.y--;
		this.board.mergePiece(this.activePiece)
		this.eventHandler.emit('boardMatrix', this.board.matrix)
		this.resetPiece();
		this.checkCompletedLines();	
	}

	dropPiece() {		
			this.activePiece.pos.y++;
			if(this.checkBoardCollision()) {
				this.handleDropCollision();
				return; //So the position change isn't emitted below (it will be emitted in the reset function instead)
			}
			this.eventHandler.emit('activePiecePos', this.activePiece.pos)
	}

	instantDrop() {
		//create soon
		while(!this.checkBoardCollision()) {
			this.activePiece.pos.y++;
		}
		this.handleDropCollision();		
	}

	checkBoardCollision() {
		for (let y = 0; y < this.activePiece.matrix.length; y++){
			for (let x = 0; x < this.activePiece.matrix[y].length; x++) {
				if(
					this.activePiece.matrix[y][x] !== 0 &&
					(
						this.board.matrix[y + this.activePiece.pos.y] &&
						this.board.matrix[y + this.activePiece.pos.y][x + this.activePiece.pos.x] 
					) 	!== 0
				)	{
					return true;
				}

			}
		}
		return false;
	}

	resetPiece() {
		//find a more elegant method!		
		this.activePiece = new Piece(this.board, this.nextPiece.type)
		this.nextPiece = new Piece(this.board);
		this.nextPiece.pos.x = this.board.width + 2;
		this.nextPiece.pos.y = 1;

		this.eventHandler.emit('activePiecePos', this.activePiece.pos)
		this.eventHandler.emit('activePieceMatrix', this.activePiece.matrix)
		this.eventHandler.emit('nextPieceMatrix', this.nextPiece.matrix)

		//Kills player and ends game as soon as new piece tries to spawn on occupied board space
		if(this.checkBoardCollision()){
			this.isDead = true;
		}

	}

	checkCompletedLines() {
		//variable to track number of lines in one pass
		let completedLines = 0;
		//loop through board matrix
		for (let i = 0; i < this.board.matrix.length; i++){
			//test if all entries are not 0 (I believe some() is faster - should check)
			//return true if there aren't any elements that are zero
			if(!this.board.matrix[i].some((elem) => {return !elem})) {
				//if so add to variable 
				completedLines += 1;
				// then delete that row
				this.board.matrix.splice(i, 1);
				//add a new blank row to beginning of array
				this.board.matrix.unshift(new Array(this.board.matrix[0].length).fill(0))
				this.eventHandler.emit('boardMatrix', this.board.matrix)
			}
			
		}
		if(completedLines) {
			this.linesCleared += completedLines;
			const newScore = this.score + (completedLines * 5) * (completedLines * 5);
			this.updateScore(newScore);
		}


	}

	updateScore(newScore) {
		this.score = newScore;
		this.eventHandler.emit('score', newScore)
	}

	render() {
		this.activePiece.render();
		this.nextPiece.render();
		canvasText(this.ctx, this.score, undefined, '25px', ((this.board.width * this.board.tileSize) + 60), 200, 'white', 'center')
	}

}
