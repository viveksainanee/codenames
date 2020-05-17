//Make connection

const PORT = 'codenames.sainanee.com';
// const PORT = 'localhost:4000';

const socket = io.connect(`http://${PORT}`);

const homePage = document.getElementById('homepage');

const newGameBtn = document.getElementById('new-game');
const signUpBtn = document.getElementById('sign-up');
let spymasterBtn = document.getElementById('spymaster');
let flipTimerBtn;
let timerFn;
let endGameBtn;

const board = document.getElementById('board');
const handle = document.getElementById('handle');
const players = document.getElementById('players');
const timerDiv = document.getElementById('timer');
const timerInfoDiv = document.getElementById('timer-info');

const gameDataDiv = document.getElementById('game-data');
const scoreboardDiv = document.getElementById('scoreboard');

const WIDTH = 5;
const HEIGHT = 5;

const BLUE_TILE_COUNT = 8 + Math.floor(Math.random() * 2);
const RED_TILE_COUNT = 17 - BLUE_TILE_COUNT;
const BLACK_TILE_COUNT = 1;
const NEUTRAL_TILE_COLOR = '#ABA8B2';
const BLUE_TILE_COLOR = '#5386E4';
const RED_TILE_COLOR = '#D80032';

let gameState = {
  boardData: [],
  playersData: [],
  scoreboard: {},
};

let spymaster = false;
let myHandle = null;

//////
// CREATE BOARD DATA
//////

const addTileColorCoords = (colorCoords, color, totalCount) => {
  // make blue tiles
  let currTileCount = 0;
  while (currTileCount < totalCount) {
    const currRow = Math.floor(Math.random() * HEIGHT).toString();
    const currCol = Math.floor(Math.random() * WIDTH).toString();
    if (!colorCoords[currRow]) {
      colorCoords[currRow] = {};
      colorCoords[currRow][currCol] = color;
      currTileCount++;
    } else if (!colorCoords[currRow][currCol]) {
      colorCoords[currRow][currCol] = color;
      currTileCount++;
    }
  }
  return colorCoords;
};

const createColorCoords = () => {
  let colorCoords = {};
  // make blue
  colorCoords = addTileColorCoords(
    colorCoords,
    BLUE_TILE_COLOR,
    BLUE_TILE_COUNT
  );
  // make red
  colorCoords = addTileColorCoords(colorCoords, RED_TILE_COLOR, RED_TILE_COUNT);
  // make black
  colorCoords = addTileColorCoords(colorCoords, 'black', BLACK_TILE_COUNT);
  return colorCoords;
};

const pickRandomWord = () => {
  const packType = document.getElementById('packs-dropdown');
  console.log(packType.value);
  if (packType.value === 'covid') {
    return covidWords[
      Math.floor(Math.random() * covidWords.length)
    ].toUpperCase();
  } else {
    return words[Math.floor(Math.random() * words.length)].toUpperCase();
  }
};

const createBoard = () => {
  let colors = createColorCoords();
  let usedWords = [];
  for (let row = 0; row < HEIGHT; row++) {
    let currRowData = [];
    for (let col = 0; col < WIDTH; col++) {
      const rowStr = row.toString();
      const colStr = col.toString();
      let word = pickRandomWord();
      while (usedWords.includes(word)) {
        word = pickRandomWord();
      }
      usedWords.push(word);
      const color =
        colors[rowStr] && colors[rowStr][colStr]
          ? colors[rowStr][colStr]
          : NEUTRAL_TILE_COLOR;

      const cardData = { word, color };
      currRowData.push(cardData);
    }
    gameState.boardData.push(currRowData);
  }
};

//////
// EVENT HANDLING
//////

const loadInitialData = () => {
  socket.emit('requestData');
};
loadInitialData();

newGameBtn.addEventListener('click', function () {
  createBoard();
  let scoreboard = {
    currBlue: 0,
    currRed: 0,
    totalBlue: BLUE_TILE_COUNT,
    totalRed: RED_TILE_COUNT,
  };
  socket.emit('newGame', { boardData: gameState.boardData, scoreboard });
});

spymasterBtn.addEventListener('click', function () {
  spymaster = true;
  spymasterBtn.remove();
  socket.emit('addSpymaster', { handle: handle.value });
});

