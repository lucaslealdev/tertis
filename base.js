const render = (blocks) => {
  player1.innerHTML = '';
  for (let index = 0; index < blocks.length; index++) {
    player1.insertAdjacentHTML('beforeend','<tr></tr>');
    for (let index2 = 0; index2 < blocks[index].length; index2++) {
      const bloco = blocks[index][index2];
      const td = document.createElement(`td`);
      if (bloco?.active) {
        td.classList.add('active');
      }
      td.dataset.row = index;
      td.dataset.column = index2;
      bloco?.color && (td.style.background = bloco?.color);
      player1.querySelector('tr:last-child').appendChild(td);
    }
  }
}

const exists = (row, column) => {
  return (row >= 0 && column >= 0 && row < game.length && column < game[0].length);
}

const isEmpty = (row, column) => {
  return !game[row][column]?.color;
}

let game = [];
for (let index = 0; index < 15; index++) {
  game.push([]);
  for (let index2 = 0; index2 < 10; index2++) {
    game[index].push({});
  }
}

render(game);

const spawnRandomBlocks = () => {
  if (game[1].some((c) => c?.color)) {
    document.removeEventListener('keydown', keyMap);
    clearInterval(runner);
  }

  const colors = ['rgb(197, 55, 55)', 'rgb(55, 100, 197)', 'rgb(55, 197, 62)', 'rgb(197, 183, 55)']; // Cores disponíveis
  const blocks = [];
  for (let i = 0; i < 2; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    blocks.push({ color, active: true });
  }
  game[0][4] = {...blocks[0], main: true, second: {row: 0, column: 5}, secondPos: 'right'};
  game[0][5] = {...blocks[1], main: false};
  return blocks;
};

const activeIndex = () => {
  let row = game.findIndex((r) => r.some((c) => c.main && c.active));
  const column = game[row].findIndex((c) => c.main && c.active);
  return {
    row,
    column
  };
}

const relativity = () => {
  const {row, column} = activeIndex();
  return game[row][column].secondPos;
}

const move = (from, to) => {
  if (exists(to.row, to.column) && isEmpty(to.row, to.column)) {
    game[to.row][to.column] = game[from.row][from.column];
    game[from.row][from.column] = {};
    render(game);
    return true;
  }
  return false;
}

const checkLocked = () => {
  let {row, column} = activeIndex();
  let main = game[row][column];

  if ('second' in main) {
    let {row: row2, column: column2} = main.second;
    let second = game[main.second.row][main.second.column];

    if (['top', 'bottom'].includes(main.secondPos)) {
      const biggerRow = row > row2 ? row : row2;
      if (!exists(biggerRow + 1, column) || !isEmpty(biggerRow + 1, column)) {
        second.active = false;
        main.active = false;
      }
    } else {
      if (!exists(row + 1, column) || !isEmpty(row + 1, column)) {
        main.active = false;
        second.main = true;
      }
      if (!exists(row2 + 1, column2) || !isEmpty(row2 + 1, column2)) {
        second.active = false;
        delete main.second;
      }
    }
  } else {
    if (!exists(row + 1, column) || !isEmpty(row + 1, column)) {
      main.active = false;
    }
  }
}

const rotate = () => {
  let {row, column} = activeIndex();
  let main = game[row][column];
  if (!'second' in main) return;
  let second = main.second;
  if (!second) return;
  let m = false;
  switch (relativity()) {
    case 'right':
      m = move({row: second.row, column: second.column}, {row: second.row + 1, column: second.column - 1});
      if (m) {
        main.secondPos = 'bottom';
        main.second = {row: second.row + 1, column: second.column - 1};
      }
      break;
    case 'bottom':
      m = move({row: second.row, column: second.column}, {row: second.row - 1, column: second.column - 1});
      if (m) {
        main.secondPos = 'left';
        main.second = {row: second.row - 1, column: second.column - 1};
      }
      break;
    case 'left':
      m = move({row: second.row, column: second.column}, {row: second.row - 1, column: second.column + 1});
      if (m) {
        main.secondPos = 'top';
        main.second = {row: second.row - 1, column: second.column + 1};
      }
      break;
    case 'top':
      m = move({row: second.row, column: second.column}, {row: second.row + 1, column: second.column + 1});
      if (m) {
        main.secondPos = 'right';
        main.second = {row: second.row + 1, column: second.column + 1};
      }
      break;
    default:
      break;
  }
  render(game);
}

