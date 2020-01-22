'use strict'
var gBoard;
var BOMB = '💣';
var FLAG = '🚩';
var SAD = '😔';
var WIN = '😎';
var NORMAL = '😄';
var gGame = {
    isOn: false,
    shownCount: 0,
    markedBombsCount: 0,
    secsPassed: 0,
    gFirstClicked: false
}
var gInterval;
var gLevel = {
    SIZE: 0,
    MINES: 0
};


// function initGlobals() {
//     console.log("init globals");
//     gGame.isOn = false;
//     gGame.shownCount = 0;
//     gGame.markedBombsCount = 0;
//     gGame.shownCount = 0;
//     gGame.gFirstClicked = false;
//     console.log("isOn", gGame.isOn);

// }

function restartGame(){
    console.log("restart game");
    gGame ={
        isOn: false,
        shownCount: 0,
        markedBombsCount: 0,
        secsPassed: 0,
        gFirstClicked: false
    }
    document.querySelector('.timer').innerHTML = `<h2>0.000</h2>`;
    clearInterval(gInterval);

    console.log('gLevel.SIZE', gLevel.SIZE)
    if (gLevel.SIZE){
        document.querySelector('.restart').innerText = NORMAL;
        gBoard = createBoard(gLevel.SIZE);
        renderBoard(gBoard);

    }
    
}


function levelclickedHandler(elButton) {
    var size = elButton.dataset.size;
    var numesCount = elButton.dataset.mines;
    gLevel.SIZE = size;
    gLevel.MINES = numesCount;
    restartGame();
    // gBoard = createBoard(size);
    // renderBoard(gBoard);

}


function createBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            var cell = { isBomb: false, isRevealed: false, bombNegsCount: 0, isMarked: false }
            board[i][j] = cell;
        }
    }
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            board[i][j].bombNegsCount = countBombNegs(board, { i: i, j: j });
        }
    }
    randomllyPlaceBombs(board);
    console.table(board);
    return board;
}



function randomllyPlaceBombs(board) {
    var count = 0;
    while (count <= gLevel.MINES) {
        var row = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var col = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var cell = board[row][col]
        if (!cell.isBomb) {
            cell.isBomb = true;
            count++;
            console.log(`added bomb at index ${row}-${col} :${cell}`)
        }
    }


}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function renderBoard(board) {
    var strHtml = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHtml += '<tr>\n';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var text = '';
            var divClass = '';
            var cell = board[i][j];
            var id = `pos-${i}-${j}`;
            if (cell.isBomb) {
                text = BOMB;
                divClass += 'bomb ';
            }
            var text = (cell.isBomb) ? BOMB : countBombNegs(gBoard, { i: i, j: j });
            divClass += (!cell.isRevealed) ? 'hidden' : '';
            strHtml += `<td id = ${id} oncontextmenu="return false;" onmousedown = "cellClickedHandler(id, event)"><div class = "${divClass}">${text}</div></td>`
        }
        strHtml += '</tr>\n';
    }
    var elTbody = document.querySelector('tbody');
    elTbody.innerHTML = strHtml;
}



function countBombNegs(board, position) {
    var count = 0;
    var rowStart = position.i - 1;
    var rowEnd = position.i + 1;
    var colStart = position.j - 1;
    var colEnd = position.j + 1;
    for (var i = rowStart; i <= rowEnd; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colStart; j <= colEnd; j++) {
            if (j < 0 || j > board.length - 1) continue;
            if (i === position.i && j === position.j) continue;
            if (board[i][j].isBomb) count++;
        }

    }
    return count === 0 ? '' : '' + count;
}


function cellClickedHandler(id, event) {
    (event.button === 0) ? leftClickHandler(id) : rightClickHandler(id);
}


function leftClickHandler(id) {
    if (!gGame.gFirstClicked) {
        gInterval = setInterval(setTime, 1);
        gGame.gFirstClicked = true;
        gGame.isOn = true;
    }
    if (!gGame.isOn) return;

    //UPDATE DOM
    var elTd = document.querySelector(`#${id}`)
    elTd.style.backgroundColor = '#96d8d5';

    var elDiv = document.querySelector(`#${id} div`);
    elDiv.classList.remove('hidden');

    //UPDATE MODEL
    var position = getPositionFromClass(id);
    var cell = gBoard[position.i][position.j];
    cell.isRevealed = true;

    if (cell.isBomb) {
        gameOver();
    }
    else {
        gGame.shownCount++;
    }
    checkVictory();
}


function rightClickHandler(id) {
    var position = getPositionFromClass(id);
    var cell = gBoard[position.i][position.j];
    if (cell.isBomb === true) {
        gGame.markedBombsCount++;
    }
    cell.isMarked = true;
    var elTd = document.querySelector(`#${id}`)
    elTd.innerText = FLAG;
    checkVictory();

}

//className = pos-1-2
function getPositionFromClass(id) {
    var posArr = id.split('-');
    var position = {
        i: posArr[1],
        j: posArr[2]
    }
    return position;

}

function gameOver() {
    var bombs = document.querySelectorAll('.bomb');
    for (var i = 0; i < bombs.length; i++) {
        bombs[i].classList.remove('hidden');
    }
    document.querySelector('.restart').innerText = SAD;
    clearInterval(gInterval);
    document.querySelector('.timer h2').innerText = '0:000';
    gGame.isOn = false;


}

function checkVictory() {
    console.log("check victory")
    if (gGame.markedBombsCount + gGame.shownCount === gLevel.SIZE ** 2) {
        console.log("you win");
        document.querySelector('.restart').innerText = WIN;
        clearInterval(gInterval);

    }
}

function setTime() {
    gGame.secsPassed++;
    var elTimer = document.querySelector('.timer');
    var pretyTime = (gGame.secsPassed / 1000).toFixed(3);
    elTimer.innerHTML = `<h2>${pretyTime}</h2>`;
}

// function expandShown(board, elCell, i, j){
//     if(board[i][j].bombNegsCount === 0){
//         for
//     }

// }





