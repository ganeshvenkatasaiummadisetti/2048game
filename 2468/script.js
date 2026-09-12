const boardSize = 4;
let score = 0;
const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));

const boardContainer = document.querySelector('.board');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');
let lastAdded = null;
const bestEl = document.getElementById('best');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-msg');

// Require login to play: redirect to login page when no current user
if (typeof getCurrentUser === 'function') {
    const current = getCurrentUser();
    if (!current) {
        window.location.href = 'login.html';
    }
}

// Touch swipe support
let touchStartX = 0;
let touchStartY = 0;

function showMessage(text, time = 2000) {
    if (!messageEl) return;
    messageEl.innerText = text;
    messageEl.style.display = 'block';
    setTimeout(() => (messageEl.style.display = 'none'), time);
}

function display() {
    if (!boardContainer) return;
    let index = 0;
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            let cell = boardContainer.children[index];
            let value = board[row][col];
            if (!cell) continue;
            cell.dataset.value = value;
            if (value === 0) {
                cell.innerText = '';
                cell.style.color = '';
                cell.style.backgroundColor = '';
                cell.className = 'tile';
            } else {
                cell.innerText = value;
                cell.style.color = value >= 128 ? 'white' : 'black';
                cell.style.backgroundColor = '';
                // use CSS preset class when available, fallback to computed color
                const cls = tileClassForValue(value);
                cell.className = 'tile ' + (cls || '');
                if (!cls) cell.style.backgroundColor = getTileColor(value);
            }
            index++;
        }
    }
    if (scoreEl) scoreEl.innerText = score;
    if (bestEl) bestEl.innerText = getBest();

    // animate newly added tile
    if (lastAdded && boardContainer.children.length === 16) {
        const idx = lastAdded.row * boardSize + lastAdded.col;
        const el = boardContainer.children[idx];
        if (el) {
            el.classList.add('tile--new');
            setTimeout(() => el.classList.remove('tile--new'), 260);
        }
        lastAdded = null;
    }
}

function assignRandom() {
    let emptyCells = [];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] === 0) emptyCells.push({ row: r, col: c });
        }
    }

    if (emptyCells.length === 0) {
        if (isGameOver()) {
            checkGameOverAndShow();
        }
        return;
    }

    let { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[row][col] = Math.random() > 0.9 ? 4 : 2;
    lastAdded = { row, col };
    return { row, col };
}

// Best score / best-tile handling (per-user when logged in)
function currentMaxTile() {
    let max = 0;
    for (let r = 0; r < boardSize; r++) for (let c = 0; c < boardSize; c++) if (board[r][c] > max) max = board[r][c];
    return max;
}

function getBest() {
    try {
        if (typeof getCurrentUser === 'function') {
            const cur = getCurrentUser();
            if (cur && typeof getUserBest === 'function') {
                const b = getUserBest(cur);
                if (b) return Number(b.bestTile || 0);
            }
        }
        return Number(localStorage.getItem('2048_best') || 0);
    } catch (e) {
        return 0;
    }
}

function setBestIfNeeded() {
    try {
        const maxTile = currentMaxTile();
        if (typeof getCurrentUser === 'function') {
            const cur = getCurrentUser();
            if (cur && typeof updateUserBest === 'function') {
                updateUserBest(cur, score, maxTile);
                const b = getUserBest(cur);
                if (bestEl) bestEl.innerText = b ? (b.bestTile || 0) : 0;
                return;
            }
        }
        // fallback: global best by score
        const best = Number(localStorage.getItem('2048_best') || 0);
        if (score > best) {
            localStorage.setItem('2048_best', String(score));
            if (bestEl) bestEl.innerText = score;
        } else {
            if (bestEl) bestEl.innerText = best;
        }
    } catch (e) {
        // ignore
    }
}

function compressRowLeft(row) {
    let arr = row.filter((v) => v !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] = arr[i] * 2;
            score += arr[i];
            arr.splice(i + 1, 1);
        }
    }
    while (arr.length < boardSize) arr.push(0);
    // after merges, update best
    afterScoreUpdate();
    return arr;
}

// after score changes, update best
function afterScoreUpdate() {
    setBestIfNeeded();
}

function moveLeft() {
    let changed = false;
    for (let r = 0; r < boardSize; r++) {
        const newRow = compressRowLeft(board[r]);
        if (newRow.some((v, i) => v !== board[r][i])) changed = true;
        board[r] = newRow;
    }
    return changed;
}

