class Demineur {
    constructor() {
        this.root = $('body');
        this.toolbar = $('.root #toolbar');
        this.gameboard = $('#gameboard #main');
        this.timer = $('#stopwatch');
        this.flags = $('#flag');

        this.size = 10;

        this.grid = [];

        this.first_click = true;
        
        this.time = 0;
        this.timer_func_id = null;

        this.showed = [];
        this.playing = true;

        this.right_mousedown = false;

        this.flag_count = 0;

        this.bomb_factor = 2;

        this.draw();
        this.bombs();
        this.events();

        this.root.draggable();
    }

    // Draw the table
    draw() {
        for(var _line = 0; _line < this.size; _line++) {

            var temp = [];
            var line = $('<div class="line row">');
            line.data('line', _line);

            for(var _column = 0; _column < this.size; _column++) {
                
                var column = $('<div class="column col hidden p-0">');
                column.data('column', _column).data('line', _line).data('bomb', false).data('flag', false);

                temp.push(column);
                line.append(column);
            }

            this.grid.push(temp);
            this.gameboard.append(line);
        }
    }

    // Position bombs on the table
    bombs() {
        var tot = this.size * this.bomb_factor;
        while(tot > 0) {
            var line = this.rand(0, this.size);
            var column = this.rand(0, this.size);

            if(!this.grid[line][column].data('bomb')) {

                this.grid[line][column].data('bomb', true);
                this.flag_count++;
                tot--;
            }
        }

        this.update_flag(this);
    }

    // Link events
    events() {
        var ths = this;

        $(document).on('click', '.line .column.hidden', {ths}, this.click_gameboard);
        $(document).on('mousemove', {ths}, this.mousemove_gameboard);
        $(document).on('contextmenu', '.line .column', {ths}, this.contextmenu_gameboard);     
        $(document).on('mousedown', '.line .column.had-number', function(e) {
            if(e.button == 2) {
                ths.right_mousedown = true;
                ths.show_neighbours($(e.target));
            }
        });
        $(document).on('mouseup', '.line .column.had-number', function(e) {
            if(e.button == 2)
                ths.right_mousedown = false;
            $(".line .column.lightness").removeClass('lightness');
        });
        $(document).on('click', '.btn-retry', {ths}, this.click_retry);
    }

    // Show a row and it's neighbours if their not bombs
    show(target) {
        target.html('');
        this.showed.push(target);
        
        var nb_bombs = this.count_bombs(target);

        // If there is no bombs around the row
        // we start to reveal all his neighbours
        if(nb_bombs == 0) {
            var neighbours = this.get_neighbours(target);
            neighbours.forEach(e => {
                if(this.showed.indexOf(e) == -1) {
                    this.show(e);
                }
            })
        }
        else {
            target.html('<p class="num _' + nb_bombs + '">' + nb_bombs + '</p>');
        }

        target.removeClass('hidden');
        
        if(nb_bombs > 0) {
            target.addClass('had-number');
        }
        
        var rest = this.grid.flat().filter(e => (!$(e).data('bomb') && $(e).hasClass('hidden'))).length;
        if(rest == 0) {
            var ths = this;
            setTimeout(function() {
                ths.win(ths);
            } , 0)
        }
    }
    
    // Used when user right click on a row with a number
    // to highlight his hidden neighbours
    show_neighbours(target) {
        var neighbours = this.get_neighbours(target);
        neighbours.forEach((e, i) => $(e).addClass('lightness'));
    }

    // Show or Hide or flag on right clicking on a hidden row
    toggle_flag(target) {
        if(target.data('flag')) {
            this.flag_count += 1;

            var flag = target.find('.flag-column');
            flag.animate({opacity: 0, top: '-50px'}, 200);
            setTimeout(function() {
                flag.remove();
            }, 200);

            target.data('flag', false);
        }
        else {
            if(this.flag_count == 0)
                return;

            this.flag_count -= 1;

            var flag = $('<i class="fa fa-2x fas fa-flag flag-column"></i>');
            target.append(flag);
            target.data('flag', true);
            flag.animate({opacity:1, top: 0});
        }

        this.update_flag(this);
    }

    // Called when user win the game
    win(ths) {
        ths = ths || this;

        ths.playing = false;
        clearInterval(ths.timer_func_id);

        $("#voile #content p").text("GAGNER !");
        $("#voile .btn-retry").text("Rejouer");

        setTimeout(function() {
            $("#voile").fadeIn(400);
            setTimeout(function() {
                $("#voile div").css({transform: 'scale(1)'});
            }, 400);
        }, 500);
    }

