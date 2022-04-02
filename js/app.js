const audio_flip = new Audio("../assets/sounds/flip.mp3");
const audio_ping = new Audio("../assets/sounds/ping.mp3");
let current_state = 0;
let deg = 0;
let is_muted = true;
let score = 0;

function rotate_wheel(dir, r) {
    let wheel = $("#wheel");
    d = deg + r;

    wheel.animate({deg: d}, {
        step: function(now) {
            wheel.css({
                transform: 'rotate(' + now + 'deg)'
            });
        },
        complete: function () {
            deg = d;
            set_current_state(dir);
        },
        duration: 150,
        easing: 'swing'
    });

    if (!is_muted) {
        play_sound(audio_flip);
    }
}

function set_current_state(dir) {
    dir === 'left' ? current_state-- : current_state++
    if (current_state < 0) current_state = 3;
    else if (current_state > 3) current_state = 0;
}

function play_sound(sound) {
    sound.pause()
    sound.currentTime = 0;
    sound.play();
}

function throw_ball() {
    const game_area = $('.game-area');
    const wheel = $('.wheel-wrapper');
    let color_id = Math.round(Math.random() * 10);

    if (color_id >= 0 && color_id < 2.5) color_id = 0;
    else if (color_id >= 2.5 && color_id < 5) color_id = 1;
    else if (color_id >= 5 && color_id < 7.5) color_id = 2;
    else color_id = 3;

    let ball = $('<div class="ball color-'+color_id+'" data-id="'+color_id+'"></div>');
    game_area.append(ball);

    let wheel_top = wheel.position().top;
    let ball_height = parseInt(ball.css("height"));

    ball.animate({
        top: wheel_top - ball_height,
    }, 2000, "easeInCubic", function() {
        ball.remove();
    });
}


$(document).ready(function() {

    document.addEventListener('keydown', function(e) {
        if (e.code === 'ArrowLeft') rotate_wheel("left", -90)
        else if (e.code === 'ArrowRight') rotate_wheel("right", 90)
    });

    $(document).on("click", ".sound", function(){
        is_muted = !is_muted;
        $(this).toggleClass("off");
    });

    setInterval(throw_ball, 1000);

});