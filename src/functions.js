import { pieces } from './Game.js'
import { basicOffsets } from './Game.js'

export function isMyPiece(props, gridID) {
    switch (props.G.cells[gridID]) {
        case pieces.WHITE_KNIGHT:
        case pieces.WHITE_PAWN:
            return props.playerID === "0"
        case pieces.BLACK_KNIGHT:
        case pieces.BLACK_PAWN:
            return props.playerID === "1"
        default:
            return false;
    }
}

export function isInOwnCastle(props) {
    if (props.playerID === "0") {
        return isMyPiece(props, 32);
    } else {
        return isMyPiece(props, 2);
    }
}

export function canCaptureOutOfOwnCastle(props) {
    if (props.playerID === "0") {
        if (isMyPiece(props, 32) && canCapture(props, 32)) {
            return true;
        }
    } else {
        if (isMyPiece(props, 2) && canCapture(props, 2)) {
            return true;
        }
    }
    return false;
}

// Returns true if the piece at the given gridID is able to make any captures.
export function canCapture(props, gridID) {
    let grid = props.G.cells;
    if (grid[gridID] === null) {
        return false;
    }
    if (gridID === 2) { // pieces cannot leave the enemy castle, not even for capturing.
        if (grid[gridID] === pieces.WHITE_KNIGHT || grid[gridID] === pieces.WHITE_PAWN) {
            return false;
        }
    } else if (gridID === 32) { // pieces cannot leave the enemy castle, not even for capturing.
        if (grid[gridID] === pieces.BLACK_KNIGHT || grid[gridID] === pieces.BLACK_PAWN) {
            return false;
        }
    }
    for (var i = 0; i < basicOffsets.length; i++) {
        let adjacentGridID = gridID + basicOffsets[i];
        let adjacentCellContent = grid[adjacentGridID];
        let myCol = gridID % 5;
        let adjacentCol = adjacentGridID % 5;
        if (Math.abs(myCol - adjacentCol) > 2) { // don't loop over the sides
            continue;
        }
        if (adjacentCellContent !== null && !isMyPiece(props, adjacentGridID)) {
            let jumpDestGridID = gridID + (2 * basicOffsets[i]);
            let jumpDestCellContent = grid[jumpDestGridID];
            let jumpDestCol = jumpDestGridID % 5;
            if (Math.abs(jumpDestCol - adjacentCol) > 2) { // don't loop over the sides here either
                continue;
            }
            if (jumpDestCellContent === null) {
                return true;
            }
        }
    }
    return false;
}

// Returns true if the current player is able to make *any* basic captures.
export function canCaptureScan(props) {
    let grid = props.G.cells;
    for (var gridID = 0, gridLength = grid.length; gridID < gridLength; gridID++) {
        if (grid[gridID] === null || grid[gridID] === false || !isMyPiece(props, gridID)) {
            continue;
        }
        if (canCapture(props, gridID)) {
            return true;
        }
    }
    return false;
}

