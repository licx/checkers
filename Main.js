var squareWidth = 0;
var checkerBoard;
$(document).ready(function(){
    initialize();
    registerEvents();
});


function initialize(){
    squareWidth = $(".checkersSquare").eq(1).width();
    
    var whiteTemplate = $($("#piecesTemplateBlack").html());
    var blackTemplate = $($("#piecesTemplateWhite").html());
    
    //Create the board
    checkerBoard = new CheckerBoard($("#checkersBoard"), whiteTemplate, blackTemplate);
    var pieces = checkerBoard.pieces;
    
    //Init the board
    checkerBoard.board = createMultiDimensionalArray(8, 8);
    
    //Create the pieces
    var pieceDiv;
    
    //Reset
    checkerBoard.resetGame();
     
    //checkerBoard.pieces = pieces;
    checkerBoard.setBoardFromPieces();
    
    $(".checkersSquare").each(function(){
        var me = $(this);
        var mePosition = me.position();
        var position = {
            x: (Math.floor(mePosition.left / squareWidth)),
            y: (Math.floor(mePosition.top / squareWidth))
        };
        me.data("position", position);
    });
    
    
}


//EVENTS
function registerEvents(){
    $(".piece").click(pieceClicked);
    
    $(".checkersSquare").click(squareClicked);
    
    $("#newGameButton").click(newGameButtonClicked);
    
    $("#closeNotification").click(closeNotificationClicked);
}

function pieceClicked(e){
    var me = $(this);
    var checkerObj = me.data("checker");
    checkerBoard.checkerClicked(checkerObj);
}

function closeNotificationClicked(e){
    $("#notificationDiv").hide("300");
}

function squareClicked(e){
    var me = $(this);
    var position = me.data("position");
    checkerBoard.squareClicked(position.x, position.y);
    
    callWhenDone(function(){
        if (checkerBoard.currentPlayer == 1) {
            calculateAIMove(checkerBoard);
        }
        //Chainjumper
        if (checkerBoard.currentPlayer == 1) {
            calculateAIMove(checkerBoard);
        }
    }, function(){
        return !checkerBoard.movingPiece;
    })
    
}

function newGameButtonClicked(e){
    closeNotificationClicked(e);
    checkerBoard.resetGame();
}



//Utilities
function createMultiDimensionalArray(rows, cols){
    var result = new Array(rows);
    for (var i = 0; i < rows; ++i) 
        result[i] = new Array(cols);
    
    return (result);
}

function copyMultiDimensionalArray(array){
    var copy = new Array(array.length);
    for (var i = 0; i < array.length; ++i) {
        copy[i] = new Array(array[i].length);
        for (var j = 0; j < array[i].length; ++j) 
            copy[i][j] = array[i][j];
    }
    return copy;
}


//Call a function with a delay
function callWhenDone(callback, waitingFun){
    if (waitingFun()) {
        callback();
    }
    else {
        setTimeout(function(){
            callWhenDone(callback, waitingFun);
        }, 300);
    }
}


//HTML Alert
function gameAlert(message){
    var container = $("#notificationDiv");
    $(".notificationMessage", container).html(message);
    container.show(300);
    
    
}

//Log function
function log(message){
    if (!($.browser.msie)) {
        console.log(message);
    }
}

