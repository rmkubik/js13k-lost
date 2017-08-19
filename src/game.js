window.onload = function() {
    init();
}

var canvas;
var context;
var testImage;
var testSprite;

var init = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.height = 500;
    canvas.width = 500;

    testImage = new Image();
    testImage.src = 'testasset.png';
    testSprite = new Sprite(testImage);

    document.addEventListener('keydown', function(event) {
        testSprite.handleKeyDown(event);
    });
    document.addEventListener('keyup', function(event) {
        testSprite.handleKeyUp(event);
    });
}

var update = function(delta) {
    var seconds = delta / 1000;

    testSprite.update(delta);
}

var render = function () {
    context.fillStyle = 'green';
    context.fillRect(0, 0, 500, 500);
    testSprite.render(context);
}

var now = Date.now();

var tick = function() {
    var delta = Date.now() - now;

    update(delta);
    
    render();

    now = Date.now();
}

var interval = 1000 / 60;

setInterval(tick, interval);

var Sprite = function(image) {
    this.image = image;
    this.height = 16;
    this.width = 16;
    this.x = 0;
    this.y = 0;
    this.velocity = {};
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.speed = 10;

    this.handleKeyDown = function(keyEvent) {
        switch (keyEvent.keyCode){
            case Key.LEFT:
                this.velocity.x = -this.speed;
                break;
            case Key.UP:
                this.velocity.y = -this.speed;
                break;
            case Key.RIGHT:
                this.velocity.x = this.speed;
                break;
            case Key.DOWN:
                this.velocity.y = this.speed;
                break;
            default:
                break;
        }
    }

    this.handleKeyUp = function(keyEvent) {
        switch (keyEvent.keyCode){
            case Key.LEFT:
                this.velocity.x = 0;
                break;
            case Key.UP:
                this.velocity.y = 0;
                break;
            case Key.RIGHT:
                this.velocity.x = 0;
                break;
            case Key.DOWN:
                this.velocity.y = 0;
                break;
            default:
                break;
        }
    }

    this.update = function(delta) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    this.render = function(context) {
        context.drawImage(this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    }
}

var Key = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
}