export function getCellInfo(props, chosenPiece, gridID) {
    let isDarkSquare = false;
    let cellContent = props.G.cells[gridID];
    let row = Math.floor(gridID / 5);
    let col = gridID % 5;

    if (row % 2 === 0) {
        isDarkSquare = col % 2 === 0;
    } else {
        isDarkSquare = col % 2 === 1;
    }
    let isSelected = gridID === chosenPiece;
    let isLegalOption = false;
    let isJumpOption = false;
    let capturedGridID = false;
    if (chosenPiece !== null && !isSelected) {
        for (var i = 0; i < basicOffsets.length; i++) {
            if (cellContent !== null) {
                continue;
            }
            if (props.G.moveType === 'Basic') {  // if we've already made a basic move, it should be the only move on this turn at all.
                break;
            }
            let chosenCellContent = props.G.cells[chosenPiece];
            let adjacentGridID = chosenPiece + basicOffsets[i];
            let adjacentCellContent = props.G.cells[adjacentGridID];
            let chosenCol = chosenPiece % 5;
            let adjacentCol = adjacentGridID % 5;
            if (Math.abs(chosenCol - adjacentCol) > 2) { // don't loop over the sides...
                continue;
            }
            let isBasicMove = gridID === chosenPiece + basicOffsets[i];
            if (props.G.mustLeaveCastle) {
                if (props.playerID === "0") {
                    if (chosenPiece !== 32) {
                        continue;
                    }
                    if (adjacentGridID === 32) {
                        continue;
                    }
                } else {
                    if (chosenPiece !== 2) {
                        continue;
                    }
                    if (adjacentGridID === 2) {
                        continue;
                    }
                }
            }
            if (chosenPiece === 2) { // pieces cannot leave the enemy castle for any reason, even capturing.
                if (chosenCellContent === pieces.WHITE_KNIGHT || chosenCellContent === pieces.WHITE_PAWN) {
                     // they can, however, move within the castle, twice per game.
                    if (props.G.whiteCastleMoves >= 2) {
                        continue;
                    }
                    if (adjacentGridID !== 2) {
                        continue;
                    }
                }
            } else if (chosenPiece === 32) { // pieces cannot leave the enemy castle for any reason, even capturing.
                if (chosenCellContent === pieces.BLACK_KNIGHT || chosenCellContent === pieces.BLACK_PAWN) {
                     // they can, however, move within the castle
                    if (props.G.blackCastleMoves >= 2) {
                        continue;
                    }
                    if (adjacentGridID !== 32) {
                        continue;
                    }
                }
            }

            if (isBasicMove && (props.G.mustLeaveCastle || !props.G.canCaptureThisTurn)) {
                if (props.G.movingPieceGridID !== null) { // if we've already moved this turn, we cannot make a basic move now
                    continue;
                }
                if (props.playerID === "0") { // neither player may make a Basic move into their own castle for any reason
                    if (gridID === 32) {
                        continue;
                    }
                } else {
                    if (gridID === 2) {
                        continue;
                    }
                }
                if (props.G.mustLeaveCastle && canCaptureOutOfOwnCastle(props)) {
                    continue;
                }
                isLegalOption = true;
            }
            if (adjacentCellContent !== null && gridID === chosenPiece + (2 * basicOffsets[i])) {
                let jumpDestCol = (chosenPiece + (2 * basicOffsets[i])) % 5;
                if (Math.abs(jumpDestCol - adjacentCol) > 2) { // don't loop over the sides here either...
                    isLegalOption = false;
                    continue;
                }
                isLegalOption = true;
                isJumpOption = true;
                if (isMyPiece(props, adjacentGridID)) {
                    // don't allow jumping if we're not already jumping, unless it's the first jump.
                    // also, don't allow jumping onto a square we've already jumped on.
                    if ((props.G.moveType !== false && props.G.moveType !== 'Jumping') || props.G.jumpPositions.includes(gridID)) {
                        isLegalOption = false;
                        isJumpOption = false;
                        continue;
                    }
                } else {
                    if (props.G.moveType === false || props.G.moveType === 'Capturing') {
                        // any piece is allowed to start capturing as the first move of the turn, or as a continuation
                        capturedGridID = adjacentGridID;
                    } else {
                        // or, knights may capture right after jumping
                        if (chosenCellContent === pieces.WHITE_KNIGHT || chosenCellContent === pieces.BLACK_KNIGHT) {
                            if (props.G.moveType === 'Jumping') {
                                isLegalOption = true;
                                isJumpOption = true;
                                capturedGridID = adjacentGridID;
                            }
                        } else {
                            isLegalOption = false;
                            isJumpOption = false;
                            continue;
                        }
                    }
                }
                // if we can make a capture, and we're merely jumping, undo making this jump legal (except for a knight who might be able to make a power play)
                // also, if this is a jump and not a capture, disallow jumping into own castle
                if (capturedGridID === false) {
                    if (props.G.canCaptureThisTurn || props.G.mustLeaveCastle) {
                        if (!(chosenCellContent === pieces.WHITE_KNIGHT || chosenCellContent === pieces.BLACK_KNIGHT)) {
                            isLegalOption = false;
                            isJumpOption = false;
                        }
                    }
                    if (props.playerID === "0") {
                        if (gridID === 32) {
                            isLegalOption = false;
                            isJumpOption = false;
                        }
                    } else {
                        if (gridID === 2) {
                            isLegalOption = false;
                            isJumpOption = false;
                        }
                    }
                }
            }
        }
    }

    return {
        isDarkSquare: isDarkSquare,
        cellContent: cellContent,
        isSelected: isSelected,
        isLegalOption: isLegalOption,
        isJumpOption: isJumpOption,
        capturedGridID: capturedGridID,
        isMyPiece: isMyPiece(props, gridID),
        row: row,
        col: col,
    }
}
