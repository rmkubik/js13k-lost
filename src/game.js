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
var inputHandler;
const SPRITESHEET_DIMENSIONS = { width: 128, height: 128 };
const SPRITESHEET_FRAME_DIMENSIONS = { width: 16, height: 16 };

var init = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.height = 500;
    canvas.width = 500;

    testImage = new Image();
    testImage.src = 'testasset.png';
    spriteSheet = new SpriteSheet(testImage, SPRITESHEET_DIMENSIONS, SPRITESHEET_FRAME_DIMENSIONS);
    playerSprite = new Sprite(spriteSheet, 2, true);

    objects = [];
    objects.push(playerSprite);

    treeGenerator = new TreeGenerator(new Sprite(spriteSheet, 1));
    treeGenerator.plantTrees(35);

    inputHandler = new InputHandler()
}

var update = function(delta, objects) {
    var seconds = delta / 1000;

    //handle user inputs
    // process velocity & game logic changes on objects
    objects.forEach(function(object) {
        object.update(seconds);
    }, this);

    // are any objects colliding now?

    // fix positions of colliding objects (and adjust velocities?)

    // depth sort all objects in the game
    objects.sort(function (a, b) {
        return a.y - b.y;
    });
}

var render = function (objects) {
    context.fillStyle = '#83c168';
    context.fillRect(0, 0, 500, 500);

    objects.forEach(function(object) {
        object.render(context);
    }, this);
}

var now = Date.now();

var tick = function() {
    var delta = Date.now() - now;

    update(delta, objects);
    
    render(objects);

    now = Date.now();
}

var interval = 1000 / 60;

setInterval(tick, interval);

var Sprite = function(spriteSheet, frame, movable) {
    this.spriteSheet = spriteSheet;
    this.frame = frame;
    this.x = 0;
    this.y = 0;
    this.velocity = {};
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.speed = 3;
    this.body = new Body({x: this.x, y: this.y}, SPRITESHEET_FRAME_DIMENSIONS, movable);        

    this.update = function(delta) {
        if (this.body.movable) {
            handleInputs(inputHandler.keys, this.velocity, this.speed);
            
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }
    }

    this.render = function(context) {
        this.spriteSheet.drawFrame(context, this.frame, this.x, this.y);
    }

    var handleInputs = function(keys, velocity, speed) {
        // handle the 4 diagonals differently, they're faster now
        if (keys.left.isDown) {
            velocity.x = -speed;
        } else if (keys.right.isDown) {
            velocity.x = speed;
        } else {
            velocity.x = 0;            
        }

        if (keys.up.isDown) {
            velocity.y = -speed;
        } else if (keys.down.isDown) {
            velocity.y = speed;
        } else {
            velocity.y = 0;            
        }
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
        var treeSprite = new Sprite(spriteSheet, 1, false);
        treeSprite.x = x;
        treeSprite.y = y;
        objects.push(treeSprite);
    }
}

var Body = function(position, size, movable) {
    this.position = position;
    this.size = size;
    this.movable = movable;

    /**
     * @param {Object} other - other body to check for collision against
     * @param {Object} other.position - location point of other body
     * @param {Object} other.size - dimensions of other body
     */
    this.collide = function(other) {
        if (this.position.x < other.position.x + other.size.width &&
            this.position.x + this.size.width > other.position.x &&
            this.position.y < other.position.y + other.size.height &&
            this.size.height + this.position.y > other.position.y) {
             return true;
         }
         return false;
    }
}

var InputHandler = function() {
    this.keys = {
        left: new Key(37),
        up: new Key(38),
        right: new Key(39),
        down: new Key(40)
    }

    document.addEventListener('keydown', function(keyEvent) {
        this.keys = setKeyDown(this.keys, keyEvent.keyCode, true);
    }.bind(this));

    document.addEventListener('keyup', function(keyEvent) {
        this.keys = setKeyDown(this.keys, keyEvent.keyCode, false);
    }.bind(this));

    function setKeyDown(keys, keyCode, isDown) {
        switch (keyCode) {
            case keys.left.CODE:
                keys.left.isDown = isDown;
                break;
            case keys.up.CODE:
                keys.up.isDown = isDown;
                break;
            case keys.right.CODE:
                keys.right.isDown = isDown;
                break;
            case keys.down.CODE:
                keys.down.isDown = isDown;
                break;
            default:
                break;
        }
        return keys;
    }
}

var Key = function(code) {
    this.CODE = code;
    this.isDown = false;
}