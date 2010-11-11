function CheckerBoard(div, whiteTemplate, blackTemplate){

    this.board = createMultiDimensionalArray(8, 8);
    this.pieces = createMultiDimensionalArray(2, 12);
    this.div = div;
    this.chainJumper = 0;
    this.currentPlayer = 0;
    
    
    
    for (var i = 0; i < 12; ++i) {
        pieceDiv = whiteTemplate.clone();
        pieceDiv.appendTo(this.div);
        this.pieces[0][i] = new Checker(0, this, pieceDiv);
        pieceDiv = blackTemplate.clone();
        this.pieces[1][i] = new Checker(1, this, pieceDiv);
        pieceDiv.appendTo(this.div);
    }
    
    this.resetGame();
    this.movingPiece = false;
}

CheckerBoard.prototype.setCheckerPosition = function(checker, x, y){
    if (checker.x != -1) 
        this.board[checker.x][checker.y] = null;
    
    checker.moveTo(x, y);
    this.board[x][y] = checker;
}

CheckerBoard.prototype.setBoardFromPieces = function(){
    for (var y = 0; y < 8; ++y) 
        for (var x = 0; x < 8; ++x) 
            this.board[x][y] = null;
    
    for (var i = 0; i < 12; ++i) {
        var checker = this.pieces[0][i];
        if (!checker.captured) 
            this.board[checker.x][checker.y] = checker;
        
        checker = this.pieces[1][i];
        if (!checker.captured) 
            this.board[checker.x][checker.y] = checker;
    }
}

CheckerBoard.prototype.resetGame = function(){
    this.setCurrentPlayer(0);
    this.gameInProgress = true;
    this.chainJumper = null;
    this.selectedChecker = null;
    this.setTurnCount(1);
    
    for (var i = 0; i < 12; ++i) {
    
        this.pieces[0][i].reset();
        
        this.pieces[1][i].reset();
        
    }
    
    
    
    
    
    
    
    this.pieces[0][0].moveTo(0, 7);
    
    
    
    this.pieces[0][1].moveTo(2, 7);
    
    
    
    this.pieces[0][2].moveTo(4, 7);
    
    
    
    this.pieces[0][3].moveTo(6, 7);
    
    
    
    this.pieces[0][4].moveTo(1, 6);
    
    
    
    this.pieces[0][5].moveTo(3, 6);
    
    
    
    this.pieces[0][6].moveTo(5, 6);
    
    
    
    this.pieces[0][7].moveTo(7, 6);
    
    
    
    this.pieces[0][8].moveTo(0, 5);
    
    
    
    this.pieces[0][9].moveTo(2, 5);
    
    
    
    this.pieces[0][10].moveTo(4, 5);
    
    
    
    this.pieces[0][11].moveTo(6, 5);
    
    
    
    this.pieces[1][0].moveTo(1, 0);
    
    
    
    this.pieces[1][1].moveTo(3, 0);
    
    
    
    this.pieces[1][2].moveTo(5, 0);
    
    
    
    this.pieces[1][3].moveTo(7, 0);
    
    
    
    this.pieces[1][4].moveTo(0, 1);
    
    
    
    this.pieces[1][5].moveTo(2, 1);
    
    
    
    this.pieces[1][6].moveTo(4, 1);
    
    
    
    this.pieces[1][7].moveTo(6, 1);
    
    
    
    this.pieces[1][8].moveTo(1, 2);
    
    
    
    this.pieces[1][9].moveTo(3, 2);
    
    
    
    this.pieces[1][10].moveTo(5, 2);
    
    
    
    this.pieces[1][11].moveTo(7, 2);
    
    
    
    
    
    
    
    this.setBoardFromPieces();

}