const down = () => {
  let {row, column} = activeIndex();
  let main = game[row][column];

  if ('second' in main) {
    let {row: row2, column: column2} = main.second;
    if (['top', 'bottom'].includes(main.secondPos)) {
      if (main.secondPos == 'top') {
        game[row + 1][column] = game[row][column];
        game[row2 + 1][column2] = game[row2][column2];
        game[row2][column2] = {};
      } else {
        game[row2 + 1][column2] = game[row2][column2];
        game[row + 1][column] = game[row][column];
        game[row][column] = {};
      }
      main.second = {row: row2 + 1, column: column2};
    } else {
      game[row + 1][column] = game[row][column];
      game[row][column] = {};
      game[row2 + 1][column2] = game[row2][column2];
      game[row2][column2] = {};
      main.second = {row: row2 + 1, column: column2};
    }
  } else {
    game[row + 1][column] = game[row][column];
    game[row][column] = {};
  }

  render(game);
};

const left = () => {
  let {row, column} = activeIndex();
  let main = game[row][column];

  if ('second' in main) {
    let {row: row2, column: column2} = main.second;

    if (['left', 'right'].includes(main.secondPos)) {
      if (main.secondPos == 'right') {
        if (!exists(row, column - 1) || !isEmpty(row, column - 1)) {
          return;
        }
        game[row][column - 1] = game[row][column];
        game[row2][column2 - 1] = game[row2][column2];
        game[row2][column2] = {};
      } else {
        if (!exists(row2, column2 - 1) || !isEmpty(row2, column2 - 1)) {
          return;
        }
        game[row2][column2 - 1] = game[row2][column2];
        game[row][column - 1] = game[row][column];
        game[row][column] = {};
      }
      main.second = {row: row2, column: column2 - 1};
    } else {
      if (!exists(row, column - 1) || !isEmpty(row, column - 1)) {
        return;
      }
      if (!exists(row2, column2 - 1) || !isEmpty(row2, column2 - 1)) {
        return;
      }
      game[row][column - 1] = game[row][column];
      game[row][column] = {};
      game[row2][column2 - 1] = game[row2][column2];
      game[row2][column2] = {};
      main.second = {row: row2, column: column2  - 1};
    }
  } else {
    if (!exists(row, column - 1) || !isEmpty(row, column - 1)) {
      return;
    }
    game[row][column - 1] = game[row][column];
    game[row][column] = {};
  }

  render(game);
};

const right = () => {
  let {row, column} = activeIndex();
  let main = game[row][column];

  if ('second' in main) {
    let {row: row2, column: column2} = main.second;

    if (['left', 'right'].includes(main.secondPos)) {
      if (main.secondPos == 'left') {
        if (!exists(row, column + 1) || !isEmpty(row, column + 1)) {
          return;
        }
        game[row][column + 1] = game[row][column];
        game[row2][column2 + 1] = game[row2][column2];
        game[row2][column2] = {};
      } else {
        if (!exists(row2, column2 + 1) || !isEmpty(row2, column2 + 1)) {
          return;
        }
        game[row2][column2 + 1] = game[row2][column2];
        game[row][column + 1] = game[row][column];
        game[row][column] = {};
      }
      main.second = {row: row2, column: column2 + 1};
    } else {
      if (!exists(row, column + 1) || !isEmpty(row, column + 1)) {
        return;
      }
      if (!exists(row2, column2 + 1) || !isEmpty(row2, column2 + 1)) {
        return;
      }
      game[row][column + 1] = game[row][column];
      game[row][column] = {};
      game[row2][column2 + 1] = game[row2][column2];
      game[row2][column2] = {};
      main.second = {row: row2, column: column2  + 1};
    }
  } else {
    if (!exists(row, column + 1) || !isEmpty(row, column + 1)) {
      return;
    }
    game[row][column + 1] = game[row][column];
    game[row][column] = {};
  }

  render(game);
};