signUpBtn.addEventListener('click', function () {
  myHandle = handle.value;
  if (handle.value === '') {
    alert('Please Enter Something!');
  } else {
    socket.emit('addPlayer', { handle: handle.value });
    handle.remove();
    signUpBtn.remove();
    spymasterBtn.hidden = false;
  }
});

const sendFlipCardEvent = (row, col) => {
  if (!myHandle) {
    alert('Wait for next game bro');
  } else if (!spymaster) {
    socket.emit('flipCard', { row, col });
  }
};

const flipTimerEvent = () => {
  socket.emit('flipTimer');
};

const endGameEvent = () => {
  socket.emit('endGame');
};

window.onbeforeunload = () => {
  socket.emit('removePlayer', { handleToRemove: myHandle });
};

//////
// SOCKET LISTENERS
//////

socket.on('requestData', function (data) {
  socket.emit('syncInitialData', gameState);
});

socket.on('syncInitialData', function (data) {
  const haventSyncedYet = gameState.playersData.length === 0;

  if (haventSyncedYet) {
    gameState = data;
    gameState.playersData.forEach((handle) => addPlayer({ handle }));

    if (data.boardData.length !== 0) {
      drawBoardElements(data);
      homePage.remove();
    }
  }
});

socket.on('newGame', function (data) {
  drawBoardElements(data);
  homePage.remove();
});

socket.on('flipCard', function (data) {
  flipCardElement(data);
});

socket.on('addPlayer', function (data) {
  addPlayer(data);
});

socket.on('addSpymaster', function (data) {
  addSpymaster(data);
});

socket.on('flipTimer', function (data) {
  flipTimer();
});

socket.on('endGame', function (data) {
  endGame();
});

socket.on('removePlayer', function (data) {
  removePlayerElement(data);
});

//////
// SOCKET HANDLERS
//////

const drawBoardElements = (data) => {
  gameState.boardData = data.boardData;
  gameState.scoreboard = data.scoreboard;

  flipTimerBtn = document.createElement('button');
  flipTimerBtn.innerText = 'Flip Timer';
  flipTimerBtn.addEventListener('click', flipTimerEvent);
  timerInfoDiv.appendChild(flipTimerBtn);

  scoreboardDiv.innerHTML = `Blue: 0/${gameState.scoreboard.totalBlue} - Red: 0/${gameState.scoreboard.totalRed}`;
  players.appendChild(scoreboardDiv);

  let container = document.createElement('div');
  container.setAttribute('class', 'container-fluid p-0 m-0');
  for (let rowIdx = 0; rowIdx < gameState.boardData.length; rowIdx++) {
    let row = document.createElement('div');
    row.setAttribute('class', 'row p-0');
    for (let colIdx = 0; colIdx < gameState.boardData.length; colIdx++) {
      let card = document.createElement('div');
      card.setAttribute('class', `col-2 card ${rowIdx}-${colIdx} text-center`);
      card.innerHTML += `${gameState.boardData[rowIdx][colIdx].word}`;
      // for spymasters only
      if (spymaster) {
        const color = gameState.boardData[rowIdx][colIdx].color;
        card.style.color = color;
      }
      card.addEventListener('click', () => sendFlipCardEvent(rowIdx, colIdx));
      row.appendChild(card);
    }
    container.appendChild(row);
  }
  board.appendChild(container);

  endGameBtn = document.createElement('button');
  endGameBtn.innerText = 'End Game';
  endGameBtn.addEventListener('click', endGameEvent);

  gameDataDiv.appendChild(endGameBtn);
};

const flipCardElement = (data) => {
  const row = data.row;
  const col = data.col;
  const card = document.getElementsByClassName(`${row}-${col}`)[0];
  const flippedCardColor = gameState.boardData[row][col].color;
  const { currBlue, totalBlue, currRed, totalRed } = gameState.scoreboard;
  if (flippedCardColor === BLUE_TILE_COLOR && card.style.color !== 'white') {
    gameState.scoreboard.currBlue++;
    scoreboardDiv.innerHTML = `Blue: ${gameState.scoreboard.currBlue}/${totalBlue} - Red: ${currRed}/${totalRed}`;
    if (gameState.scoreboard.currBlue === totalBlue) {
      let winBannerDiv = document.createElement('h1');
      winBannerDiv.innerHTML = 'blue wins!!';
      board.prepend(winBannerDiv);
    }
  } else if (
    flippedCardColor === RED_TILE_COLOR &&
    card.style.color !== 'white'
  ) {
    gameState.scoreboard.currRed++;
    scoreboardDiv.innerHTML = `Blue: ${currBlue}/${totalBlue} - Red: ${gameState.scoreboard.currRed}/${totalRed}`;
    if (gameState.scoreboard.currRed === totalRed) {
      let winBannerDiv = document.createElement('h1');
      winBannerDiv.innerHTML = 'red wins!!';
      board.prepend(winBannerDiv);
    }
  }
  card.style.backgroundColor = flippedCardColor;
  card.style.color = 'white';
};

