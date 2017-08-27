window.onload = function() {
    init();
}

var canvas;
var context;
var testImage;
var spriteSheet;
var playerSprite;
var treeGenerator;
var objects;
var inputHandler;
var colisionResolver;
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
    collisionResolver = new CollisionResolver();
}

var update = function(delta, objects) {
    var seconds = delta / 1000;

    //handle user inputs
    // process velocity & game logic changes on objects
    objects.forEach(function(object) {
        object.update(seconds);
    }, this);

    var collisions = [];
    // are any objects colliding now?
    objects.forEach(function(object) {
        if (playerSprite.body.collide(object.body) && playerSprite.id !== object.id) {
            collisions.push(object);
        }
    }, this);

    // fix positions of colliding objects (and adjust velocities?)
    collisions.forEach(function(other) {
        const PLAYER_CENTER = {
            x: playerSprite.body.position.x + Math.floor(playerSprite.body.size.width / 2),
            y: playerSprite.body.position.y + Math.floor(playerSprite.body.size.height / 2)
        }
        const OTHER_CENTER = {
            x: other.body.position.x + Math.floor(other.body.size.width / 2),
            y: other.body.position.y + Math.floor(other.body.size.height / 2)
        }
        const DISPLACEMENT = {
            x: PLAYER_CENTER.x - OTHER_CENTER.x,
            y: PLAYER_CENTER.y - OTHER_CENTER.y
        }
        
        // up diagonals
        if (inputHandler.keys.left.isDown & inputHandler.keys.up.isDown) {

        } else if (inputHandler.keys.right.isDown & inputHandler.keys.up.isDown) {
            if (DISPLACEMENT.x < 0 && DISPLACEMENT.y < 0) {
                // top left quadrant
                collisionResolver.resolveRight(playerSprite, other);
            } else if (DISPLACEMENT.x > 0 && DISPLACEMENT.y > 0) {
                // bottom right quadrant
                collisionResolver.resolveUp(playerSprite, other);
            } else if (Math.abs(DISPLACEMENT.y) < Math.abs(DISPLACEMENT.x)) {
                // these can't be combined above because quadrant checking needs to happen before absolute value checking
                collisionResolver.resolveRight(playerSprite, other);
            } else if (Math.abs(DISPLACEMENT.y) > Math.abs(DISPLACEMENT.x)) {
                // these can't be combined above because quadrant checking needs to happen before absolute value checking
                collisionResolver.resolveUp(playerSprite, other);
            }
        } else if (inputHandler.keys.left.isDown & inputHandler.keys.down.isDown) {

        } else if (inputHandler.keys.right.isDown & inputHandler.keys.down.isDown) {

        } else {
            // left & right only
            if (inputHandler.keys.left.isDown) {
                collisionResolver.resolveLeft(playerSprite, other);
            } else if (inputHandler.keys.right.isDown) {
                collisionResolver.resolveRight(playerSprite, other);
            }

            // up & down only
            if (inputHandler.keys.up.isDown) {
                collisionResolver.resolveUp(playerSprite, other);
            } else if (inputHandler.keys.down.isDown) {
                collisionResolver.resolveDown(playerSprite, other);
            } 
        }
    }, this);

    // depth sort all objects in the game
    objects.sort(function (a, b) {
        return a.position.y - b.position.y;
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
    this.position = {
        x: 0,
        y: 0
    }
    this.velocity = {
        x: 0,
        y: 0
    };
    this.speed = 3;
    this.body = new Body(this.position, SPRITESHEET_FRAME_DIMENSIONS, movable);  
    this.id = GetGUID();      

    this.update = function(delta) {
        if (this.body.movable) {
            handleInputs(inputHandler.keys, this.velocity, this.speed);
            
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }

    this.render = function(context) {
        this.spriteSheet.drawFrame(context, this.frame, this.position.x, this.position.y);
    }

    var handleInputs = function(keys, velocity, speed) {
        // handle the 4 diagonals differently, they're faster now
        // if both left & right or up & down, character should stop moving?
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
            plantTree(
                treeSprite, 
                Math.floor(Math.random() * (max - min) + min), 
                Math.floor(Math.random() * (max - min) + min)
            );
        }
    }

    function plantTree(treeSprite, x, y) {
        var treeSprite = new Sprite(spriteSheet, 1, false);
        treeSprite.position.x = x;
        treeSprite.position.y = y;
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
var CollisionResolver = function() {
    this.resolveUp = function(player, other) {
        player.position.y -= player.body.position.y - (other.body.position.y + other.body.size.height);    
    }
    this.resolveDown = function(player, other) {
        player.position.y -= player.body.position.y + player.body.size.height - other.body.position.y;
    }
    this.resolveLeft = function(player, other) {
        player.position.x -= player.body.position.x - (other.body.position.x + other.body.size.width);
    }
    this.resolveRight = function(player, other) {
        player.position.x -= player.body.position.x + player.body.size.width - other.body.position.x;
    }
}

var Key = function(code) {
    this.CODE = code;
    this.isDown = false;
}

var guid = 0;
function GetGUID() {
    return guid++;
}