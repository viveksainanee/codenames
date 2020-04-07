//Make connection
// const PORT = process.env.PORT || 4000;

// const socket = io.connect('https://codenames.sainanee.com');
const socket = io.connect('http://localhost:4000');

const newGameBtn = document.getElementById('new-game');
const spymasterBtn = document.getElementById('spymaster');
const signUpBtn = document.getElementById('sign-up');

const board = document.getElementById('board');
const handle = document.getElementById('handle');
const players = document.getElementById('players');

const WIDTH = 5;
const HEIGHT = 5;

const BLUE_TILE_COUNT = 9;
const RED_TILE_COUNT = 8;
const BLACK_TILE_COUNT = 1;
const NEUTRAL_TILE_COLOR = '#ABA8B2';

let boardData = [];
let spymaster = false;

let colors = {};
let playersData = [];

//////
// CREATE BOARD DATA
//////

const generateTileCoordinates = (color, totalCount) => {
  // make blue tiles
  let currTileCount = 0;
  while (currTileCount < totalCount) {
    const currRow = Math.floor(Math.random() * HEIGHT).toString();
    const currCol = Math.floor(Math.random() * WIDTH).toString();
    if (!colors[currRow]) {
      colors[currRow] = {};
      colors[currRow][currCol] = color;
      currTileCount++;
    } else if (!colors[currRow][currCol]) {
      colors[currRow][currCol] = color;
      currTileCount++;
    }
  }
};

const createColorSecrets = () => {
  // make blue
  generateTileCoordinates('#5386E4', BLUE_TILE_COUNT);
  // make red
  generateTileCoordinates('#D80032', RED_TILE_COUNT);
  // make black
  generateTileCoordinates('black', BLACK_TILE_COUNT);
};

const pickRandomWord = () => {
  //todo
  return words[Math.floor(Math.random() * words.length)];
};

const createBoard = () => {
  createColorSecrets();
  for (let row = 0; row < HEIGHT; row++) {
    let currRowData = [];
    for (let col = 0; col < WIDTH; col++) {
      const rowStr = row.toString();
      const colStr = col.toString();
      const word = pickRandomWord();
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
});

signUpBtn.addEventListener('click', function () {
  playersData.push({ handle: handle.value });
  socket.emit('addPlayer', { handle: handle.value, playersData });
  handle.remove();
  signUpBtn.remove();
});

const sendFlipCardEvent = (row, col) => {
  if (!spymaster) {
    socket.emit('flipCard', { row, col, boardData });
  }
};

////
window.onbeforeunload = () => {
  // socket.emit('removePlayer', //}); send my handle name
};

//////
// SOCKET LISTENERS
//////

socket.on('requestData', function (data) {
  socket.emit('syncData', { playersData });
});

socket.on('syncData', function (data) {
  // to do here - troubleshoot why no data appears on initial load
  if (playersData.length === 0) {
    playersData = data.playersData;
    playersData.forEach((playerData) => addPlayerElement(playerData));
  }
});

socket.on('newGame', function (data) {
  drawBoardElements(data);
  newGameBtn.remove();
  spymasterBtn.remove();
});

socket.on('flipCard', function (data) {
  flipCardElement(data);
});

socket.on('addPlayer', function (data) {
  addPlayerElement(data);
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

const addPlayerElement = (data) => {
  let newPlayer = document.createElement('div');
  newPlayer.innerHTML = data.handle;
  players.appendChild(newPlayer);
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