function moveRight() {
    let changed = false;
    for (let r = 0; r < boardSize; r++) {
        const reversed = [...board[r]].reverse();
        const newRow = compressRowLeft(reversed).reverse();
        if (newRow.some((v, i) => v !== board[r][i])) changed = true;
        board[r] = newRow;
    }
    return changed;
}

function transpose(mat) {
    return mat[0].map((_, c) => mat.map((r) => r[c]));
}

function moveUp() {
    let trans = transpose(board);
    let changed = false;
    for (let r = 0; r < boardSize; r++) {
        const newRow = compressRowLeft(trans[r]);
        if (newRow.some((v, i) => v !== trans[r][i])) changed = true;
        trans[r] = newRow;
    }
    if (changed) {
        const moved = transpose(trans);
        for (let r = 0; r < boardSize; r++) board[r] = moved[r];
    }
    return changed;
}

function moveDown() {
    let trans = transpose(board);
    let changed = false;
    for (let r = 0; r < boardSize; r++) {
        const newRow = compressRowLeft([...trans[r]].reverse()).reverse();
        if (newRow.some((v, i) => v !== trans[r][i])) changed = true;
        trans[r] = newRow;
    }
    if (changed) {
        const moved = transpose(trans);
        for (let r = 0; r < boardSize; r++) board[r] = moved[r];
    }
    return changed;
}

function handleMove(moveFn) {
    const moved = moveFn();
    if (moved) {
        assignRandom();
        display();
        setBestIfNeeded();
    } else {
        checkGameOverAndShow();
    }
}

window.addEventListener('keyup', (e) => {
    const moves = {
        ArrowUp: moveUp,
        ArrowDown: moveDown,
        ArrowLeft: moveLeft,
        ArrowRight: moveRight,
    };

    if (moves[e.key]) {
        e.preventDefault();
        handleMove(moves[e.key]);
    }
});

// Touch swipe support (basic)
if (boardContainer) {
    boardContainer.addEventListener('touchstart', (e) => {
        const t = e.changedTouches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
    }, {passive:true});

    boardContainer.addEventListener('touchend', (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const threshold = 30; // minimal swipe distance
        let moved = false;
        if (absX > absY && absX > threshold) {
            if (dx > 0) moved = moveRight(); else moved = moveLeft();
        } else if (absY > absX && absY > threshold) {
            if (dy > 0) moved = moveDown(); else moved = moveUp();
        }
        if (moved) {
            assignRandom();
            display();
            setBestIfNeeded();
        } else {
            checkGameOverAndShow();
        }
    }, {passive:true});
}

function getTileColor(value) {
    let hue = 220;
    let saturation = Math.min(100, (100 / 12) * Math.log2(value || 1));
    let lightness = Math.max(30, 100 - Math.log2(value || 1) * 12);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Assign CSS class for a tile value (used for color presets)
function tileClassForValue(value) {
    if (!value) return '';
    if (value <= 2048) return `tile--v${value}`;
    return 'tile--v2048';
}

function isGameOver() {
    // if any zero -> not over
    for (let r = 0; r < boardSize; r++) for (let c = 0; c < boardSize; c++) if (board[r][c] === 0) return false;
    // check merges
    for (let r = 0; r < boardSize; r++) for (let c = 0; c < boardSize - 1; c++) if (board[r][c] === board[r][c + 1]) return false;
    for (let c = 0; c < boardSize; c++) for (let r = 0; r < boardSize - 1; r++) if (board[r][c] === board[r + 1][c]) return false;
    return true;
}

function showModal(title, msg) {
    if (!modal) return;
    modalTitle.innerText = title;
    modalMsg.innerText = msg;
    modal.hidden = false;
}

function hideModal() {
    if (!modal) return;
    modal.hidden = true;
}

document.getElementById('modal-restart')?.addEventListener('click', () => { restart(); hideModal(); });
document.getElementById('modal-close')?.addEventListener('click', hideModal);

// show modal on game over
function checkGameOverAndShow() {
    if (isGameOver()) {
        showModal('Game Over', 'No more moves — try again!');
    }
}

function restart() {
    hideModal();
    for (let r = 0; r < boardSize; r++) for (let c = 0; c < boardSize; c++) board[r][c] = 0;
    score = 0;
    assignRandom();
    assignRandom();
    display();
}

document.getElementById('restart')?.addEventListener('click', restart);
// guard: remove any leftover register btn behavior
const regBtn = document.getElementById('registerBtn');
if (regBtn) regBtn.remove();

// Initialize
assignRandom();
assignRandom();
display();
