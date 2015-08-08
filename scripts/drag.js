//JavaScript HTML5 Canvas example by Dan Gries, rectangleworld.com.
//The basic setup here, including the debugging code and window load listener, is copied from 'HTML5 Canvas' by Fulton & Fulton.
//Checking for browser compatibility is accomplished with the Modernizr JavaScript library.
//The latest version of the library is available at www.modernizr.com.

window.addEventListener("load", windowLoadHandler, false);

//The code below establishes a way to send debug messages to the browser JavaScript Console, 
//but in such a way as to ignore errors when the browser doesn't support the JavaScript Console.
//To log a messages to the console, insert into the code:
//Debugger.log("my message");
var Debugger = function() { };
Debugger.log = function(message) {
    try {
        console.log(message);
    }
    catch (exception) {
        return;
    }
}

function windowLoadHandler() {
    canvasApp();
}

function canvasSupport() {
    return Modernizr.canvas;
}

function canvasApp() {
    if (!canvasSupport()) {
        return;
    }

    var theCanvas = document.getElementById("canvasOne");
    var context = theCanvas.getContext("2d");

    init();

    var numShapes;
    var shapes;
    var dragIndex;
    var dragging;
    var mouseX;
    var mouseY;
    var dragHoldX;
    var dragHoldY;
    var timer;
    var targetX;
    var targetY;
    var easeAmount;
    var bgColor;

    function init() {
        numShapes = 10;
        easeAmount = 0.20;

        bgColor = "#000000";

        shapes = [];

        makeCards();

        drawScreen();

        theCanvas.addEventListener("mousedown", mouseDownListener, false);
    }

    function makeCards() {
        var i;
        var tempX;
        var tempY;
        var cardWidth;
        var cardHeight;
        var r1;
        var g1;
        var b1;
        var color1;
        var r2;
        var g2;
        var b2;
        var color2;
        var tempGrad;
        var gradFactor = 2;
        for (i=0; i < numShapes; i++) {
            cardWidth = 100;
            cardHeight = 130;
            //randomized position
            tempX = Math.random()*(theCanvas.width - cardWidth);
            tempY = Math.random()*(theCanvas.height - cardHeight);

            //Randomize the color gradient. We will select a random color and set the center of the gradient to white.
            //We will only allow the color components to be as large as 200 (rather than the max 255) to create darker colors.
            r1 = Math.floor(Math.random()*200);
            g1 = Math.floor(Math.random()*200);
            b1 = Math.floor(Math.random()*200);
            color1 = "rgb(" + r1 + "," + g1 + "," + b1 +")";

            r2 = Math.min(Math.floor(gradFactor*r1),255);
            g2 = Math.min(Math.floor(gradFactor*g1),255);
            b2 = Math.min(Math.floor(gradFactor*b1),255);
            color2 = "rgb(" + r2 + "," + g2 + "," + b2 +")";

            tempCard = {x:tempX, y:tempY, w:cardWidth, h:cardHeight, gradColor1:color1, gradColor2:color2};
            shapes.push(tempCard);
        }
    }

    function mouseDownListener(evt) {
        var i;

        //getting mouse position correctly
        var bRect = theCanvas.getBoundingClientRect();
        mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
        mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);

        //find which shape was clicked
        for (i=0; i < numShapes; i++) {
            if	(hitTest(shapes[i], mouseX, mouseY)) {
                dragging = true;
                //the following variable will be reset if this loop repeats with another successful hit:
                dragIndex = i;
            }
        }

        if (dragging) {
            window.addEventListener("mousemove", mouseMoveListener, false);

            //We now place the currently dragged shape on top by reordering the array which holds these objects.
            //We 'splice' out this array element, then 'push' it back into the array at the end.
            shapes.push(shapes.splice(dragIndex,1)[0]);

            //shape to drag is now last one in array. We read record the point on this object where the mouse is "holding" it:
            dragHoldX = mouseX - shapes[numShapes-1].x;
            dragHoldY = mouseY - shapes[numShapes-1].y;

            //The "target" position is where the object should be if it were to move there instantaneously. But we will
            //set up the code so that this target position is approached gradually, producing a smooth motion.
            targetX = mouseX - dragHoldX;
            targetY = mouseY - dragHoldY;

            //start timer
            timer = setInterval(onTimerTick, 1000/30);
        }
        theCanvas.removeEventListener("mousedown", mouseDownListener, false);
        window.addEventListener("mouseup", mouseUpListener, false);

        //code below prevents the mouse down from having an effect on the main browser window:
        if (evt.preventDefault) {
            evt.preventDefault();
        } //standard
        else if (evt.returnValue) {
            evt.returnValue = false;
        } //older IE
        return false;
    }

    function onTimerTick() {
        /*
         Because of reordering, the dragging shape is the last one in the array.
         The code below moves this shape only a portion of the distance towards the current "target" position, and
         because this code is being executed inside a function called by a timer, the object will continue to
         move closer and closer to the target position.
         The amount to move towards the target position is set in the parameter 'easeAmount', which should range between
         0 and 1. The target position is set by the mouse position as it is dragging.
         */
        shapes[numShapes-1].x = shapes[numShapes-1].x + easeAmount*(targetX - shapes[numShapes-1].x);
        shapes[numShapes-1].y = shapes[numShapes-1].y + easeAmount*(targetY - shapes[numShapes-1].y);

        //stop the timer when the target position is reached (close enough)
        if ((!dragging)&&(Math.abs(shapes[numShapes-1].x - targetX) < 0.1) && (Math.abs(shapes[numShapes-1].y - targetY) < 0.1)) {
            shapes[numShapes-1].x = targetX;
            shapes[numShapes-1].y = targetY;
            //stop timer:
            clearInterval(timer);
        }
        drawScreen();
    }

    function mouseUpListener(evt) {
        theCanvas.addEventListener("mousedown", mouseDownListener, false);
        window.removeEventListener("mouseup", mouseUpListener, false);
        if (dragging) {
            dragging = false;
            window.removeEventListener("mousemove", mouseMoveListener, false);
        }
    }

    function mouseMoveListener(evt) {
        var posX;
        var posY;
        var h = shapes[numShapes-1].h;
        var w = shapes[numShapes-1].w;
        var minX = 0;
        var maxX = theCanvas.width - w;
        var minY = 0;
        var maxY = theCanvas.height - h;
        //getting mouse position correctly
        var bRect = theCanvas.getBoundingClientRect();
        mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
        mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);

        //clamp x and y positions to prevent object from dragging outside of canvas
        posX = mouseX - dragHoldX;
        posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
        posY = mouseY - dragHoldY;
        posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

        targetX = posX;
        targetY = posY;
    }

    function hitTest(shape,mx,my) {

        var x = shape.x;
        var y = shape.y;
        var w = shape.w;
        var h = shape.h;

        return (mx>x && mx<(x+w) && my>y && my<(y+h));
    }

    function drawShapes() {
        var i;
        var grad;
        var x;
        var y;
        var w;
        var h;
        for (i=0; i < numShapes; i++) {
            //define gradient
            x = shapes[i].x;
            y = shapes[i].y;
            w = shapes[i].w;
            h = shapes[i].h;

            grad = context.createRadialGradient(x, y, 0, x+w, y+h, h);
            grad.addColorStop(0,shapes[i].gradColor2);
            grad.addColorStop(1,shapes[i].gradColor1);

            context.fillStyle = grad;
            context.fillRect(x,y,w,h);
        }
    }

    function drawScreen() {
        //bg
        context.fillStyle = bgColor;
        context.fillRect(0,0,theCanvas.width,theCanvas.height);

        drawShapes();
    }
}