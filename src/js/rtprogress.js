/**
 * Created by Filip Dokladal on 29.06.15.
 */

(function($) {


    var methods = {
        _init : function( options ) {

                var $this = $(this);
                var data = {};


            var map = function (val, min, max, mapMin, mapMax) {
                return parseFloat(mapMin + (mapMax - mapMin) * ((val - min) / (max - min)));
            };

            // default settings
            var defaultSettings = {
                label : true,
                labelText : 'hod',
                decimal : 0,
                total : 200,
                period : '60s',
                range : [
                    {
                        from : 0,
                        to : 60,
                        perc : 100
                    },
                ],
                rangeUnit : 's',
                refresh : '1s',
                animate : true,
                callbacks : {
                    reset : function ( obj ) {},
                    done : function ( obj ) {}
                },
                start : null
            };

                // run code here

                // init private methods
                data.privateMethods = {

                    // initiate function
                    init : function () {

                        data.refresh = parseInt(data.settings.refresh);

                        switch (data.settings.refresh[data.settings.refresh.length - 1].toLowerCase()) {
                            case 'm':
                                data.refresh *= 1000 * 60;
                                break;
                            case 'h':
                                data.refresh *= 1000 * 60 * 60;
                                break;
                        }

                        data.period = parseInt(data.settings.period);
                        data.periodUnit = data.settings.period[data.settings.period.length - 1].toLowerCase();
                        switch (data.periodUnit) {
                            case 'm':
                                data.period *= 1000 * 60;
                                break;
                            case 'h':
                                data.period *= 1000 * 60 * 60;
                                break;
                        }

                        var slider = $('<div class="rt-slider"><div class="rt-value"></div><div class="rt-bar"></div></div>');

                        data.container.html(slider);

                        // set starting time
                        data.privateMethods.setStartTime();


                        // first repeat
                        data.privateMethods.repeat();
                        // set interval for next repeats
                        data.interval = setInterval(data.privateMethods.repeat, data.refresh * 1000);
                    },

                    // calculate function for current value
                    getCurrent : function ( range) {
                        var d = new Date(),
                            t,
                            coef = 1;
                        t = (d.getTime() / 1000).toFixed(0) - data.start;
                        if (t >= data.period) {
                            if ( data.settings.start !== null && !data.waiting ) {
                                data.waiting = true;
                                data.privateMethods.callback();
                            } else if ( data.settings.start === null ){
                                data.privateMethods.callback();
                            }
                            if( t > data.startN){
                                data.privateMethods.reset();
                            }
                            return 0;
                        } else if ( t < 0) {
                            return 0;
                        }

                        if ( data.waiting ) {
                            data.waiting = false;
                        }

                        switch(data.settings.rangeUnit.toLowerCase()) {
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
                                value += map(
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
                        var perc = data.privateMethods.getCurrent(data.settings.range);

                        var value = (perc / 100 * data.settings.total).toFixed(data.settings.decimal);

                        if (data.settings.animate) {
                            data.container.find('.rt-bar').animate({height : perc + '%'}, 500);
                            data.container.find('.rt-value').animate({bottom : perc + '%'}, 500);
                        } else {
                            data.container.find('.rt-bar').css('height', perc + '%');
                            data.container.find('.rt-value').css('bottom', perc + '%');
                        }
                        if (data.settings.label) {
                            data.container.find('.rt-value').html(value + ' ' + data.settings.labelText);
                        }

                    },

                    // set starting time
                    setStartTime : function() {
                        if (data.settings.start === null) {
                            var d = new Date();
                            data.start = (d.getTime() / 1000).toFixed(0);
                        } else {
                            var tmp = parseInt(data.settings.start);
                            var startUnit = data.settings.start[data.settings.start.length - 1].toLowerCase();
                            switch (startUnit) {
                                case 'm':
                                    tmp *= 60;
                                    break;
                                case 'h':
                                    tmp *= 60 * 60;
                                    break;
                            }
                            data.startN = tmp;
                            data.start = data.privateMethods.getNextStart(data.startN);
                        }
                    },

                    // calculate next start
                    getNextStart : function( sec ) {
                        sec = parseInt(sec);
                        var d = new Date();
                        var s = parseInt((d.getTime() / 1000).toFixed(0));
                        var mod = s % sec;
                        var nextStart = s + ( ( mod >= data.period ) ? ( sec - mod) : ( -mod ) );
                        return nextStart;

                    },

                    // callback
                    callback : function () {
                        data.privateMethods.setStartTime();
                        data.settings.callbacks.done( data.container );
                    },

                    // reset
                    reset : function () {
                        data.privateMethods.setStartTime();
                        data.settings.callbacks.reset( data.container );
                    }
                };

            data.settings = $.extend(true, defaultSettings, options);

            data.container = $(this);

            data.privateMethods.init();
            $this.data(data);

            return this;

        },

        // public methods

        // destroy rt
        destroy : function( all ) {

            if(all === undefined)
                all = false;

            $(this).data('container').html('');
            clearInterval($(this).data().interval);

            $(this).removeData();

            if(all)
                $(this).remove();
        },

        // reset rt
        reset : function() {

            $(this).data('privateMethods').reset();

        },

        // reset rt
        getTotal : function() {

            return $(this).data().settings.total;

        },

        // set total
        setTotal : function(total) {
            var settings = $(this).data('settings');

            settings.total = total;

            $(this).data('settings',settings);
        }

    };

    $.fn.rtProgress = function() {
        var method = arguments[0];

        if(methods[method] && method[0] != '_') {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if( typeof(method) == 'object' || !method ) {
            method = methods._init;
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.rtProgress' );
            return this;
        }

        return method.apply(this, arguments);

    }

})(jQuery);