//Onclick
CheckerBoard.prototype.checkerClicked = function(checker){
    // Can't select when the game isn't going.
    if (!this.gameInProgress) 
        return;
    
    // Can't select a checker you don't own.
    if (checker.player != this.currentPlayer) {
        log("Can't do that!");
        this.moveNotAllowedAlert(checker.x, checker.y);
        return;
    }
    
    // If a jump is possible and this piece can't jump, don't allow the selection.
    // In fact, flash a different color for that error.
    if ((this.chainJumper && this.chainJumper != checker) || (!this.pieceCanJump(checker) && this.anyJumpPossible())) {
        //this.flashDiv.addClassName('FlashYellow');
        this.moveNotAllowedAlert(checker.x, checker.y);
        log("Can't move this piece.You must jump!!");
        return;
    }
    
    // If the clicked checker is already selected, we might try to clear the selection instead.
    if (this.selectedChecker == checker) 
        checker = null;
    
    this.setSelectedChecker(checker);
}

CheckerBoard.prototype.moveNotAllowedAlert = function(x, y){
    if (this.currentPlayer == 0) {
        var notAllowed = $("#moveNotAllowed");
        
        var newX = x * squareWidth;
        var newY = y * squareWidth;
        
        notAllowed.css("left", newX);
        notAllowed.css("top", newY);
        notAllowed.show();
        setTimeout(function(){
            notAllowed.hide(300);
        }, 400);
        
    }
}

CheckerBoard.prototype.setSelectedChecker = function(checker){
    // If the player is in the middle of a chain jump, we should never change the selection.
    if (this.chainJumper) 
        return;
    
    if (this.selectedChecker) 
        this.selectedChecker.setSelected(false);
    
    this.selectedChecker = checker;
    
    if (checker) {
        checker.setSelected(true);
        
        checker.div.addClass("selected");
    }
}

CheckerBoard.prototype.gameOver = function(){
    var hasAnyPieces = false;
    for (var i = 0; i < 12; ++i) {
        if (!this.pieces[0][i].captured) {
            hasAnyPieces = true;
            break;
        }
    }
    
    if (!hasAnyPieces) 
        return true;
    
    hasAnyPieces = false;
    for (var i = 0; i < 12; ++i) {
        if (!this.pieces[1][i].captured) {
            hasAnyPieces = true;
            break;
        }
    }
    
    return !hasAnyPieces;
}

CheckerBoard.prototype.anyJumpPossible = function(){
    for (var i = 0; i < 12; ++i) {
        if (this.pieceCanJump(this.pieces[this.currentPlayer][i])) 
            return true;
    }
    
    return false;
}

CheckerBoard.prototype.pieceCanJump = function(checker){
    if (checker.captured) 
        return false;
    
    var board = this.board;
    
    // Any jumps to the left?
    if (checker.x > 1) {
        if (checker.y > 1 && board[checker.x - 1][checker.y - 1] && board[checker.x - 1][checker.y - 1].player != checker.player && !board[checker.x - 2][checker.y - 2] && (checker.player == 0 || checker.isKing)) 
            return true;
        if (checker.y < 6 && board[checker.x - 1][checker.y + 1] && board[checker.x - 1][checker.y + 1].player != checker.player && !board[checker.x - 2][checker.y + 2] && (checker.player == 1 || checker.isKing)) 
            return true;
    }
    
    // Any jumps to the right?
    if (checker.x < 6) {
        if (checker.y > 1 && board[checker.x + 1][checker.y - 1] &&
        board[checker.x + 1][checker.y - 1].player != checker.player &&
        !board[checker.x + 2][checker.y - 2] &&
        (checker.player == 0 || checker.isKing)) 
            return true;
        if (checker.y < 6 && board[checker.x + 1][checker.y + 1] &&
        board[checker.x + 1][checker.y + 1].player != checker.player &&
        !board[checker.x + 2][checker.y + 2] &&
        (checker.player == 1 || checker.isKing)) 
            return true;
    }
    
    return false;
}

