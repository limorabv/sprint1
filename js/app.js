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
    gIsFirstClicked: false,
    livesCount: 3
}
var gInterval;
var gLevel = {
    SIZE: 0,
    MINES: 0
}

var ghintsUsed = 0;




function restartGame() {
    console.log("restart game");
    gGame = {
        isOn: false,
        shownCount: 0,
        markedBombsCount: 0,
        secsPassed: 0,
        gIsFirstClicked: false,
        livesCount: 3

    }
    ghintsUsed = 0;
    document.querySelector('.timer').innerHTML = `<h2>0.000</h2>`;
    clearInterval(gInterval);
    var elHintButtons = document.querySelectorAll('.hints button');
    for (var i=0; i<elHintButtons.length; i++){
        elHintButtons[i].classList.remove('hidden')
    }
    if (gLevel.SIZE) {
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
    console.table(board);
    return board;
}



function randomllyPlaceBombs(board, id) {
    var count = 0;
    var clickedId = getPositionFromClass(id)
    while (count <= gLevel.MINES) {
        var row = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var col = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var cell = board[row][col]
        if (!cell.isBomb && !(clickedId.i === row && clickedId.j === col)) {
            cell.isBomb = true;
            // cell.bombNegsCount = -1;
            count++;
            console.log(`added bomb at index ${row}-${col} :${cell}`)
        }
    }
}


function renderBombs(){
    console.log("inside render")
    for(var i =0; i<gBoard.length; i++){
        for(var j=0; j<gBoard.length; j++){
            var cell = gBoard[i][j];
            var query = `#pos-${i}-${j} div`;
            if(cell.isBomb){
                document.querySelector(query).innerText = BOMB;
                document.querySelector(query).classList.add('bomb');
            }else if (cell.bombNegsCount){
                document.querySelector(query).innerText = cell.bombNegsCount;

            }
        }
    }
}


function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function renderBoard(board) {
    console.log("rendering bombs");
    var strHtml = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHtml += '<tr>\n';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var divClass = '';
            var cell = board[i][j];
            console.log("cell", cell)
            var id = `pos-${i}-${j}`;
            // var text = (cell.isBomb) ? BOMB : countBombNegs(gBoard, { i: i, j: j });
            divClass += (!cell.isRevealed) ? 'hidden' : '';
            strHtml += `<td id = ${id} oncontextmenu="return false;" onmousedown = "cellClickedHandler(id, event)"><div data-i="${i}" data-j= "${j}" class = "${divClass}"></div></td>`
        }
        strHtml += '</tr>\n';
    }
    var elTbody = document.querySelector('tbody');
    elTbody.innerHTML = strHtml;
}




function countBombNegs(board, position) {
    var res = ''
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
    if (count !== 0) {
        res += count
    }
    return res
}


function cellClickedHandler(id, event) {
    var clickedId = getPositionFromClass(id);
    var cell = gBoard[clickedId.i][clickedId.j];
    if(cell.isRevealed) return;
    (event.button === 0) ? leftClickHandler(id) : rightClickHandler(id);
}


function leftClickHandler(id) {
    if (!gGame.gIsFirstClicked) {
        randomllyPlaceBombs(gBoard, id);
        //update bomb count for each cell object
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                gBoard[i][j].bombNegsCount = +countBombNegs(gBoard, { i: i, j: j });
                console.log("after randombomb", gBoard[i][j])
            }
        }
        console.log("finished placing bombs")
        renderBombs();
        console.log("finished renderring bombs")
        gInterval = setInterval(setTime, 1);
        gGame.gIsFirstClicked = true;
        gGame.isOn = true;
    }

    var position = getPositionFromClass(id);
    var cell = gBoard[position.i][position.j];
    if (!gGame.isOn || cell.isRevealed) return;
    if (+cell.bombNegsCount === 0 && !cell.isBomb) {
        console.log("000000000000");
        expandShown(gBoard, position.i, position.j)
    }
    cell.isRevealed = true;
