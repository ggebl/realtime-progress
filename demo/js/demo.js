var minuteOptions = {
    labelText : 'zakázek',
    decimal : 1,
    total : 36,
    period : '10s',
    range : [
        {
            from : 0,
            to : 5,
            perc : 20
        },
        {
            from : 5,
            to : 10,
            perc : 80
        }
    ],
    start : '15s',
    callbacks : {
        done : function( obj ) {
            obj.rtSetTotal( obj.rtGetTotal() + 2 );
        }
    }
};

var hourOptions = {
    labelText : 'm<sup>2</sup>',
    decimal : 2,
    total : 6500,
    period : '24h',
    range : [
        {
            from : 0,
            to : 6,
            perc : 15
        },
        {
            from : 6,
            to : 12,
            perc : 50
        },
        {
            from : 12,
            to : 13,
            perc : 5
        },
        {
            from : 13,
            to : 22,
            perc : 25
        },
        {
            from : 22,
            to : 24,
            perc : 5
        }
    ],
    rangeUnit : 'h',
    start : '24h'
};

var dayOptions = {
    labelText : 'hod',
    decimal : 1,
    total : 220,
    period : '24s',
    range : [
        {
            from : 0,
            to : 6,
            perc : 15
        },
        {
            from : 6,
            to : 12,
            perc : 40
        },
        {
            from : 12,
            to : 13,
            perc : 5
        },
        {
            from : 13,
            to : 22,
            perc : 35
        },
        {
            from : 22,
            to : 24,
            perc : 5
        }
    ]
};

var noLabelOptions = {
    label : false,
    total : 100,
    period : '60s',
    range : [
        {
            from : 0,
            to : 60,
            perc : 100
        }
    ],
    start : '1m'
};

