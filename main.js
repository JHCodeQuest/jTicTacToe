const gameBoard = document.getElementById("gameBoard");

const settingsPanel = document.createElement("div");
settingsPanel.id = "settingsPanel";

const modeSelect = document.createElement("select");
modeSelect.id = "modeSelect";
modeSelect.innerHTML = '<option value="pve">Player vs AI</option><option value="pvp">Player vs Player</option>';

const difficultySelect = document.createElement("select");
difficultySelect.id = "difficultySelect";
difficultySelect.innerHTML = '<option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>';

const playerSymbolSelect = document.createElement("select");
playerSymbolSelect.id = "playerSymbolSelect";
playerSymbolSelect.innerHTML = '<option value="X">Play as X</option><option value="O">Play as O</option>';

const coinFlipToggle = document.createElement("input");
coinFlipToggle.type = "checkbox";
coinFlipToggle.id = "coinFlipToggle";
coinFlipToggle.checked = true;
const coinFlipLabel = document.createElement("label");
coinFlipLabel.htmlFor = "coinFlipToggle";
coinFlipLabel.textContent = "Coin flip";

const darkModeToggle = document.createElement("input");
darkModeToggle.type = "checkbox";
darkModeToggle.id = "darkModeToggle";
darkModeToggle.checked = false;
const darkModeLabel = document.createElement("label");
darkModeLabel.htmlFor = "darkModeToggle";
darkModeLabel.textContent = "Dark mode";

const settingsLabel = document.createElement("span");
settingsLabel.textContent = "Settings:";
settingsLabel.className = "settingsLabel";

settingsPanel.appendChild(settingsLabel);
settingsPanel.appendChild(modeSelect);

const difficultyLabel = document.createElement("span");
difficultyLabel.textContent = "Difficulty:";
difficultyLabel.className = "settingsLabel";
settingsPanel.appendChild(difficultyLabel);
settingsPanel.appendChild(difficultySelect);

const symbolLabel = document.createElement("span");
symbolLabel.textContent = "Symbol:";
symbolLabel.className = "settingsLabel";
settingsPanel.appendChild(symbolLabel);
settingsPanel.appendChild(playerSymbolSelect);

const coinLabel = document.createElement("span");
coinLabel.textContent = "Coin flip:";
coinLabel.className = "settingsLabel";
settingsPanel.appendChild(coinFlipToggle);
settingsPanel.appendChild(coinLabel);

const darkLabel = document.createElement("span");
darkLabel.textContent = " Dark:";
darkLabel.className = "settingsLabel";
settingsPanel.appendChild(darkModeToggle);
settingsPanel.appendChild(darkLabel);

const statsPanel = document.createElement("div");
statsPanel.id = "statsPanel";

const turnDisplay = document.createElement("div");
turnDisplay.id = "turnDisplay";

const scoreDisplay = document.createElement("div");
scoreDisplay.id = "scoreDisplay";

const streakDisplay = document.createElement("div");
streakDisplay.id = "streakDisplay";

const coinFlipPrompt = document.createElement("div");
coinFlipPrompt.id = "coinFlipPrompt";

const coinFlipButtons = document.createElement("div");
coinFlipButtons.id = "coinFlipButtons";

const headsButton = document.createElement("button");
headsButton.textContent = "Heads";

const tailsButton = document.createElement("button");
tailsButton.textContent = "Tails";

const restartButton = document.createElement("button");
restartButton.textContent = "Restart";

const newGameButton = document.createElement("button");
newGameButton.textContent = "New Game";

coinFlipButtons.appendChild(headsButton);
coinFlipButtons.appendChild(tailsButton);

document.body.insertBefore(settingsPanel, gameBoard);
document.body.insertBefore(statsPanel, gameBoard);
document.body.insertBefore(turnDisplay, gameBoard);
document.body.insertBefore(scoreDisplay, gameBoard);
document.body.insertBefore(streakDisplay, gameBoard);
document.body.insertBefore(coinFlipPrompt, gameBoard);
document.body.insertBefore(coinFlipButtons, gameBoard);
document.body.insertBefore(restartButton, gameBoard);
document.body.insertBefore(newGameButton, gameBoard);

