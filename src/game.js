window.onload = function() {
    init();
}

var canvas;
var context;
var testImage;
var spriteSheet;
var playerSprites;
var treeGenerator;
var objects;

var init = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.height = 500;
    canvas.width = 500;

    testImage = new Image();
    testImage.src = 'testasset.png';
    spriteSheet = new SpriteSheet(testImage, { width: 128, height: 128 }, { width: 16, height: 16 });
    playerSprite = new Sprite(spriteSheet, 0);

    objects = [];
    objects.push(playerSprite);

    treeGenerator = new TreeGenerator(new Sprite(spriteSheet, 1));
    treeGenerator.plantTrees(100);

    document.addEventListener('keydown', function(event) {
        playerSprite.handleKeyDown(event);
    });
    document.addEventListener('keyup', function(event) {
        playerSprite.handleKeyUp(event);
    });
}

var update = function(delta) {
    var seconds = delta / 1000;

    objects.forEach(function(object) {
        object.update(seconds);
    }, this);
}

var render = function () {
    context.fillStyle = '#69a051';
    context.fillRect(0, 0, 500, 500);

    objects.forEach(function(object) {
        object.render(context);
    }, this);
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

var Sprite = function(spriteSheet, frame) {
    this.spriteSheet = spriteSheet;
    this.frame = frame;
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

        // depth sort all objects in the game
        objects.sort(function (a, b) {
            return a.y - b.y;
        });
    }

    this.render = function(context) {
        this.spriteSheet.drawFrame(context, this.frame, this.x, this.y);
    }
}

/**
 * 
 * @param {Object} image - image to be used as a spritesheet
 * @param {Object} imageSize - width and height of image
 * @param {number} imageSize.width - width in pixels
 * @param {number} imageSize.height - height in pixels
 * @param {Object} frameSize - width and height of each frame in the sprite sheet
 * @param {number} frameSize.width - width in pixels
 * @param {number} frameSize.height - height in pixels
 */
var SpriteSheet = function(image, imageSize, frameSize) {
    this.image = image;
    this.imageSize = imageSize;
    this.frameSize = frameSize;
    var framesInRow = this.imageSize.width / this.frameSize.width;
    var framesInCol = this.imageSize.height / this.frameSize.height;
    const PADDING = 1;

    this.drawFrame = function(context, frameIndex, x, y) {
        var col = frameIndex % framesInRow;
        var row = Math.floor(frameIndex / framesInCol);
        context.drawImage(
            this.image, 
            col * (this.frameSize.width + PADDING), 
            row * (this.frameSize.height + PADDING),
            this.frameSize.width,
            this.frameSize.height,
            x,
            y,
            this.frameSize.width * 2,
            this.frameSize.height * 2
        )
    }
}

var TreeGenerator = function(treeSprite) {
    var max = 500;
    var min = 0;
    var treeSprite = treeSprite;

    this.plantTrees = function(treeCount) {
        for (var i = 0; i < treeCount; i++) {
            plantTree(treeSprite, Math.random() * (max - min) + min, Math.random() * (max - min) + min);
        }
    }

    function plantTree(treeSprite, x, y) {
        var treeSprite = new Sprite(spriteSheet, 1);
        treeSprite.x = x;
        treeSprite.y = y;
        objects.push(treeSprite);
    }
}

var Key = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
}