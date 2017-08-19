window.onload = function() {
    init();
}

var canvas;
var context;

var init = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.height = 500;
    canvas.width = 500;
}

var update = function(delta) {
    console.log('update');
}

var render = function () {
    context.fillStyle = 'green';
    context.fillRect(10, 10, 100, 500);
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