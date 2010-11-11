var moveInProgress = false;

function calculateAIMove(checkerBoard)
{
    if (moveInProgress)
        return;
    moveInProgress = true;
    
    decideMove(checkerBoard);
}

function outputMove(move)
{
    log("Choosing move from " + move.piece.x + "," + move.piece.y + " to " + move[0] + "," + move[1]);
    if (move.safe)
        log("Move is safe");
    else
        log("Move is not safe");
}

function performMove(checkerBoard, move)
{
    outputMove(move);

    if (checkerBoard.chainJumper)
        setTimeout(function () { performDeferredMove(checkerBoard, move) }, 500);
    else
        performDeferredMove(checkerBoard, move);
}

function performDeferredMove(checkerBoard, move)
{
    checkerBoard.checkerClicked(move.piece);
    moveInProgress = false;
    checkerBoard.squareClicked(move[0], move[1]);
}

function getPossibleJumps(piece, board)
{
    var x = piece.x;
    var y = piece.y;
    var possibleJumps = new Array;

    // Forward left jump
    if (x > 1 && y < 6 && board[x - 1][y + 1] && board[x - 1][y + 1].player == 0 && !board[x - 2][y + 2])
        possibleJumps.push([x - 2, y + 2]);
    // Forward right jump
    if (x < 6 && y < 6 && board[x + 1][y + 1] && board[x + 1][y + 1].player == 0 && !board[x + 2][y + 2])
        possibleJumps.push([x + 2, y + 2]);
    // Backward left jump
    if (piece.isKing && x > 1 && y > 1 && board[x - 1][y - 1] && board[x - 1][y - 1].player == 0 && !board[x - 2][y - 2])
        possibleJumps.push([x - 2, y - 2]);
    // Backward right jump
    if (piece.isKing && x < 6 && y > 1 && board[x + 1][y - 1] && board[x + 1][y - 1].player == 0 && !board[x + 2][y - 2])
        possibleJumps.push([x + 2, y - 2]);

    return possibleJumps;
}

function getPossibleMoves(piece, board)
{
    var x = piece.x;
    var y = piece.y;
    var possibleMoves = new Array;
    
    // Down-left
    if (x > 0 && y < 7 && !board[x - 1][y + 1])
        possibleMoves.push([x - 1, y + 1]);
    // Down-right
    if (x < 7 && y < 7 && !board[x + 1][y + 1])
        possibleMoves.push([x + 1, y + 1]);
    // Up-left
    if (x > 0 && y > 0 && !board[x - 1][y - 1] && piece.isKing)
        possibleMoves.push([x - 1, y - 1]);
    // Up-right
    if (x < 7 && y > 0 && !board[x + 1][y - 1] && piece.isKing)
        possibleMoves.push([x + 1, y - 1]);
    
    return possibleMoves;
}

function canBeJumped(piece, board)
{
    var x = piece.x;
    var y = piece.y;
    if (x == 0 || x == 7 || y == 0 || y == 7)
        return false;
    
    if (board[x - 1][y - 1] && board[x - 1][y - 1].player == 0 && board[x - 1][y - 1].isKing && board[x + 1][y + 1] == null)
        return true;
    if (board[x + 1][y - 1] && board[x + 1][y - 1].player == 0 && board[x + 1][y - 1].isKing && board[x - 1][y + 1] == null)
        return true;
    if (board[x - 1][y + 1] && board[x - 1][y + 1].player == 0 && board[x + 1][y - 1] == null)
        return true;
    if (board[x + 1][y + 1] && board[x + 1][y + 1].player == 0 && board[x - 1][y - 1] == null)
        return true;
        
    return false;
}

function analyzeJump(piece, board, x, y)
{
    var result = new Object;
    if (y == 7 && !piece.kinged)
        result.kinged = true;
    else
        result.kinged = false;
    result.terminal = true;
    result.safe = false;

    var boardCopy = copyMultiDimensionalArray(board);
    
    boardCopy[piece.x][piece.y] = null;
    boardCopy[x][y] = piece;
    if (x - piece.x > 0) {
        if (y - piece.y > 0)
            boardCopy[piece.x + 1][piece.y + 1] = null;
        else
            boardCopy[piece.x + 1][piece.y - 1] = null;
    } else {
        if (y - piece.y > 0)
            boardCopy[piece.x - 1][piece.y + 1] = null;
        else
            boardCopy[piece.x - 1][piece.y - 1] = null;
    }
    
    var oldX = piece.x;
    var oldY = piece.y;
    var oldKing = piece.isKing;
    piece.x = x;
    piece.y = y;
    if (y == 7)
        piece.isKing = true;
    
    if (!canBeJumped(piece, boardCopy))
        result.safe = true;
    
    var possibleJumps = getPossibleJumps(piece, boardCopy);

    if (possibleJumps.length) {
        result.safe = false;
        result.terminal = false;
    }
    
    for (i in possibleJumps) {
        var jump = possibleJumps[i];
        var subResult = analyzeJump(piece, boardCopy, jump[0], jump[1]);
        if (subResult.kinged)
            result.kinged = true;
        if (result.safe)
            result.safe = true;
    }
    
    piece.x = oldX;
    piece.y = oldY;
    piece.isKing = oldKing;
    
    return result;
}

