import { Client } from 'boardgame.io/react';
import { Game } from 'boardgame.io/core';

import { AI } from 'boardgame.io/ai';

import CamelotBoard from './Board.js';

function IsVictory(cells) {
    return false;
}

function IsDraw(cells) {
    return cells.filter(c => c === null).length === 0;
}

function getCellsSetup() {
    let cells = Array(192).fill(null);
    let disabledCells = [0, 1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 35, 156, 167, 168, 169, 178, 179, 180, 181, 182, 183, 184, 187, 188, 189, 190, 191];
    let blackKnights = [62, 69, 75, 80];
    let blackPawns = [63, 64, 65, 66, 67, 68, 76, 77, 78, 79];
    let whiteKnights = [111, 116, 122, 129];
    let whitePawns = [112, 113, 114, 115, 123, 124, 125, 126, 127, 128];
    for (let i = 0; i < disabledCells.length; i++) {
        cells[disabledCells[i]] = false;
    }
    for (let i = 0; i < blackKnights.length; i++) {
        cells[blackKnights[i]] = 'BK';
    }
    for (let i = 0; i < blackPawns.length; i++) {
        cells[blackPawns[i]] = 'BP';
    }
    for (let i = 0; i < whiteKnights.length; i++) {
        cells[whiteKnights[i]] = 'WK';
    }
    for (let i = 0; i < whitePawns.length; i++) {
        cells[whitePawns[i]] = 'WP';
    }
    return cells;
}

const TicTacToe = Game({
    setup: () => {
        let cells = getCellsSetup();
        return {
            cells: cells
        }
    },

    moves: {
        clickCell(G, ctx, id) {
            G.cells[id] = ctx.currentPlayer;
        },
    },

    flow: {
        movesPerTurn: 1,
        endGameIf: (G, ctx) => {
            var ws = IsVictory(G.cells);
            if (ws !== false) {
                return { winner: ctx.currentPlayer, highlight: ws };
            }
            if (IsDraw(G.cells)) {
                return { winner: false }
            }
        }
    }
});

const App = Client({
    game: TicTacToe,
    board: CamelotBoard,

    ai: AI({
      enumerate: (G, ctx) => {
        let moves = [];
        for (let i = 0; i < 9; i++) {
            if (G.cells[i] === null) {
                moves.push({ move: 'clickCell', args: [i] });
            }
        }
        return moves;
      },
    }),
});

export default App;