let currentPlayer = "X";
const cells = [];
let gameStarted = false;
let moveCount = 0;
let gameOver = false;
let lastMoveIndex = -1;
let gameMode = "pve";
let difficulty = "easy";
let playerSymbol = "X";
let aiSymbol = "O";
let showCoinFlip = true;
let darkMode = false;
let playerWins = 0;
let aiWins = 0;
let draws = 0;
let playerStreak = 0;
let aiStreak = 0;
let p1Wins = 0;
let p2Wins = 0;

const winStreakMessages = [
    "On fire!",
    "Unstoppable!",
    "Legendary!",
    "Incredible!",
    "Amazing!",
    "You're a god!"
];

const stats = {
    easy: { wins: 0, losses: 0, draws: 0 },
    medium: { wins: 0, losses: 0, draws: 0 },
    hard: { wins: 0, losses: 0, draws: 0 }
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playSound = (type) => {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        if (type === "move") {
            osc.frequency.value = 440;
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === "win") {
            osc.frequency.value = 523;
            osc.type = "sine";
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            osc.start();
            for (let i = 0; i < 3; i++) {
                osc.frequency.setValueAtTime(523 * (1 + i * 0.2), audioCtx.currentTime + i * 0.15);
            }
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.stop(audioCtx.currentTime + 0.5);
        } else if (type === "lose") {
            osc.frequency.value = 200;
            osc.type = "sawtooth";
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } else if (type === "draw") {
            osc.frequency.value = 300;
            osc.type = "square";
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        }
    } catch (e) {}
};

for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    gameBoard.appendChild(cell);
    cells.push(cell);
}

const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const getAvailableCells = () => cells.filter((cell) => cell.textContent === "");
const getAvailableIndices = () => getAvailableCells().map(cell => parseInt(cell.dataset.index));

const findWinningMove = (player) => {
    for (const [a, b, c] of winningLines) {
        const vals = [cells[a].textContent, cells[b].textContent, cells[c].textContent];
        const filled = vals.filter(v => v === player).length;
        const empty = vals.filter(v => v === "").length;
        if (filled === 2 && empty === 1) {
            if (vals[0] === "") return a;
            if (vals[1] === "") return b;
            if (vals[2] === "") return c;
        }
    }
    return -1;
};

const findForkMove = (player) => {
    let forkCount = 0;
    let forkIndex = -1;
    for (let i = 0; i < 9; i++) {
        if (cells[i].textContent === "") {
            let winningLinesForCell = 0;
            for (const [a, b, c] of winningLines) {
                if ([a, b, c].includes(i)) {
                    const vals = [cells[a].textContent, cells[b].textContent, cells[c].textContent];
                    const filled = vals.filter(v => v === player).length;
                    const empty = vals.filter(v => v === "").length;
                    if (filled === 1 && empty === 2) {
                        winningLinesForCell++;
                    }
                }
            }
            if (winningLinesForCell >= 2) {
                return i;
            }
        }
    }
    return -1;
};

const minimax = (board, depth, isMaximizing) => {
    const winner = checkWinnerQuiet();
    if (winner === aiSymbol) return 10 - depth;
    if (winner === playerSymbol) return depth - 10;
    if (getAvailableCells().length === 0) return 0;
    
    if (isMaximizing) {
        let best = -Infinity;
        for (const cell of getAvailableCells()) {
            cell.textContent = aiSymbol;
            const score = minimax(board, depth + 1, false);
            cell.textContent = "";
            best = Math.max(best, score);
        }
        return best;
    } else {
        let best = Infinity;
        for (const cell of getAvailableCells()) {
            cell.textContent = playerSymbol;
            const score = minimax(board, depth + 1, true);
            cell.textContent = "";
            best = Math.min(best, score);
        }
        return best;
    }
};

const checkWinnerQuiet = () => {
    for (const [a, b, c] of winningLines) {
        const value = cells[a].textContent;
        if (value && value === cells[b].textContent && value === cells[c].textContent) {
            return value;
        }
    }
    return null;
};