CheckerBoard.prototype.attemptMove = function(checker, x, y){
    // Attempting to move within the same row or column is invalid, as is moving more than 2 rows or columns away.
    if (checker.x == x || Math.abs(checker.x - x) > 2 || checker.y == y || Math.abs(checker.y - y) > 2) 
        return false;
    
    // Attempting to move one row away.
    var delta = checker.player ? 1 : -1;
    if (Math.abs(checker.y - y) == 1) {
        // Cancel if we should be required to continue a chain jump.
        if (this.chainJumper) 
            return false;
        
        // Or if a jump is possible (one must be taken).
        if (this.anyJumpPossible()) 
            return false;
        
        // Or if the movement is backwards and the piece is not a king.
        if (checker.y - delta == y && !checker.isKing) 
            return false;
        
        // Or if it's not exactly one column in either direction.
        if (Math.abs(checker.x - x) != 1) 
            return false;
        
        // Or if that square is not clear.
        if (this.board[x][y]) 
            return false;
        
        return true;
    }
    
    // Attempting to move two rows away (jumping).
    delta = delta * 2;
    var jumpedPiece;
    if (Math.abs(checker.y - y) == 2) {
        // Cancel if the movement is backwards and the piece is not a king.
        if (checker.y - delta == y && !checker.isKing) 
            return false;
        
        // Or if it's not two columns in either direction.
        if (Math.abs(checker.x - x) != 2) 
            return false;
        
        // Or if that square is not clear.
        if (this.board[x][y]) 
            return false;
        
        // Or if there wasn't an enemy piece in between.
        if (checker.x > x) {
            if (checker.y > y) {
                if (!this.board[x + 1][y + 1] || this.board[x + 1][y + 1].player == checker.player) 
                    return false;
                jumpedPiece = this.board[x + 1][y + 1];
            }
            else {
                if (!this.board[x + 1][y - 1] || this.board[x + 1][y - 1].player == checker.player) 
                    return false;
                jumpedPiece = this.board[x + 1][y - 1];
            }
        }
        else {
            if (checker.y > y) {
                if (!this.board[x - 1][y + 1] || this.board[x - 1][y + 1].player == checker.player) 
                    return false;
                jumpedPiece = this.board[x - 1][y + 1];
            }
            else {
                if (!this.board[x - 1][y - 1] || this.board[x - 1][y - 1].player == checker.player) 
                    return false;
                jumpedPiece = this.board[x - 1][y - 1];
            }
        }
        
        // The jump was valid - remove the jumped piece from the grid.
        jumpedPiece.setCaptured(true);
        this.board[jumpedPiece.x][jumpedPiece.y] = null;
        
        var result = new Object();
        result.jumped = true;
        return result;
    }
}

CheckerBoard.prototype.changePlayer = function(){


    this.setCurrentPlayer((this.currentPlayer + 1) % 2);
    
    // If we just went from player 1 back to player 0, increment the turn counter.
    
    if (!this.currentPlayer) 
    
        this.setTurnCount(this.turnCount + 1);
    
}

CheckerBoard.prototype.setCurrentPlayer = function(player){
    if (player) {
        this.currentPlayer = 1;
        
        log("Current player:" + this.currentPlayer);
        
    }
    else {
    
        this.currentPlayer = 0;
        
        log("Current player:" + this.currentPlayer);
    }
}

CheckerBoard.prototype.setTurnCount = function(count){
    this.turnCount = count;
}


CheckerBoard.prototype.squareClicked = function(x, y){
    if (!this.gameInProgress || !this.selectedChecker) 
        return;
    
    // At this point, we'll always clear the selection whether the move ends up valid or not.
    var checker = this.selectedChecker;
    
    var result = this.attemptMove(checker, x, y);
    
    // If the move failed, flash an error and bail.
    if (!result) {
    
        this.moveNotAllowedAlert(x, y);
        
        return;
    }
    // The move was successful so commit the new location.
    this.setCheckerPosition(checker, x, y);
    
    // King the piece if necessary.
    if ((checker.player == 0 && y == 0) || (checker.player == 1 && y == 7)) 
        checker.kingMe(true);
    
    // Set up for a chain jump if necessary.
    if (result.jumped && this.pieceCanJump(checker)) {
        this.setSelectedChecker(checker);
        this.chainJumper = checker;
    }
    else {
        this.chainJumper = null;
        this.setSelectedChecker(null);
    }
    
    // If the game isn't over, switch current players and bail.
    if (!this.gameOver()) {
        if (this.turnCount == 1 && this.currentPlayer == 0) 
            this.currentAchievement = "Moved a piece";
        
        if (!this.chainJumper) 
            this.changePlayer();
        
        //this.gameManager.moveMade();
        checker.div.removeClass("selected");
        return;
    }
    
    this.gameInProgress = false;
    var self = this;
    setTimeout(function(){
        self.showEndGame();
    }, 500);
}

