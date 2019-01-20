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

export function getCellInfo(props, chosenPiece, gridID) {
    let isDarkSquare = false;
    let cellContent = props.G.cells[gridID];
    let row = Math.floor(gridID / 12);
    let col = gridID % 12;

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
            let adjacentGridID = chosenPiece + basicOffsets[i];
            let adjacentCellContent = props.G.cells[adjacentGridID];
            let chosenCol = chosenPiece % 12;
            let adjacentCol = adjacentGridID % 12;
            if (Math.abs(chosenCol - adjacentCol) > 2) { // don't loop over the sides...
                continue;
            }
            let isBasicMove = gridID === chosenPiece + basicOffsets[i];
            if (isBasicMove) {
                if (props.G.movingPieceGridID !== null) {
                    continue;
                }
                isLegalOption = true;
            }
            if (adjacentCellContent !== null && gridID === chosenPiece + (2 * basicOffsets[i])) {
                let jumpDestCol = (chosenPiece + (2 * basicOffsets[i])) % 12;
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
                        let chosenCellContent = props.G.cells[chosenPiece];
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