const playAIMove = () => {
    if (gameOver || gameMode === "pvp") return;
    
    const available = getAvailableIndices();
    if (available.length === 0) return;
    
    let move = -1;
    
    if (difficulty === "easy") {
        const loseWarning = findWinningMove(playerSymbol);
        if (loseWarning !== -1) {
            cells[loseWarning].classList.add("danger");
        }
        move = available[Math.floor(Math.random() * available.length)];
    } else if (difficulty === "medium") {
        const winMove = findWinningMove(aiSymbol);
        const blockMove = findWinningMove(playerSymbol);
        
        if (winMove !== -1) move = winMove;
        else if (blockMove !== -1) move = blockMove;
        else if (available.includes(4)) move = 4;
        else {
            const corners = [0, 2, 6, 8].filter(i => available.includes(i));
            if (corners.length > 0) move = corners[Math.floor(Math.random() * corners.length)];
            else move = available[Math.floor(Math.random() * available.length)];
        }
    } else if (difficulty === "hard") {
        const winMove = findWinningMove(aiSymbol);
        const blockMove = findWinningMove(playerSymbol);
        const forkMove = findForkMove(aiSymbol);
        
        if (winMove !== -1) move = winMove;
        else if (forkMove !== -1) move = forkMove;
        else if (blockMove !== -1) {
            const center = 4;
            if (available.includes(center)) move = center;
            else move = blockMove;
        } else if (available.includes(4)) {
            move = 4;
        } else {
            const corners = [0, 2, 6, 8].filter(i => available.includes(i));
            if (corners.length > 0) {
                move = corners[Math.floor(Math.random() * corners.length)];
            } else {
                let best = -Infinity;
                for (const idx of available) {
                    cells[idx].textContent = aiSymbol;
                    const score = minimax(cells, 0, false);
                    cells[idx].textContent = "";
                    if (score > best) {
                        best = score;
                        move = idx;
                    }
                }
            }
        }
    }
    
    if (move !== -1) {
        makeMove(cells[move], aiSymbol);
    }
};

const makeMove = (cell, player) => {
    cell.textContent = player;
    cell.classList.add("placed");
    if (lastMoveIndex !== -1) {
        cells[lastMoveIndex].classList.remove("last");
    }
    lastMoveIndex = parseInt(cell.dataset.index);
    cells[lastMoveIndex].classList.add("last");
    playSound("move");
    moveCount++;
    
    if (checkWinner()) return;
    
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateTurnDisplay();
    
    if (gameMode === "pve" && currentPlayer === aiSymbol && !gameOver) {
        setTimeout(playAIMove, 350);
    }
};

const checkWinner = () => {
    for (const [a, b, c] of winningLines) {
        const value = cells[a].textContent;
        if (value && value === cells[b].textContent && value === cells[c].textContent) {
            cells[a].classList.add("win");
            cells[b].classList.add("win");
            cells[c].classList.add("win");
            
            if (gameMode === "pve") {
                if (value === playerSymbol) {
                    endGame("You win!", "win");
                } else {
                    endGame("AI wins!", "lose");
                }
            } else {
                endGame(value === "X" ? "Player 1 wins!" : "Player 2 wins!", value === "X" ? "p1" : "p2");
            }
            return true;
        }
    }
    
    if (getAvailableCells().length === 0) {
        endGame("It's a draw!", "draw");
        return true;
    }
    return false;
};

const endGame = (message, result) => {
    gameOver = true;
    turnDisplay.textContent = message;
    playSound(result === "win" ? "win" : result === "lose" ? "lose" : "draw");
    
    if (gameMode === "pve") {
        if (result === "win") {
            playerWins++;
            playerStreak++;
            aiStreak = 0;
            stats[difficulty].wins++;
            const msg = winStreakMessages[Math.min(playerStreak - 1, winStreakMessages.length - 1)];
            if (playerStreak >= 3) {
                streakDisplay.textContent = `${msg} ${playerStreak} in a row!`;
            }
        } else if (result === "lose") {
            aiWins++;
            aiStreak++;
            playerStreak = 0;
            stats[difficulty].losses++;
        } else {
            draws++;
            stats[difficulty].draws++;
            playerStreak = 0;
            aiStreak = 0;
        }
    } else {
        if (result === "p1") {
            p1Wins++;
        } else {
            p2Wins++;
        }
    }
    updateScore();
};