    // Called when user loose the game
    loose() {
        this.playing = false;
        clearInterval(this.timer_func_id);

        this.grid.flat().filter(e => $(e).data('bomb')).forEach(e => {
            var t = (Math.floor(Math.random() * (+500 - +200)) + +200);
            setTimeout(function() {
                $(e).html('').addClass('explode').append('<i class="fa fas fa-bomb"></i>');
            }, t);        
        });

        $("#voile #content p").text("PERDU !");
        $("#voile .btn-retry").text("Rejouer");

        setTimeout(function() {
            $("#voile").fadeIn(400);
            setTimeout(function() {
                $("#voile div").css({transform: 'scale(1)'});
            }, 400);
        }, 500);
    }

    // Called when user when to restart his game
    retry() {
        $("#voile div").css({transform: 'scale(0)'});
        setTimeout(function() {
            $("#voile").fadeOut(200);
        }, 200);
        
        this.hide_gameboard();
        this.show_gameboard();

        clearInterval(this.timer_func_id);
        
        this.timer.text("000");

        this.grid = [];

        this.first_click = true;

        this.time = 0;
        this.timer_func_id = null;

        this.showed = [];
        this.playing = true;

        this.flag_count = 0;

        this.draw();
        this.bombs();
    }

    // Start the timer on user first click
    start_timer() {
        var ths = this;
        this.first_click = false;
        this.timer_func_id = setInterval(function(){ ths.update_timer(ths)}, 1000);
    }
    
    //  -------------- EVENTS ---------------------- //
    click_gameboard(e) {
        var obj = e.data.ths;
        var target = $(e.target);
        
        if(!obj.playing) {
            return;
        }

        if(obj.first_click) {
            obj.start_timer();
        }

        if(target.data('bomb') === true) {
            obj.loose();
        }
        else {
            if(target.data('flag') === false ) {
                obj.show(target);
            }
        }

    }

    mousemove_gameboard(e) {
        
        if(!$(e.target).hasClass('had-number')) {
            $(".line .column.lightness").removeClass('lightness');
            return false;
        }
        
        var obj = e.data.ths;
        var target = $(e.target);

        if(!obj.right_mousedown == true)
            return;

        $(".line .column.lightness").removeClass('lightness');
        obj.show_neighbours(target);

        return false;
    }

    contextmenu_gameboard(e) {
        var obj = e.data.ths;
        var target = $(e.target);

        obj.right_mousedown = false;
        $(".line .column.lightness").removeClass('lightness');            
        
        if(target.hasClass('column') && target.hasClass('hidden')) {
            obj.toggle_flag(target);
        }

        return false;
    }

    // This method is called by each `Rejour`button
    click_retry(e) {
        var obj = e.data.ths;
        obj.retry();
    }
    // --------------------------------------------- //


    //  -------------- UTILS ---------------------- //

    // Return a list of the neighbours or a given `target`
    get_neighbours(target) {
        var temp = [];
        var line = target.data('line');
        var column = target.data('column');

        for(var _line = line - 1; _line < line + 2; _line++) {
            if(_line < 0 || _line > this.size - 1)
                continue;

            for(var _column = column - 1; _column < column + 2; _column++) {
                if(_column < 0 || _column > this.size - 1)
                    continue;

                if(_column == column && _line == line)
                    continue;

                temp.push(this.grid[_line][_column]);
            }
        }
        
        return temp;
    }

    // Count numbers of bomb around `target`
    count_bombs(target) {
        var neighbours = this.get_neighbours(target);
        return neighbours.reduce((a, b) => a + (b.data('bomb') ? 1 : 0), 0);
    }

    // Called to display game board
    show_gameboard() {
        $("#gameboard #main").slideDown();
    }

    // Called to hide game board
    hide_gameboard() {
        $("#gameboard #main").slideUp();
        $("#gameboard #main .line").remove();
    }

    // Called each second to update timer
    update_timer(ths) {
        ths.time += 1;
        ths.timer.text((ths.time + '').padStart(3,0));
    }

    // Called each time user show or hide an flag,
    // Update the count flag indicator
    update_flag(ths) {
        this.flags.text((this.flag_count + '').padStart(3, 0));
    }

    // Return random value between [min, max[
    rand(min, max) {
        return Math.floor(Math.random() * (+max - +min)) + +min
    }
    // -------------------------------------------- //
}

new Demineur();