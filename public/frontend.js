//Make connection
const socket = io.connect('http://localhost:4000');

const board = document.getElementById('board');
const newGameBtn = document.getElementById('new-game');
const spymasterBtn = document.getElementById('spymaster');

const WIDTH = 5;
const HEIGHT = 5;

const BLUE_TILE_COUNT = 9;
const RED_TILE_COUNT = 8;
const BLACK_TILE_COUNT = 1;

let boardData = [];
let spymaster = false;

let colors = {};

const createColorSecrets = () => {
  // make blue tiles
  let currBlueTileCount = 0;
  while (currBlueTileCount < BLUE_TILE_COUNT) {
    const blueRow = Math.floor(Math.random() * HEIGHT).toString();
    const blueCol = Math.floor(Math.random() * WIDTH).toString();
    if (!colors[blueRow]) {
      colors[blueRow] = {};
      colors[blueRow][blueCol] = '#5386E4';
      currBlueTileCount++;
    } else if (!colors[blueRow][blueCol]) {
      colors[blueRow][blueCol] = '#5386E4';
      currBlueTileCount++;
    }
  }
  // make red tiles
  let currRedTileCount = 0;
  while (currRedTileCount < RED_TILE_COUNT) {
    const redRow = Math.floor(Math.random() * HEIGHT).toString();
    const redCol = Math.floor(Math.random() * WIDTH).toString();
    if (!colors[redRow]) {
      colors[redRow] = {};
      colors[redRow][redCol] = '#D80032';
      currRedTileCount++;
    } else if (!colors[redRow][redCol]) {
      colors[redRow][redCol] = '#D80032';
      currRedTileCount++;
    }
  }
  // make black tile
  let currBlackTileCount = 0;
  while (currBlackTileCount < BLACK_TILE_COUNT) {
    const blackRow = Math.floor(Math.random() * HEIGHT).toString();
    const blackCol = Math.floor(Math.random() * WIDTH).toString();
    if (!colors[blackRow]) {
      colors[blackRow] = {};
      colors[blackRow][blackCol] = 'black';
      currBlackTileCount++;
    } else if (!colors[blackRow][blackCol]) {
      colors[blackRow][blackCol] = 'black';
      currBlackTileCount++;
    }
  }
};

// New Game UI creates data
const createBoard = () => {
  createColorSecrets();
  for (let row = 0; row < HEIGHT; row++) {
    let currRowData = [];
    for (let col = 0; col < WIDTH; col++) {
      const word = words[Math.floor(Math.random() * words.length)];

      const color =
        colors[row.toString()] && colors[row.toString()][col.toString()]
          ? colors[row.toString()][col.toString()]
          : '#ABA8B2';

      const cardData = { word, color, flipped: false };
      currRowData.push(cardData);
    }
    boardData.push(currRowData);
  }
  return boardData;
};

// emit event when someone hits send
newGameBtn.addEventListener('click', function () {
  const boardData = createBoard();
  socket.emit('newGame', { boardData });
});

spymasterBtn.addEventListener('click', function () {
  spymaster = true;
  spymasterBtn.remove();
});

const sendFlipCardEvent = (row, col) => {
  if (!spymaster) {
    socket.emit('flipCard', { row, col, boardData });
  }
};

// Drawing events on all UIs
const drawBoard = (data) => {
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
      const color = boardData[rowIdx][colIdx].color;
      // for spymasters only
      if (spymaster) {
        card.style.color = color;
      }
      if (boardData[rowIdx][colIdx].flipped) {
        card.style.backgroundColor = color;
      }
      row.appendChild(card);
      card.addEventListener('click', () => sendFlipCardEvent(rowIdx, colIdx));
    }
    container.appendChild(row);
  }
  board.appendChild(container);
  newGameBtn.remove();
  spymasterBtn.remove();
};

const flipCard = (data) => {
  const row = data.row;
  const col = data.col;
  const card = document.getElementsByClassName(`${row}-${col}`)[0];
  console.log('data', data);
  card.style.backgroundColor = data.boardData[row][col].color;
};

// Listen for events
socket.on('newGame', function (data) {
  drawBoard(data);
});

socket.on('flipCard', function (data) {
  flipCard(data);
});

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
