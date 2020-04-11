//Make connection

const PORT = 'codenames.sainanee.com';
// const PORT = 'localhost:4000';

const socket = io.connect(`http://${PORT}`);

const homePage = document.getElementById('homepage');

const newGameBtn = document.getElementById('new-game');
let spymasterBtn = document.getElementById('spymaster');
const signUpBtn = document.getElementById('sign-up');

const board = document.getElementById('board');
const handle = document.getElementById('handle');
const players = document.getElementById('players');

const WIDTH = 5;
const HEIGHT = 5;

const BLUE_TILE_COUNT = 8 + Math.floor(Math.random() * 2);
const RED_TILE_COUNT = 17 - BLUE_TILE_COUNT;
const BLACK_TILE_COUNT = 1;
const NEUTRAL_TILE_COLOR = '#ABA8B2';

let boardData = [];
let playersData = [];

let spymaster = false;
let host = false;
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
  colorCoords = addTileColorCoords(colorCoords, '#5386E4', BLUE_TILE_COUNT);
  // make red
  colorCoords = addTileColorCoords(colorCoords, '#D80032', RED_TILE_COUNT);
  // make black
  colorCoords = addTileColorCoords(colorCoords, 'black', BLACK_TILE_COUNT);
  return colorCoords;
};

const pickRandomWord = () => {
  return words[Math.floor(Math.random() * words.length)];
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
    boardData.push(currRowData);
  }
  return boardData;
};

//////
// EVENT HANDLING
//////

const loadInitialData = () => {
  socket.emit('requestData');
};
loadInitialData();

newGameBtn.addEventListener('click', function () {
  const boardData = createBoard();
  socket.emit('newGame', { boardData });
});

spymasterBtn.addEventListener('click', function () {
  spymaster = true;
  spymasterBtn.remove();
  socket.emit('addSpymaster', { handle: handle.value });
});

signUpBtn.addEventListener('click', function () {
  myHandle = handle.value;
  socket.emit('addPlayer', { handle: handle.value });
  handle.remove();
  signUpBtn.remove();
  spymasterBtn.hidden = false;
});

const sendFlipCardEvent = (row, col) => {
  if (!myHandle) {
    alert('Wait for next game bro');
  } else if (!spymaster) {
    socket.emit('flipCard', { row, col, boardData });
  }
};

window.onbeforeunload = () => {
  socket.emit('removePlayer', { handleToRemove: myHandle });
};

//////
// SOCKET LISTENERS
//////

socket.on('requestData', function (data) {
  socket.emit('syncInitialData', { playersData, boardData });
});

socket.on('syncInitialData', function (data) {
  const haventSyncedYet = playersData.length === 0;

  if (haventSyncedYet) {
    playersData = data.playersData;
    playersData.forEach((handle) => addPlayer({ handle }));

    if (data.boardData.length !== 0) {
      boardData = data.boardData;
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

socket.on('removePlayer', function (data) {
  removePlayerElement(data);
});

//////
// SOCKET HANDLERS
//////

const drawBoardElements = (data) => {
  boardData = data.boardData;
  let container = document.createElement('div');
  container.setAttribute('class', 'container');
  for (let rowIdx = 0; rowIdx < boardData.length; rowIdx++) {
    let row = document.createElement('div');
    row.setAttribute('class', 'row');
    for (let colIdx = 0; colIdx < boardData.length; colIdx++) {
      let card = document.createElement('div');
      card.setAttribute('class', `card ${rowIdx}-${colIdx} text-center`);
      card.innerHTML += `${boardData[rowIdx][colIdx].word}`;
      // for spymasters only
      if (spymaster) {
        const color = boardData[rowIdx][colIdx].color;
        card.style.color = color;
      }
      card.addEventListener('click', () => sendFlipCardEvent(rowIdx, colIdx));
      row.appendChild(card);
    }
    container.appendChild(row);
  }
  board.appendChild(container);
};

const flipCardElement = (data) => {
  const row = data.row;
  const col = data.col;
  const card = document.getElementsByClassName(`${row}-${col}`)[0];
  card.style.backgroundColor = data.boardData[row][col].color;
  card.style.color = 'white';
};

const addPlayer = (data) => {
  playersData.push(data.handle);
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

const removePlayerElement = (data) => {
  //remove div
  const handleToRemove = data.handleToRemove;
  const divToRemove = document.getElementsByClassName(`${handleToRemove}`)[0];
  divToRemove.remove();
  //remove from playersData
  const playerIndex = playersData.indexOf(handleToRemove);
  if (playerIndex > -1) {
    playersData.splice(playerIndex, 1);
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
  '	GAME	',
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
