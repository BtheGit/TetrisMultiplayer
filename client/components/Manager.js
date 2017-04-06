class Manager {
	constructor(document) {
		this.document = document;
		this.template = this.document.querySelector('#player-template')
		this.canvasContainer = document.getElementById('canvasContainer');
		this.instances = [];
	}

	createPropsBundle(element, index) {

		const TILESIZE = 20;
		const BOARD_WIDTH = 12;
		const BOARD_HEIGHT = 20;

		const COLOR_SCHEMES = [
			{
				pieces: ['red', 'blue', 'purple', 'pink','orange', 'indigo', 'green'],
				outline: 'black',
			},
			{
				pieces: ['#A60037', '#F47992', '#FFE8B8', '#8BB195','#73725F', '#786171', '#00DDAA'],
				outline: 'black',
			},
			{
				pieces: ['red', 'blue', 'purple', 'pink','orange', 'indigo', 'green'],
				outline: 'black',
			},
			{
				pieces: ['#A60037', '#F47992', '#FFE8B8', '#8BB195','#73725F', '#786171', '#00DDAA'],
				outline: 'black',
			},
		]

		//get the canvas context
		const CANVAS_WIDTH = TILESIZE * (BOARD_WIDTH + 6);
		const CANVAS_HEIGHT = TILESIZE * BOARD_HEIGHT;

		//create a bundle 
		return {
			element: element,
			CANVAS_WIDTH,
			CANVAS_HEIGHT,
			TILESIZE,
			BOARD_HEIGHT,
			BOARD_WIDTH,
			colorScheme: COLOR_SCHEMES[index],
		}
		
	}

	createPlayer() {
		const element = document.importNode(this.template.content, true)
									 .children[0];

		const game = new Game(this.createPropsBundle(element, 0)); //need to dynamically change index later for color change


		//Add Game Instance to flex-box container
		this.canvasContainer.appendChild(game.element);

		this.instances.push(game);

		return game;
	}

	removePlayer(game) {
		console.log('removing remote game')
		this.canvasContainer.removeChild(game.element)
	}

	// sortPlayers(players) {
	// 	players.forEach(player => {
	// 		this.canvasContainer.appendChild(player.element)
	// 	})
	// }
}