const addPlayer = (data) => {
  gameState.playersData.push(data.handle);
  let newPlayer = document.createElement('div');
  newPlayer.setAttribute('class', data.handle);
  newPlayer.innerHTML = data.handle;
  players.appendChild(newPlayer);
};

const addSpymaster = (data) => {
  const handle = data.handle;
  const handleDiv = document.getElementsByClassName(`${handle}`)[0];
  let spymasterLabel = document.createElement('span');
  spymasterLabel.innerHTML = ' - spymaster ';
  handleDiv.append(spymasterLabel);
};

const flipTimer = () => {
  clearInterval(timerFn);
  let currTimeLeft = 120;
  timerFn = setInterval(() => {
    currTimeLeft--;
    const currMinLeft = Math.floor(currTimeLeft / 60);
    let currSecLeft = (currTimeLeft % 60).toString();
    if (currSecLeft.length === 1) {
      currSecLeft = '0' + currSecLeft;
    }
    timerDiv.innerText = `${currMinLeft}:${currSecLeft}`;
  }, 1000);
};

const endGame = () => {
  gameState = {
    boardData: [],
    playersData: [],
    scoreboard: {},
  };
  window.location.reload();
};

const removePlayerElement = (data) => {
  //remove div
  const handleToRemove = data.handleToRemove;
  const divToRemove = document.getElementsByClassName(`${handleToRemove}`)[0];
  divToRemove.remove();
  //remove from playersData
  const playerIndex = gameState.playersData.indexOf(handleToRemove);
  if (playerIndex > -1) {
    gameState.playersData.splice(playerIndex, 1);
  }
};