const updateTurnDisplay = () => {
    if (gameOver) return;
    if (gameMode === "pve") {
        turnDisplay.textContent = currentPlayer === playerSymbol 
            ? `Move ${moveCount + 1}: Your turn (${currentPlayer})`
            : `Move ${moveCount + 1}: AI turn (${currentPlayer})`;
    } else {
        turnDisplay.textContent = `Move ${moveCount + 1}: Player ${currentPlayer === "X" ? "1" : "2"}'s turn (${currentPlayer})`;
    }
};

const updateScore = () => {
    if (gameMode === "pve") {
        scoreDisplay.textContent = `Score - You: ${playerWins} | AI: ${aiWins} | Draws: ${draws}`;
    } else {
        scoreDisplay.textContent = `P1: ${p1Wins} | P2: ${p2Wins} | Draws: ${draws}`;
    }
};

const updateStats = () => {
    const statsHTML = `
        <div class="stats-grid">
            <div class="stats-col">
                <div class="stats-title">Easy</div>
                <div>W: ${stats.easy.wins} L: ${stats.easy.losses} D: ${stats.easy.draws}</div>
            </div>
            <div class="stats-col">
                <div class="stats-title">Medium</div>
                <div>W: ${stats.medium.wins} L: ${stats.medium.losses} D: ${stats.medium.draws}</div>
            </div>
            <div class="stats-col">
                <div class="stats-title">Hard</div>
                <div>W: ${stats.hard.wins} L: ${stats.hard.losses} D: ${stats.hard.draws}</div>
            </div>
        </div>
    `;
    statsPanel.innerHTML = statsHTML;
};

const saveStats = () => {
    const data = {
        stats, playerWins, aiWins, draws, playerStreak, aiStreak,
        gameMode, difficulty, playerSymbol, showCoinFlip, darkMode,
        p1Wins, p2Wins
    };
    localStorage.setItem("tictactoe_stats", JSON.stringify(data));
};

const loadStats = () => {
    try {
        const data = JSON.parse(localStorage.getItem("tictactoe_stats"));
        if (data) {
            Object.assign(stats, data.stats || stats);
            playerWins = data.playerWins || 0;
            aiWins = data.aiWins || 0;
            draws = data.draws || 0;
            playerStreak = data.playerStreak || 0;
            aiStreak = data.aiStreak || 0;
            gameMode = data.gameMode || "pve";
            difficulty = data.difficulty || "easy";
            playerSymbol = data.playerSymbol || "X";
            showCoinFlip = data.showCoinFlip !== false;
            darkMode = data.darkMode || false;
            p1Wins = data.p1Wins || 0;
            p2Wins = data.p2Wins || 0;
            
            modeSelect.value = gameMode;
            difficultySelect.value = difficulty;
            playerSymbolSelect.value = playerSymbol;
            coinFlipToggle.checked = showCoinFlip;
            darkModeToggle.checked = darkMode;
            
            if (darkMode) {
                document.body.classList.add("dark");
            }
        }
    } catch (e) {}
};

const startGame = (coinResult = null) => {
    gameStarted = true;
    gameOver = false;
    moveCount = 0;
    lastMoveIndex = -1;
    playerStreak = 0;
    aiStreak = 0;
    streakDisplay.textContent = "";
    
    difficultySelect.disabled = gameMode === "pvp";
    
    if (coinResult !== null) {
        const playerWinsFlip = coinResult === "heads" && playerSymbol === "X" || 
                           coinResult === "tails" && playerSymbol === "O";
        currentPlayer = showCoinFlip ? (playerWinsFlip ? playerSymbol : aiSymbol) : playerSymbol;
    } else {
        currentPlayer = playerSymbol;
    }
    
    if (!showCoinFlip) {
        coinFlipPrompt.style.display = "none";
        coinFlipButtons.style.display = "none";
    }
    
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("win", "last", "danger", "placed");
    });
    
    restartButton.disabled = false;
    updateTurnDisplay();
    updateScore();
    updateStats();
    saveStats();
    
    if (gameMode === "pve" && currentPlayer === aiSymbol) {
        difficultySelect.disabled = true;
        setTimeout(playAIMove, 350);
    } else {
        difficultySelect.disabled = gameMode === "pvp";
    }
};