const spawn = () => {
  const active = game.findIndex((r) => r.some((c) => c.active));
  if (active === -1) {
    spawnRandomBlocks();
    render(game);
  }
}

const getBrothers = (row, column, capturados = []) => {
  let brothers = [];
  if (
    exists(row-1,column) &&
    !game[row-1][column]?.active &&
    !capturados.includes(JSON.stringify([row-1,column])) &&
    game[row-1][column]?.color === game[row][column].color) {
    brothers.push(JSON.stringify([row-1, column]));
  }
  if (
    exists(row+1,column) &&
    !game[row+1][column]?.active &&
    !capturados.includes(JSON.stringify([row+1,column])) &&
    game[row+1][column]?.color === game[row][column].color) {
    brothers.push(JSON.stringify([row+1, column]));
  }
  if (
    exists(row,column+1) &&
    !game[row][column+1]?.active &&
    !capturados.includes(JSON.stringify([row,column+1])) &&
    game[row][column+1]?.color === game[row][column].color) {
    brothers.push(JSON.stringify([row, column+1]));
  }
  if (
    exists(row,column-1) &&
    !game[row][column-1]?.active &&
    !capturados.includes(JSON.stringify([row,column-1])) &&
    game[row][column-1]?.color === game[row][column].color) {
    brothers.push(JSON.stringify([row, column-1]));
  }
  if (brothers.length===0) return capturados;
  let acumulado = [];
  for(coord of brothers) {
    const rc = JSON.parse(coord);
    acumulado = getBrothers(rc[0], rc[1], [...brothers, ...capturados]);
  }
  return acumulado;
}

const gravity = () => {
  for (row in game) {
    for (column in game[row]) {
      const pixel = game[row][column];
      if (pixel.color && !pixel.active && exists(+row+1,column)) {
        const bottom = game[+row + 1][column];
        if (!bottom.color){
          game[+row+1][column] = pixel;
          game[row][column] = {};
        }
      }
    }
  }
  return false;
}

const floating = () => {
  for (row in game) {
    for (column in game[row]) {
      const pixel = game[row][column];
      if (pixel.color && !pixel.active && exists(+row+1,column)) {
        const bottom = game[+row + 1][column];
        if (!bottom.color) return true;
      }
    }
  }
  return false;
}

const explode = () => {
  for (row in game) {
    for (column in game[row]) {
      const pixel = game[row][column];
      if (!pixel.color) continue;
      if (pixel.active) continue;
      const group = getBrothers(+row, +column, [JSON.stringify([+row, +column])]);
      if (group.length > 3) {
        for (coords of group) {
          const r = JSON.parse(coords)[0];
          const c = JSON.parse(coords)[1];
          game[r][c] = {};
        }
      }
    }
  }
  while (floating()) gravity();
  render(game);
}

spawnRandomBlocks();
render(game);

let started = false;
let gamePaused = false;
let runner = null;
const keyMap = (e) => {
  if (!started) {
    started = true;
    runner = setInterval(() => {
      if (gamePaused) return;
      down();
      checkLocked();
      spawn();
      explode();
    }, 1000);
    music.volume = 0.4;
    music.play();
  }
  switch (e.key) {
    case ' ':
      rotate();
      break;
    case 'Enter':
      rotate();
      break;
    case 'ArrowDown':
      down();
      break;
    case 'ArrowLeft':
      left();
      break;
    case 'ArrowRight':
      right();
      break;
    default:
      break;
  }
  checkLocked();
  spawn();
}

document.addEventListener('keydown', keyMap);

function pauseGame() {
    gamePaused = true;
    music.pause();
  }

  function resumeGame() {
    gamePaused = false;
    started && music.play();
}

window.addEventListener('blur', () => {
    pauseGame();
});

window.addEventListener('focus', () => {
    resumeGame();
});

window.addEventListener('beforeunload', () => {
    pauseGame();
});