const words = [
  ' AFRICA	',
  '	AGENT	',
  '	AIR	',
  '	ALIEN	',
  '	ALPS	',
  '	AMAZON	',
  '	AMBULANCE	',
  '	AMERICA	',
  '	ANGEL	',
  '	ANTARCTICA	',
  '	APPLE	',
  '	ARM	',
  '	ATLANTIS	',
  '	AUSTRALIA	',
  '	AZTEC	',
  '	BACK	',
  '	BALL	',
  '	BAND	',
  '	BANK	',
  '	BAR	',
  '	BARK	',
  '	BAT	',
  '	BATTERY	',
  '	BEACH	',
  '	BEAR	',
  '	BEAT	',
  '	BED	',
  '	BEIJING	',
  '	BELL	',
  '	BELT	',
  '	BERLIN	',
  '	BERMUDA	',
  '	BERRY	',
  '	BILL	',
  '	BLOCK	',
  '	BOARD	',
  '	BOLT	',
  '	BOMB	',
  '	BOND	',
  '	BOOM	',
  '	BOOT	',
  '	BOTTLE	',
  '	BOW	',
  '	BOX	',
  '	BRIDGE	',
  '	BRUSH	',
  '	BUCK	',
  '	BUFFALO	',
  '	BUG	',
  '	BUGLE	',
  '	BUTTON	',
  '	CALF	',
  '	CANADA	',
  '	CAP	',
  '	CAPITAL	',
  '	CAR	',
  '	CARD	',
  '	CARROT	',
  '	CASINO	',
  '	CAST	',
  '	CAT	',
  '	CELL	',
  '	CENTAUR	',
  '	CENTER	',
  '	CHAIR	',
  '	CHANGE	',
  '	CHARGE	',
  '	CHECK	',
  '	CHEST	',
  '	CHICK	',
  '	CHINA	',
  '	CHOCOLATE	',
  '	CHURCH	',
  '	CIRCLE	',
  '	CLIFF	',
  '	CLOAK	',
  '	CLUB	',
  '	CODE	',
  '	COLD	',
  '	COMIC	',
  '	COMPOUND	',
  '	CONCERT	',
  '	CONDUCTOR	',
  '	CONTRACT	',
  '	COOK	',
  '	COPPER	',
  '	COTTON	',
  '	COURT	',
  '	COVER	',
  '	CRANE	',
  '	CRASH	',
  '	CRICKET	',
  '	CROSS	',
  '	CROWN	',
  '	CYCLE	',
  '	CZECH	',
  '	DANCE	',
  '	DATE	',
  '	DAY	',
  '	DEATH	',
  '	DECK	',
  '	DEGREE	',
  '	DIAMOND	',
  '	DICE	',
  '	DINOSAUR	',
  '	DISEASE	',
  '	DOCTOR	',
  '	DOG	',
  '	DRAFT	',
  '	DRAGON	',
  '	DRESS	',
  '	DRILL	',
  '	DROP	',
  '	DUCK	',
  '	DWARF	',
  '	EAGLE	',
  '	EGYPT	',
  '	EMBASSY	',
  '	ENGINE	',
  '	ENGLAND	',
  '	EUROPE	',
  '	EYE	',
  '	FACE	',
  '	FAIR	',
  '	FALL	',
  '	FAN	',
  '	FENCE	',
  '	FIELD	',
  '	FIGHTER	',
  '	FIGURE	',
  '	FILE	',
  '	FILM	',
  '	FIRE	',
  '	FISH	',
  '	FLUTE	',
  '	FLY	',
  '	FOOT	',
  '	FORCE	',
  '	FOREST	',
  '	FORK	',
  '	FRANCE	',
  '	GAS	',
  '	GENIUS	',
  '	GERMANY	',
  '	GHOST	',
  '	GIANT	',
  '	GLASS	',
  '	GLOVE	',
  '	GOLD	',
  '	GRACE	',
  '	GRASS	',
  '	GREECE	',
  '	GREEN	',
  '	GROUND	',
  '	HAM	',
  '	HAND	',
  '	HAWK	',
  '	HEAD	',
  '	HEART	',
  '	HELICOPTER	',
  '	HIMALAYAS	',
  '	HOLE	',
  '	HOLLYWOOD	',
  '	HONEY	',
  '	HOOD	',
  '	HOOK	',
  '	HORN	',
  '	HORSE	',
  '	HORSESHOE	',
  '	HOSPITAL	',
  '	HOTEL	',
  '	ICE	',
  '	ICE CREAM	',
  '	INDIA	',
  '	IRON	',
  '	IVORY	',
  '	JACK	',
  '	JAM	',
  '	JET	',
  '	JUPITER	',
  '	KANGAROO	',
  '	KETCHUP	',
  '	KEY	',
  '	KID	',
  '	KING	',
  '	KIWI	',
  '	KNIFE	',
  '	KNIGHT	',
  '	LAB	',
  '	LAP	',
  '	LASER	',
  '	LAWYER	',
  '	LEAD	',
  '	LEMON	',
  '	LEPRECHAUN	',
  '	LIFE	',
  '	LIGHT	',
  '	LIMOUSINE	',
  '	LINE	',
  '	LINK	',
  '	LION	',
  '	LITTER	',
  '	LOCH NESS	',
  '	LOCK	',
  '	LOG	',
  '	LONDON	',
  '	LUCK	',
  '	MAIL	',
  '	MAMMOTH	',
  '	MAPLE	',
  '	MARBLE	',
  '	MARCH	',
  '	MASS	',
  '	MATCH	',
  '	MERCURY	',
  '	MEXICO	',
  '	MICROSCOPE	',
  '	MILLIONAIRE	',
  '	MINE	',
  '	MINT	',
  '	MISSILE	',
  '	MODEL	',
  '	MOLE	',
  '	MOON	',
  '	MOSCOW	',
  '	MOUNT	',
  '	MOUSE	',
  '	MOUTH	',
  '	MUG	',
  '	NAIL	',
  '	NEEDLE	',
  '	NET	',
  '	NEW YORK	',
  '	NIGHT	',
  '	NINJA	',
  '	NOTE	',
  '	NOVEL	',
  '	NURSE	',
  '	NUT	',
  '	OCTOPUS	',
  '	OIL	',
  '	OLIVE	',
  '	OLYMPUS	',
  '	OPERA	',
  '	ORANGE	',
  '	ORGAN	',
  '	PALM	',
  '	PAN	',
  '	PANTS	',
  '	PAPER	',
  '	PARACHUTE	',
  '	PARK	',
  '	PART	',
  '	PASS	',
  '	PASTE	',
  '	PENGUIN	',
  '	PHOENIX	',
  '	PIANO	',
  '	PIE	',
  '	PILOT	',
  '	PIN	',
  '	PIPE	',
  '	PIRATE	',
  '	PISTOL	',
  '	PIT	',
  '	PITCH	',
  '	PLANE	',
  '	PLASTIC	',
  '	PLATE	',
  '	PLATYPUS	',
  '	PLAY	',
  '	PLOT	',
  '	POINT	',
  '	POISON	',
  '	POLE	',
  '	POLICE	',
  '	POOL	',
  '	PORT	',
  '	POST	',
  '	POUND	',
  '	PRESS	',
  '	PRINCESS	',
  '	PUMPKIN	',
  '	PUPIL	',
  '	PYRAMID	',
  '	QUEEN	',
  '	RABBIT	',
  '	RACKET	',
  '	RAY	',
  '	REVOLUTION	',
  '	RING	',
  '	ROBIN	',
  '	ROBOT	',
  '	ROCK	',
  '	ROME	',
  '	ROOT	',
  '	ROSE	',
  '	ROULETTE	',
  '	ROUND	',
  '	ROW	',
  '	RULER	',
  '	SATELLITE	',
  '	SATURN	',
  '	SCALE	',
  '	SCHOOL	',
  '	SCIENTIST	',
  '	SCORPION	',
  '	SCREEN	',
  '	SCUBA DIVER	',
  '	SEAL	',
  '	SERVER	',
  '	SHADOW	',
  '	SHAKESPEARE	',
  '	SHARK	',
  '	SHIP	',
  '	SHOE	',
  '	SHOP	',
  '	SHOT	',
  '	SINK	',
  '	SKYSCRAPER	',
  '	SLIP	',
  '	SLUG	',
  '	SMUGGLER	',
  '	SNOW	',
  '	SNOWMAN	',
  '	SOCK	',
  '	SOLDIER	',
  '	SOUL	',
  '	SOUND	',
  '	SPACE	',
  '	SPELL	',
  '	SPIDER	',
  '	SPIKE	',
  '	SPINE	',
  '	SPOT	',
  '	SPRING	',
  '	SPY	',
  '	SQUARE	',
  '	STADIUM	',
  '	STAFF	',
  '	STAR	',
  '	STATE	',
  '	STICK	',
  '	STOCK	',
  '	STRAW	',
  '	STREAM	',
  '	STRIKE	',
  '	STRING	',
  '	SUB	',
  '	SUIT	',
  '	SUPERHERO	',
  '	SWING	',
  '	SWITCH	',
  '	TABLE	',
  '	TABLET	',
  '	TAG	',
  '	TAIL	',
  '	TAP	',
  '	TEACHER	',
  '	TELESCOPE	',
  '	TEMPLE	',
  '	THEATER	',
  '	THIEF	',
  '	THUMB	',
  '	TICK	',
  '	TIE	',
  '	TIME	',
  '	TOKYO	',
  '	TOOTH	',
  '	TORCH	',
  '	TOWER	',
  '	TRACK	',
  '	TRAIN	',
  '	TRIANGLE	',
  '	TRIP	',
  '	TRUNK	',
  '	TUBE	',
  '	TURKEY	',
  '	UNDERTAKER	',
  '	UNICORN	',
  '	VACUUM	',
  '	VAN	',
  '	VET	',
  '	WAKE	',
  '	WALL	',
  '	WAR	',
  '	WASHER	',
  '	WASHINGTON	',
  '	WATCH	',
  '	WATER	',
  '	WAVE	',
  '	WEB	',
  '	WELL	',
  '	WHALE	',
  '	WHIP	',
  '	WIND	',
  '	WITCH	',
  '	WORM	',
  '	YARD	',
];

