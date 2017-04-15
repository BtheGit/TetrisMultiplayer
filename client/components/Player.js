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
		this.pieceBag = this.generatePieceBag();
		this.activePiece = this.getPiece();
		this.nextPiece = this.getPiece();
		this.nextPiece.pos.x = this.board.width + 2;
		this.nextPiece.pos.y = 1;
	}

	//########################################
	//I'm adding in the less randomized grab bag. I should have built this into a piece handling class from the get go so this is dirty. 
	//Don't want to deal with it now.
	//Will need to refactor if I keep using this code much longer.

	//This creates a grabbag of 4 copies of each type of piee. Once the bag is depleted a new one is generated. Guaranteeing better
	//piece distribution.
	generatePieceBag() {
		const pieceTypes = 'TLJSZOI';
		let grabBag = [];
		
		for(let i = 0; i < 4; i++) {
			const pieces = pieceTypes.split('');
			for(let j = 0; j < 7; j++) {
				grabBag.push(pieces.splice(Math.floor(Math.random() * pieces.length), 1));
			}
		}
		grabBag = [].concat(...grabBag); //Flatten array of arrays of one letter each
		return grabBag;
	}

	getPiece() {
		if (!this.pieceBag.length) {
			this.pieceBag = this.generatePieceBag()
		}
		const piece = new Piece(this.board, this.pieceBag.splice(0,1).join(''))
		return piece;
	}
	//##########################################

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
		this.eventHandler.emit('activePiecePos', this.activePiece.pos)
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
		this.activePiece = this.nextPiece
		this.activePiece.pos = {x: this.activePiece.initX, y: this.activePiece.initY};
		this.nextPiece = this.getPiece();
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
			this.updatePlayerLevel();
		}
	}

	updateScore(newScore) {
		this.score = newScore;
		this.eventHandler.emit('score', newScore)
	}

	updatePlayerLevel() {
		if(this.linesCleared <= 9) {
			this.level = 0;
		} else if (this.linesCleared >= 10 && this.linesCleared < 90) {
			this.level = Math.floor(this.linesCleared / 10)
		} else {
			this.level = 9;
		}
		this.eventHandler.emit('level', this.level)
	}

	render() {
		this.activePiece.render();
		this.nextPiece.render();
		canvasText(this.ctx, 'SCORE', undefined, '25px', ((this.board.width * this.board.tileSize) + 60), 170, 'yellow', 'center')
		canvasText(this.ctx, this.score, undefined, '25px', ((this.board.width * this.board.tileSize) + 60), 210, 'white', 'center')
		canvasText(this.ctx, 'LEVEL', undefined, '25px', ((this.board.width * this.board.tileSize) + 60), 310, 'yellow', 'center')
		canvasText(this.ctx, this.level + 1, undefined, '25px', ((this.board.width * this.board.tileSize) + 60), 350, 'white', 'center')
	}

}
