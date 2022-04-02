let game_area, wheel, audio_flip, audio_ping, audio_break, audio_music, current_state, deg,
    is_muted, timer, interval_throw, interval_check, score, level, is_stop, is_spinning;

function initialize() {
    game_area = $('.game-area');
    wheel = $('.wheel-wrapper');
    audio_flip = new Audio("../assets/sounds/flip.mp3");
    audio_ping = new Audio("../assets/sounds/ping.mp3");
    audio_break = new Audio("../assets/sounds/break.mp3");
    audio_music = new Audio("../assets/sounds/music.mp3");
    current_state = 0;
    is_muted = true;
    level = 1;
    score = 0;
    deg = 0;
    timer = 2000;
    is_spinning = false;
}

function rotate_wheel(dir, r) {
    let wheel = $("#wheel");
    d = deg + r;

    wheel.stop().animate({deg: d}, {
        step: function(now) {
            wheel.css({
                transform: 'rotate(' + now + 'deg)'
            });
        },
        complete: function () {
            deg = d;
            is_spinning = false;
            set_current_state(dir);
        },
        duration: 120,
        easing: 'easeOutCubic'
    });

    if (!is_spinning && !is_muted) {
        play_sound(audio_flip);
        is_spinning = true;
    }
}

function set_current_state(dir) {
    dir === 'left' ? current_state++ : current_state--
    if (current_state < 0) current_state = 3;
    else if (current_state > 3) current_state = 0;
}

function play_sound(sound) {
    sound.pause()
    sound.currentTime = 0;
    sound.play();
}

function stop_sound(sound) {
    sound.pause()
}

function throw_ball() {
    if (!is_stop) {
        let color_id = Math.round(Math.random() * 10);

        if (color_id >= 0 && color_id < 2.5) color_id = 0;
        else if (color_id >= 2.5 && color_id < 5) color_id = 1;
        else if (color_id >= 5 && color_id < 7.5) color_id = 2;
        else color_id = 3;

        let ball = $('<div class="ball color-' + color_id + '" data-id="' + color_id + '"></div>');
        game_area.append(ball);

        let wheel_top = wheel.position().top;
        let ball_height = parseInt(ball.css("height"));

        ball.animate({
            top: wheel_top - ball_height,
        }, timer, "easeInCubic");
    }
}

function check_ball() {
    let wheel_top = wheel.position().top;

    $(".ball").each(function () {
        let ball = $(this);
        let ball_top = ball.position().top;
        let ball_height = parseInt(ball.css("height"));
        let ball_state = parseInt(ball.attr("data-id"));

        if (ball_top >= wheel_top - ball_height - 10) {
            if (ball_state === current_state) {
                set_score();
                set_level();
                ball.remove();

                if (!is_muted) {
                    play_sound(audio_ping);
                }
            }
            else {
                stop_game();

                if (!is_muted) {
                    play_sound(audio_break);
                }
            }
        }
    })
}

function set_level() {
    if (score % 5 === 0) {
        level++;
        timer -= 200;
        $(".level span").html(level);
    }
}

function set_score() {
    score++;
    $(".score span").html(score);
}

function stop_game() {
    is_stop = true;
    wheel.stop();
    $(".ball").stop();
    clearInterval(interval_throw);
    clearInterval(interval_check);
}

function start_game() {
    interval_throw = setInterval(throw_ball, timer);
    interval_check = setInterval(check_ball, 1);
}

function toggle_sound() {
    is_muted = !is_muted;
    $(".sound").toggleClass("off");

    if (!is_muted) {
        audio_music.loop = true;
        play_sound(audio_music);
    }
    else {
        stop_sound(audio_music);
    }
}

$(document).ready(function() {
    initialize();
    start_game();

    document.addEventListener('keydown', function(e) {
        if (!is_stop) {
            if (e.code === 'ArrowLeft') rotate_wheel("left", -90)
            else if (e.code === 'ArrowRight') rotate_wheel("right", 90)
        }

        if (e.code === 'KeyS') toggle_sound();
    });

    $(document).on("click", "#wheel .border", function(e) {
        if (!is_stop) {
            if (e.pageX < game_area.position().left) rotate_wheel("left", -90);
            else rotate_wheel("right", +90);
        }
    });

    $(document).on("click", ".sound", function() {
        toggle_sound();
    });

});