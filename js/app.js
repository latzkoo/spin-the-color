let game_area, main_screen, high_score, wheel, audio_flip, audio_ping, audio_break, audio_music, current_state, deg,
    is_muted, timer, interval_throw, interval_check, score, level, is_stop, is_spinning, player_name;

function initialize() {
    game_area = $('.game-area');
    main_screen = $('.main-screen');
    high_score = $('.high-score');
    wheel = $('.wheel-wrapper');
    audio_flip = new Audio('assets/sounds/flip.mp3');
    audio_ping = new Audio('assets/sounds/ping.mp3');
    audio_break = new Audio('assets/sounds/break.mp3');
    audio_music = new Audio('assets/sounds/music.mp3');

    current_state = 0;
    is_stop = true;
    is_muted = true;
    level = 1;
    score = 0;
    deg = 0;
    timer = 2000;
    is_spinning = false;
}

function reset() {
    current_state = 0;
    is_stop = true;
    level = 0;
    score = 0;
    deg = 0;
    timer = 2000;
    is_spinning = false;
    $('#wheel').attr("style", "");
    $('.ball').remove();
    set_score(score);
    set_level();
}

function rotate_wheel(dir, r) {
    let wheel = $('#wheel');
    let d = deg + r;

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
        let ball_height = parseInt(ball.css('height'));

        ball.animate({
            top: wheel_top - ball_height,
        }, timer, 'easeInCubic');
    }
}

function check_ball() {
    let wheel_top = wheel.position().top;

    $('.ball').each(function () {
        let ball = $(this);
        let ball_top = ball.position().top;
        let ball_height = parseInt(ball.css('height'));
        let ball_state = parseInt(ball.attr('data-id'));

        if (ball_top >= wheel_top - ball_height - 10) {
            if (ball_state === current_state) {
                set_score(++score);
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
        $('.level span').html(level);
    }
}

function set_score(s) {
    $('.score span').html(s);
}

function stop_game() {
    is_stop = true;
    wheel.stop();
    $('.ball').stop();

    clearInterval(interval_throw);
    clearInterval(interval_check);
    save_high_score();
    show_high_score();
}

function start_game() {
    is_stop = false;
    interval_throw = setInterval(throw_ball, timer);
    interval_check = setInterval(check_ball, 1);
}

function restart_game() {
    reset();
    hide_high_score();
    start_game();
}

function toggle_sound() {
    is_muted = !is_muted;
    $('.sound').toggleClass('off');

    if (!is_muted) {
        audio_music.loop = true;
        play_sound(audio_music);
    }
    else {
        stop_sound(audio_music);
    }
}

function show_main_screen() {
    main_screen.removeClass('hidden');
    $('.shadow').removeClass('hidden');
    $('.name').focus();
}

function hide_main_screen() {
    main_screen.addClass('hidden');
    $('.shadow').addClass('hidden');
}

function save_high_score() {
    if (score > 0) {
        let scores = JSON.parse(localStorage.getItem('scores')) ?? [];
        let lowest = scores[scores.length - 1]?.score ?? 0;
        let score_item = {"name": player_name, "score": score};

        if (scores.length < 5 || score > lowest) {
            let is_updated = false;

            scores.map((item) => {
                if (item.name === player_name) {
                    is_updated = true;
                    if (score > item.score) return item.score = score;
                }
            })

            if (!is_updated)
                scores.push(score_item);

            scores.sort((a, b) => b.score - a.score);
            scores = scores.slice(0, 5);

            localStorage.setItem('scores', JSON.stringify(scores));
        }
    }
}

function show_high_score() {
    let scores = JSON.parse(localStorage.getItem('scores')) ?? [];
    let user_list = $('.user-list');

    if (scores.length > 0) {
        user_list.empty();

        $.each(scores, function (i, item) {
            let row = '<div class="row"><div class="pos">' + (i + 1) + '.</div><div class="user">' + item.name + '</div><div class="pts">' + item.score + ' pts</div></div>';
            user_list.append(row);
        })
    }

    high_score.removeClass('hidden');
    $('.shadow').removeClass('hidden');
}

function hide_high_score() {
    high_score.addClass('hidden');
    $('.shadow').addClass('hidden');
}

function set_player(name) {
    player_name = name;
    $('.player').html(player_name);
}

function set_game() {
    let input = $('[name=name]');
    let name = input.val();

    if (name === '') input.focus();
    else {
        input.val('');
        reset();
        set_player(name);
        hide_main_screen();
        start_game();
    }
}

$(document).ready(function() {
    initialize();

    document.addEventListener('keydown', function(e) {
        if (!is_stop) {
            if (e.code === 'ArrowLeft') rotate_wheel('left', -90)
            else if (e.code === 'ArrowRight') rotate_wheel('right', 90)
        }

        if ($(e.target).attr('class') !== "name" && e.code === 'KeyS')
            toggle_sound();
    });

    $(document).on('click', '#wheel .border', function(e) {
        if (!is_stop) {
            let window_width = parseInt($(window).width());

            if (e.pageX < window_width / 2) rotate_wheel('left', -90);
            else rotate_wheel('right', +90);
        }
    });

    $(document).on('click', '.sound', function() {
        toggle_sound();
    });

    $(document).on('click', 'button.start', function() {
        set_game();
    });

    $(document).on('click', 'button.restart', function() {
        restart_game();
    });

    $(document).on('click', 'button.new', function() {
        hide_high_score();
        show_main_screen();
    });

    $(document).on('keyup', 'input.name', function(e) {
        if (e.code === 'Enter' || e.code === 'NumpadEnter') set_game();
    });

});