CheckerBoard.prototype.showEndGame = function(){
    if (this.currentPlayer == 1) {
        gameAlert("Game over, you lose!<br>Click on new game to start over");
        setTimeout(function(){
            $("#newGameButton").effect("bounce", {
                times: 3,
                distance: 100
            }, 500);
        }, 1000)
        
    }
    else {
        gameAlert("Game over, you win!<br>Click on new game to start over");
        setTimeout(function(){
            $("#newGameButton").effect("bounce", {
                times: 3,
                distance: 100
            }, 500);
        }, 1000)
    }
}




// =========== Checker ===========

function Checker(player, board, div){
    this.board = board;
    this.selected = false;
    this.captured = false;
    
    this.x = -1;
    this.y = -1;
    
    $(div).data("checker", this);
    this.div = div;
    this.setPlayer(player);
    this.isKing = false;
    var self = this;
}

Checker.prototype.setPlayer = function(player){
    this.player = player;
}

Checker.prototype.moveTo = function(x, y){

    // This should never happen
    if (x < 0 || x > 7 || y < 0 || y > 7) 
        return;
    
    var pieceDiv = this.div;
    this.x = x;
    this.y = y;
    var pieceCoordinates = this.div.position();
    
    
    var newX = x * squareWidth;
    var newY = y * squareWidth;
    
    //$(pieceDiv).css("left", newX);
    //$(pieceDiv).css("top", newY);
    /*$(pieceDiv).animate({
     left:'+=' pieceCoordinates.left-newX,
     top:'+=' pieceCoordinates.left-newY,
     });*/
    var b = this.board;
    b.movingPiece = true;
    $(pieceDiv).animate({
        left: newX,
        top: newY
    }, 500, function(){
        // Animation complete.
        b.movingPiece = false;
    });
    
}

Checker.prototype.setSelected = function(selected){




    if (selected) 
    
        this.div.addClass('selected');
    
    else 
    
        this.div.removeClass('selected');
    
    
    
}

Checker.prototype.kingMe = function(kinged){
    this.isKing = kinged;
    
    if (kinged) 
        //IE6 doesn't understand multiple classes so different classes were created
        if (this.player == 0) 
            this.div.addClass('kingBlack');
        else 
            this.div.addClass('kingWhite');
    
    else 
        if (this.player == 0) 
            this.div.removeClass('kingBlack');
        else 
            this.div.removeClass('kingWhite');
    //IE6 Patch
    this.div.removeClass('ie7_class4');
    
    
    
}

Checker.prototype.setCaptured = function(captured){
    this.captured = captured;
    if (captured) {
        var pieceDiv = this.div;
        setTimeout(function(){
            pieceDiv.addClass("captured");
        }, 200);
    }
    else 
        this.div.removeClass('captured');
}

Checker.prototype.reset = function(){
    this.setSelected(false);
    this.kingMe(false);
    this.setCaptured(false)
}

Checker.prototype.toString = function(){
    return "{x:" + this.x + ", y:" + this.y + ", player:" + this.player + ", isKing:" + this.isKing + ", captured:" + this.captured + "}";
}

Checker.prototype.load = function(checkerInfo){
    this.kingMe(checkerInfo.isKing);
    this.setCaptured(checkerInfo.captured);
    this.setPlayer(checkerInfo.player);
    this.setSelected(false);
    this.moveTo(checkerInfo.x, checkerInfo.y);
}