function decideMove(checkerBoard)
{
    var board = copyMultiDimensionalArray(checkerBoard.board);
    
    var jumpers = new Array;
    if (checkerBoard.chainJumper) {
        // If AI player is in the middle of a chain jump, it must continue its jump.
        jumpers.push(checkerBoard.chainJumper);
    } else {
        // Gather up all the pieces that can jump.
        for (var i = 0; i < 12; ++i) {
            if (checkerBoard.pieces[1][i].captured)
                continue;
            
            if (!checkerBoard.pieceCanJump(checkerBoard.pieces[1][i]))
                continue;
            
            jumpers.push(checkerBoard.pieces[1][i]);
        }
    }
    
    // If any piece can jump, we have to jump. Rank all the possible jumps based on jump analysis.
    var rankedJumps = createMultiDimensionalArray(4, 0);
    for (i in jumpers) {
        var piece = jumpers[i];
        var possibleJumps = getPossibleJumps(piece, board);
        for (i in possibleJumps) {
            var jump = possibleJumps[i];
            jump.piece = piece;
            var analysis = analyzeJump(piece, board, jump[0], jump[1]);
            if (analysis.safe)
                jump.safe = true;
                
            // Prefer chain jumps over non-chain jumps.
            // Prefer jumps that end in a safe position over those that do not.
            if (analysis.terminal) {
                if (analysis.safe)
                    rankedJumps[2].push(jump);
                else
                    rankedJumps[3].push(jump);
            } else {
                if (analysis.safe)
                    rankedJumps[0].push(jump);
                else
                    rankedJumps[1].push(jump);
            }
        }
    }
    
    // Pick a random jump from the best ranked jumps, or the second best... or the third...
    for (var i = 0; i < 4; ++i) {
        if (rankedJumps[i].length) {
            var jumpToUse = rankedJumps[i][Math.floor(Math.random() * rankedJumps[i].length)];
            return performMove(checkerBoard, jumpToUse);
        }
    }
    
    if (jumpers.length) {
        alert("We have possible jumps, but didn't choose one!");
        return;
    }
    
    // Move a non-king into king-row if possible.
    // This code blindly moves the first such piece found.
    for (var i = 0; i < 12; ++i) {
        var piece = checkerBoard.pieces[1][i];
        if (piece.captured)
            continue;
    
        if (piece.y != 6 || piece.isKing)
            continue;
        
        var targetX;
        if (piece.x > 0 && !board[piece.x - 1][7])
            targetX = piece.x - 1;
        else if (piece.x < 7 && !board[piece.x + 1][7])
            targetX = piece.x + 1;
        
        if (targetX == undefined)
            continue;

        var move = [targetX, 7];
        move.piece = piece;
        return performMove(checkerBoard, move);
    }
    
    // Gather up all pieces that have a traditional move remaining
    var rankedMoves = createMultiDimensionalArray(2, 0);
    for (var i = 0; i < 12; ++i) {
        var piece = checkerBoard.pieces[1][i];
        if (piece.captured)
            continue;
        
        var moves = getPossibleMoves(piece, board);
        if (moves && moves.length) {
            for (j in moves) {
                var move = moves[j];
                move.piece = piece;
                var boardCopy = copyMultiDimensionalArray(board);
                boardCopy[piece.x][piece.y] = null;
                boardCopy[move[0]][move[1]] = piece;
                var oldX = piece.x;
                var oldY = piece.y;
                piece.x = move[0];
                piece.y = move[1];
                if (canBeJumped(piece, boardCopy))
                    rankedMoves[1].push(move);
                else
                    rankedMoves[0].push(move);
                
                piece.x = oldX;
                piece.y = oldY;
            }
        }
    }
        
    // If multiple safe moves are available, sort them by their closeness to king row, 
    // but seperate out pieces that are already kinged.
    var safeMovesByRow = createMultiDimensionalArray(8, 0);
    var safeKingMoves = new Array
    if (rankedMoves[0].length) {
        for (i in rankedMoves[0]) {
            var move = rankedMoves[0][i];
            if (move.piece.isKing)
                safeKingMoves.push(move);
            else
                safeMovesByRow[move[1]].push(move);
        }
    }
    
    // Pick one of the safe moves for a non-king piece closest to king row
    for (var i = 7; i >= 0; --i) {
        if (!safeMovesByRow[i].length)
            continue;
        
        var moveToUse = safeMovesByRow[i][Math.floor(Math.random() * safeMovesByRow[i].length)];
        moveToUse.safe = true;
        return performMove(checkerBoard, moveToUse);
    }
    
    // If there weren't any safe non-king moves, pick any of the king moves at random
    if (safeKingMoves.length) {
        var moveToUse = safeKingMoves[Math.floor(Math.random() * safeKingMoves.length)];
        return performMove(checkerBoard, moveToUse);
    }
    
    // Only unsafe moves remain. Pick one at random.
    if (rankedMoves[1].length) {
        var moveToUse = rankedMoves[1][Math.floor(Math.random() * rankedMoves[1].length)];
        return performMove(checkerBoard, moveToUse);
    }
    
    log("No moves possible!!!");
    moveInProgress = false;
}