const resetGame = () => {
    gameStarted = false;
    gameOver = false;
    moveCount = 0;
    lastMoveIndex = -1;
    currentPlayer = "X";
    
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("win", "last", "danger", "placed");
    });
    
    restartButton.disabled = true;
    
    if (showCoinFlip || gameMode === "pvp") {
        coinFlipPrompt.textContent = gameMode === "pvp" 
            ? "Player 1 starts" 
            : "Pick heads or tails to see who goes first.";
        coinFlipPrompt.style.display = "block";
        coinFlipButtons.style.display = "flex";
    }
    
    turnDisplay.textContent = gameMode === "pvp" 
        ? "Player 1 starts" 
        : "Pick heads or tails to see who goes first.";
        
    difficultySelect.disabled = false;
};

const handleClick = (event) => {
    if (!event.target.classList.contains("cell")) return;
    
    const cell = event.target;
    if (!gameStarted || gameOver || cell.textContent !== "") return;
    
    if (gameMode === "pve") {
        if (currentPlayer !== playerSymbol) return;
        makeMove(cell, playerSymbol);
    } else {
        makeMove(cell, currentPlayer);
    }
};

modeSelect.addEventListener("change", () => {
    gameMode = modeSelect.value;
    if (gameMode === "pvp") {
        diffiultySelect.style.display = "none";
        playerSymbolSelect.style.display = "none";
    } else {
        difficultySelect.style.display = "inline-block";
        playerSymbolSelect.style.display = "inline-block";
    }
    resetGame();
    startGame();
});

difficultySelect.addEventListener("change", () => {
    difficulty = difficultySelect.value;
    resetGame();
    startGame();
});

playerSymbolSelect.addEventListener("change", () => {
    playerSymbol = playerSymbolSelect.value;
    aiSymbol = playerSymbol === "X" ? "O" : "X";
    resetGame();
    startGame();
});

coinFlipToggle.addEventListener("change", () => {
    showCoinFlip = coinFlipToggle.checked;
    if (showCoinFlip) {
        coinFlipPrompt.style.display = "block";
        coinFlipButtons.style.display = "flex";
    } else {
        coinFlipPrompt.style.display = "none";
        coinFlipButtons.style.display = "none";
    }
    saveStats();
});

darkModeToggle.addEventListener("change", () => {
    darkMode = darkModeToggle.checked;
    document.body.classList.toggle("dark", darkMode);
    saveStats();
});

headsButton.addEventListener("click", () => {
    const coin = Math.random() < 0.5 ? "heads" : "tails";
    coinFlipPrompt.textContent = `Coin: ${coin}`;
    setTimeout(() => startGame(coin), 500);
});

tailsButton.addEventListener("click", () => {
    const coin = Math.random() < 0.5 ? "heads" : "tails";
    coinFlipPrompt.textContent = `Coin: ${coin}`;
    setTimeout(() => startGame(coin), 500);
});

restartButton.addEventListener("click", resetGame);
newGameButton.addEventListener("click", () => {
    resetGame();
    startGame();
});

gameBoard.addEventListener("click", handleClick);

loadStats();
updateStats();
updateScore();
if (!showCoinFlip || gameMode === "pvp") {
    coinFlipPrompt.style.display = "none";
    coinFlipButtons.style.display = "none";
}
if (gameMode === "pvp") {
    difficultySelect.style.display = "none";
    playerSymbolSelect.style.display = "none";
}
turnDisplay.textContent = gameMode === "pvp" 
    ? "Player 1 starts" 
    : "Pick heads or tails to see who goes first.";
if (darkMode) {
    document.body.classList.add("dark");
}