let seattleWords = [
  'SPACE NEEDLE',
  'KERRY PARK',
  'DOUGH ZONE',
  'LAKE UNION',
  'BALLARD',
  'STARBUCKS',
  'GREENLAKE',
  'DISCOVERY',
  'CALIFORNIA',
  'PORTLAND',
  'VANCOUVER',
  'SEATTLE FREEZE',
  'AMAZON',
  'PACIFIC',
  'RAINIER',
];

let foodWords = [
  'COFFEE',
  'LATTE',
  'SUSHI',
  'QUESO',
  'BURRITO',
  'CHICKEN NUGGET',
  'DUMPLING',
  'COOKIE',
  'BROWNIE',
  'FRIES',
  'BURGER',
  'MATCHA',
  'LOLLIPOP',
  'PRETZEL',
  'RICE',
  'DONUT',
  'CROISSANT',
  'COOKIE DOUGH',
  'CORN',
  'TOMATO',
  'DRUMSTICK',
  'PIZZA',
  'PINEAPPLE',
  'STRAWBERRY',
  'SPAGHETTI',
  'SHRIMP',
  'TACO',
  'BULGOGI',
  'GALBI',
  'AVOCADO',
];

let covidWords = [
  '	quarantine	',
  '	elderly	',
  '	disease	',
  '	virus	',
  '	zoom	',
  '	wfh	',
  '	facemask	',
  '	frontlines	',
  '	glove	',
  '	hospital	',
  '	emergency	',
  '	epicenter	',
  '	virtual	',
  '	lockdown	',
  '	home	',
  '	healthy	',
  '	stream	',
  '	Netflix	',
  '	toilet paper	',
  '	groceries	',
  '	hoard	',
  '	economy	',
  '	legislation	',
  '	unemployment	',
  '	public	',
  '	germs	',
  '	cough	',
  '	immunity	',
  '	bat	',
  '	market	',
  '	instagram	',
  '	doctor	',
  '	nurse	',
  '	cook	',
  '	bake	',
  '	recipe	',
  '	social	',
  '	distance	',
  '	aerosol	',
  '	temperature	',
  '	manufacture	',
  '	spread	',
  '	care	',
  '	bed	',
  '	breathe	',
  '	police	',
  '	order	',
  '	mandate	',
  '	isolation	',
  '	tik tok	',
  '	challenge	',
  '	tag	',
  '	video	',
  '	coffee	',
  '	wine	',
  '	happy hour	',
  '	conference	',
  '	restaurant	',
  '	delivery	',
  '	postmates	',
  '	uber eats	',
  '	contactless	',
  '	disney	',
  '	tiger king	',
  '	fight	',
  '	cure	',
  '	support	',
  '	scrubs	',
  '	soap	',
  '	sanitizer	',
  '	alcohol	',
  '	snacks	',
  '	news	',
  '	vaccine	',
  '	shortage	',
  '	online	',
  '	facetime	',
  '	connect	',
  '	stock	',
  '	jackbox	',
  '	test	',
  '	number	',
  '	positive	',
  '	negative	',
  '	flu	',
  '	hands	',
  '	spring	',
  '	gymnasium	',
  '	retirement	',
  '	death	',
  '	safe	',
  '	droplet	',
  '	governor	',
  '	Congress	',
  '	election	',
  '	postpone	',
  '	essential	',
  '	unprecedented	',
  '	time	',
  '	mutate	',
  '	state	',
  '	theory	',
  '	research	',
  '	incubation	',
  '	14 days	',
  '	scientist	',
  '	resources	',
  '	life	',
  '	consult	',
  '	end	',
  '	six feet	',
  '	cover	',
  '	mouth	',
  '	nose	',
  '	lungs	',
  '	treat	',
  '	medicine	',
  '	pharmacy	',
  '	prescription	',
  '	drug	',
  '	cookies	',
  '	chips	',
  '	HBO	',
  '	movie	',
  '	benefit	',
  '	insurance	',
  '	puppy	',
  '	friend	',
  '	relative	',
  '	travel	',
  '	refund	',
  '	airline	',
  '	plane	',
  '	gardening	',
  '	yoga	',
  '	balcony	',
  '	sing	',
  '	amazon	',
  '	business	',
  '	paycheck	',
  '	loan	',
  '	bankrupt	',
  '	people	',
  '	citizen	',
  '	city	',
  '	team	',
  '	work	',
  '	healthcare	',
  '	closed	',
  '	open	',
  '	announce	',
  '	ferret	',
  '	clean	',
  '	disinfect	',
  '	wash	',
  '	touch	',
  '	eyes	',
  '	inside	',
  '	park	',
  '	gathering	',
  '	global	',
  '	pandemic	',
  '	ration	',
  '	read	',
  '	extrovert	',
  '	podcast	',
  '	show	',
  '	binge	',
  '	stop	',
  '	change	',
  '	gene	',
  '	symptom 	',
];
