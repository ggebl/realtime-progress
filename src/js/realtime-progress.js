/**
 * Created by Filip Dokladal on 27.06.15.
 */

(function($) {

    // plugin method
    $.fn.rtProgress = function( options ) {

        // default settings
        var defaultSettings = {
            label : true,
            labelText : 'hod',
            decimal : 0,
            total : 200,
            period : '1m',
            range : [
                {
                    from : 0,
                    to : 59,
                    perc : 100
                },
            ],
            rangeUnit : 's',
            refresh : '1s',
            animate : true,
            callbacks : {
                reset :function ( obj ) {},
                done :function ( obj ) {}
            },
            start : null
        };
        // settings
        var settings;

        // container
        var container;

        // interval
        var interval;

        // refresh time in seconds
        var refresh;

        // period time in seconds
        var period;

        // period unit (s/m/h)
        var periodUnit;

        // starting time in seconds
        var start;

        // start every n seconds
        var startN;

        // waiting state
        var waiting = false;

        // private methods
        var methods = {

            // initiate function
            init : function () {

                refresh = parseInt(settings.refresh);

                switch (settings.refresh[settings.refresh.length - 1].toLowerCase()) {
                    case 'm':
                        refresh *= 1000 * 60;
                        break;
                    case 'h':
                        refresh *= 1000 * 60 * 60;
                        break;
                }

                period = parseInt(settings.period);
                periodUnit = settings.period[settings.period.length - 1].toLowerCase();
                switch (periodUnit) {
                    case 'm':
                        period *= 1000 * 60;
                        break;
                    case 'h':
                        period *= 1000 * 60 * 60;
                        break;
                }

                var slider = $('<div class="rt-slider"><div class="rt-value"></div><div class="rt-bar"></div></div>');

                container.html(slider);

                // set starting time
                methods.setStartTime();


                // first repeat
                methods.repeat();
                // set interval for next repeats
                interval = setInterval(methods.repeat, refresh * 1000);
            },

            // map function
            map : function (val, min, max, mapMin, mapMax) {
                return parseFloat(mapMin + (mapMax - mapMin) * ((val - min) / (max - min)));
            },

            // calculate function for current value
            getCurrent : function (max, range) {
                var d = new Date(),
                    t,
                    coef = 1;
                t = (d.getTime() / 1000).toFixed(0) - start;
                console.log(t);
                console.log(start);
                if (t >= period) {
                    if ( settings.start !== null && !waiting ) {
                        waiting = true;
                        methods.callback();
                    } else if ( settings.start === null ){
                        methods.callback();
                    }
                    if( t > startN){
                        methods.reset();
                    }
                    return 0;
                } else if ( t < 0) {
                    return 0;
                }

                if ( waiting ) {
                    waiting = false;
                }

                switch(settings.rangeUnit.toLowerCase()) {
                    case 'm':
                        coef = 60;
                        break;
                    case 'h':
                        coef = 3600;
                        break;
                }
                var value = 0;
                var tmp = 0;
                for(var i = 0; i < range.length; i++) {
                    if(t >= (range[i].from * coef) && t < (range[i].to * coef)) {
                        if (i == range.length - 1)
                            tmp = -1;
                        value += methods.map(
                            t,
                            (range[i].from * coef),
                            (range[i].to * coef) + tmp,
                            0,
                            range[i].perc
                        );
                        break;
                    } else {
                        value += range[i].perc;
                    }
                };
                return value;
            },

            // recurrent function for interval
            repeat : function () {
                var perc = methods.getCurrent(settings.total, settings.range);

                var value = (perc / 100 * settings.total).toFixed(settings.decimal);

                if (settings.animate) {
                    container.find('.rt-bar').animate({height : perc + '%'}, 500);
                    container.find('.rt-value').animate({bottom : perc + '%'}, 500);
                } else {
                    container.find('.rt-bar').css('height', perc + '%');
                    container.find('.rt-value').css('bottom', perc + '%');
                }
                if (settings.label) {
                    container.find('.rt-value').html(value + ' ' + settings.labelText);
                }

            },

            // set starting time
            setStartTime : function() {
                if(settings.start === null) {
                    var d = new Date();
                    start = (d.getTime() / 1000).toFixed(0);
                } else {
                    var tmp = parseInt(settings.start);
                    var startUnit = settings.start[settings.start.length - 1].toLowerCase();
                    switch (startUnit) {
                        case 'm':
                            tmp *= 60;
                            break;
                        case 'h':
                            tmp *= 60 * 60;
                            break;
                    }
                    startN = tmp;
                    start = methods.getNextStart( startN );
                }
            },

            // calculate next start
            getNextStart : function( sec ) {
                sec = parseInt(sec);
                var d = new Date();
                var s = parseInt((d.getTime() / 1000).toFixed(0));
                var mod = s % sec;
                var nextStart = s + ( ( mod >= period ) ? ( sec - mod) : ( -mod ) );
                return nextStart;

            },

            // callback
            callback : function () {
                methods.setStartTime();
                settings.callbacks.done( container );
            },

            //reset
            reset : function () {
                methods.setStartTime();
                settings.callbacks.reset( container );
            }
        };


        // public methods

        // set total
        this.rtSetTotal = function ( total ) {
            settings.total = parseFloat( total );
        };

        // get total
        this.rtGetTotal = function () {
            return settings.total;
        };

        // Establish our default settings
        settings = $.extend(defaultSettings, options);
        container = this;

        methods.init();

        return this;
    };

}(jQuery));