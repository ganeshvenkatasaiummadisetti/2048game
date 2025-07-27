const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
let board = [];
let score = 0;

document.getElementById("player-name").textContent = localStorage.getItem("username");

function initBoard() {
    board = Array.from({ length: 4 }, () => Array(4).fill(0));
    score = 0;
    addRandomTile();
    addRandomTile();
    drawBoard();
}

function addRandomTile() {
    let empty = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) empty.push({ x: i, y: j });
        }
    }
    if (empty.length > 0) {
        let { x, y } = empty[Math.floor(Math.random() * empty.length)];
        board[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
}

function drawBoard() {
    boardElement.innerHTML = "";
    board.forEach(row => {
        row.forEach(val => {
            const tile = document.createElement("div");
            tile.className = "tile";
            if (val !== 0) {
                tile.textContent = val;
                tile.setAttribute("data-value", val);
            } else {
                tile.textContent = "";
                tile.removeAttribute("data-value");
            }
            boardElement.appendChild(tile);
        });
    });
    scoreElement.textContent = `Score: ${score}`;
}

function slide(row) {
    row = row.filter(val => val);
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i];
            row[i + 1] = 0;
        }
    }
    row = row.filter(val => val);
    while (row.length < 4) row.push(0);
    return row;
}

function moveLeft() {
    let oldBoard = JSON.stringify(board);
    for (let i = 0; i < 4; i++) board[i] = slide(board[i]);
    if (JSON.stringify(board) !== oldBoard) {
        addRandomTile();
        drawBoard();
        checkGameOver();
    }
}

function moveRight() {
    let oldBoard = JSON.stringify(board);
    for (let i = 0; i < 4; i++) {
        board[i] = slide(board[i].reverse()).reverse();
    }
    if (JSON.stringify(board) !== oldBoard) {
        addRandomTile();
        drawBoard();
        checkGameOver();
    }
}

function moveUp() {
    let oldBoard = JSON.stringify(board);
    board = transpose(board);
    for (let i = 0; i < 4; i++) board[i] = slide(board[i]);
    board = transpose(board);
    if (JSON.stringify(board) !== oldBoard) {
        addRandomTile();
        drawBoard();
        checkGameOver();
    }
}

function moveDown() {
    let oldBoard = JSON.stringify(board);
    board = transpose(board);
    for (let i = 0; i < 4; i++) {
        board[i] = slide(board[i].reverse()).reverse();
    }
    board = transpose(board);
    if (JSON.stringify(board) !== oldBoard) {
        addRandomTile();
        drawBoard();
        checkGameOver();
    }
}

function transpose(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

function checkGameOver() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) return false;
            if (j < 3 && board[i][j] === board[i][j + 1]) return false;
            if (i < 3 && board[i][j] === board[i + 1][j]) return false;
        }
    }
    document.getElementById("final-score-text").textContent =
        `${localStorage.getItem("username")}, your final score is: ${score}`;
    document.getElementById("game-over-popup").style.display = "flex";
    return true;
}

function restartGame() {
    document.getElementById("game-over-popup").style.display = "none";
    initBoard();
}

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowLeft": moveLeft(); break;
        case "ArrowRight": moveRight(); break;
        case "ArrowUp": moveUp(); break;
        case "ArrowDown": moveDown(); break;
    }
});

initBoard();
