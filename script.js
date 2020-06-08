"use strict";

var huPlayer;
var aiPlayer;
var origBoard;

var winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [6, 4, 2],
  [2, 5, 8],
  [1, 4, 7],
  [0, 3, 6],
];

var symbolEle = document.getElementById("selectSym");
var gameEle = document.getElementById("container");
var endEle = document.getElementById("endGame");

var cells = document.querySelectorAll(".cell");
startGame();

function selectSym(sym) {
  huPlayer = sym;
  aiPlayer = sym === "X" ? "O" : "X";
  origBoard = Array.from(Array(9).keys());

  for (var i = 0; i < cells.length; i++) {
    cells[i].addEventListener("click", turnClick, false);
  }

  if (aiPlayer === "X") {
    turn(bestSpot(), aiPlayer);
  }

  symbolEle.style.display = "none";
  gameEle.style.display = "flex";
}

function startGame() {
  symbolEle.style.display = "flex";
  gameEle.style.display = "none";
  endEle.style.display = "none";

  for (var i = 0; i < cells.length; i++) {
    cells[i].innerText = "";
    cells[i].style.removeProperty("background-color");
  }

  for (var i = 0; i < cells.length; i++) {
    cells[i].addEventListener("click", turnClick, false);
  }
}

function turnClick(square) {
  if (typeof origBoard[square.target.id] === "number") {
    turn(square.target.id, huPlayer);
    if (!checkWin(origBoard, huPlayer) && !checkTie()) {
      turn(bestSpot(), aiPlayer);
    }
  }
}

function turn(squareId, player) {
  origBoard[squareId] = player;
  document.getElementById(squareId).innerHTML = player;
  var gameWon = checkWin(origBoard, player);
  if (gameWon) {
    gameOver(gameWon);
  }
  checkTie();
}

function checkWin(board, player) {
  var plays = board.reduce((a, e, i) => (e === player ? a.concat(i) : a), []);
  var gameWon = null;
  for (var [index, win] of winCombos.entries()) {
    if (win.every((elem) => plays.indexOf(elem) > -1)) {
      gameWon = { index: index, player: player };
      break;
    }
  }
  return gameWon;
}

function gameOver(gameWon) {
  for (var index of winCombos[gameWon.index]) {
    document.getElementById(index).style.backgroundColor =
      gameWon.player === huPlayer ? "blue" : "red";
  }
  for (var i = 0; i < cells.length; i++) {
    cells[i].removeEventListener("click", turnClick, false);
  }
  declareWinner(gameWon.player === huPlayer ? "You win!" : "You lose");
}

function declareWinner(who) {
  document.querySelector(".endGame").style.display = "flex";
  document.querySelector(".endGame .result").innerText = who;
}

function emptySquares() {
  return origBoard.filter((elm, i) => i === elm);
}

function bestSpot() {
  return minimax(origBoard, aiPlayer).index;
}

function checkTie() {
  if (emptySquares().length === 0) {
    for (var cell of cells) {
      cell.style.backgroundColor = "#BEE6F9";
      cell.removeEventListener("click", turnClick, false);
    }
    declareWinner("Tie game");
    return true;
  }
  return false;
}

function minimax(newBoard, player) {
  var availSpots = emptySquares(newBoard);

  if (checkWin(newBoard, huPlayer)) {
    return { score: -10 };
  } else if (checkWin(newBoard, aiPlayer)) {
    return { score: 10 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }

  var moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    var move = {};
    move.index = newBoard[availSpots[i]];
    newBoard[availSpots[i]] = player;

    if (player === aiPlayer) move.score = minimax(newBoard, huPlayer).score;
    else move.score = minimax(newBoard, aiPlayer).score;
    newBoard[availSpots[i]] = move.index;
    if (
      (player === aiPlayer && move.score === 10) ||
      (player === huPlayer && move.score === -10)
    )
      return move;
    else moves.push(move);
  }

  let bestMove, bestScore;
  if (player === aiPlayer) {
    bestScore = -1000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    bestScore = 1000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}
