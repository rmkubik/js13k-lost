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
    testImage.src = "testasset.png";
    testSprite = new Sprite(testImage);
}

var update = function(delta) {
    console.log('update');
}

var render = function () {
    context.fillStyle = 'green';
    context.fillRect(10, 10, 100, 500);
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

    this.render = function(context) {
        context.drawImage(this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    }
}