//UPDATE DOM
    var elTd = document.querySelector(`#${id}`)
    elTd.style.backgroundColor = '#96d8d5';

    var elDiv = document.querySelector(`#${id} div`);
    elDiv.classList.remove('hidden');

    if (cell.isBomb) {
        console.log("tries: ", gGame.livesCount);
        if(gGame.livesCount !== 0) {
            gGame.livesCount --;
            console.log("lives", gGame.livesCount);
            gGame.shownCount ++;
            alert (`Hit a bomb, ${gGame.livesCount} lives left`);
        } else gameOver();
        
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
    var elTd = document.querySelector(`#${id} div`)
    // elTd.dataset.prev = elTd.innerText;
    elTd.innerText = FLAG;
    elTd.classList.remove('hidden');
    elTd.classList.add('flag')

    checkVictory();
}



//className = pos-1-2
function getPositionFromClass(id) {
    var posArr = id.split('-');
    var position = {
        i: +posArr[1],
        j: +posArr[2]
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
    if (gGame.markedBombsCount + gGame.shownCount === gLevel.SIZE ** 2) {
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





function expandShown(board, i, j) {
    console.log('clicked');
    var row = i;
    var col = j;
    console.log(` begin:i: ${row} j: ${col}`)
    var startRow = row - 1;
    var endRow = row + 2;
    var startCol = col - 1;
    var endCol = col + 2;
    for (var i = startRow; i < endRow; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = startCol; j < endCol; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if(i === row && j === col) continue;
            var cell = board[i][j];
            console.log("cell expend", cell);
            if (!cell.isRevealed ){
                document.querySelector(`#pos-${i}-${j}`).style.backgroundColor = '#96d8d5';
                document.querySelector(`#pos-${i}-${j} div`).classList.remove('hidden');
                cell.isRevealed =true;
                gGame.shownCount ++;
              
            }
            
        }
    }
}

function hintClickedHandler(){
    if(ghintsUsed < 3) {
        document.querySelector(`#hint${ghintsUsed}`).classList.add('hidden');
        var safeCells = document.querySelectorAll('.hidden:not(.bomb)');
        var randomPosition  = getRandomIntInclusive(0, safeCells.length-1);
        var elDiv = document.querySelectorAll('.hidden:not(.bomb)')[randomPosition];
        var row = +elDiv.dataset.i;
        var col = +elDiv.dataset.j;
        for(var i = row - 1; i< row + 2; i++){
            if (i < 0 || i >= gBoard.length) continue;
            for(var j = col - 1; j < col + 2; j++){
                if (j < 0 || j >= gBoard[0].length) continue;
                if(gBoard[i][j].isRevealed) continue;
                var elDiv = document.querySelector(`#pos-${i}-${j} div`)
                if (elDiv.classList.contains('flag')){
                    if(gBoard[i][j].isBomb){
                        elDiv.innerText = BOMB;
                    } else if(gBoard[i][j].bombNegsCount){
                        elDiv.innerText = gBoard[i][j].bombNegsCount;
                    }else{
                        elDiv.innerText = '';
                    }
                    
                }  
                elDiv.parentNode.style.backgroundColor = 'beige';
                elDiv.classList.remove('hidden');
                elDiv.classList.add('exposed');    
         
            }
        }
    
        setTimeout(function(){
            var exposedCells = document.querySelectorAll('.exposed');
            for(var i = 0; i<exposedCells.length; i++){
                exposedCells[i].parentNode.style.backgroundColor = 'white';
                if(!exposedCells[i].classList.contains('flag')){
                    exposedCells[i].classList.add('hidden');
                 }else{
                    exposedCells[i].innerText = FLAG;
                 }
                exposedCells[i].classList.remove('exposed');
                if(exposedCells[i].classList.contains('wasMarked')){
                    exposedCells[i].innerText = FLAG;
                }
            }
        },2000)
        ghintsUsed ++;
    }
}





