var KoleoWidget = {
    SPECIAL_CHAR_REGEXP:       (/[_|\/|\s]+/g),
    MULTI_SEPARATOR_REGEXP:    (/[\-]+/g),
    TRIM_SEPARATOR_REGEXP:     (/^-+|-+$/g),
    TRIM_WHITESPACE_REGEXP:    (/^(\s|\u00A0)+|(\s|\u00A0)+$/g),
    MULTI_WHITESPACE_REGEXP:   (/\s+/g),
    POLISH_CHARS:              [/[ąĄ]/g, /[ćĆ]/g, /[ęĘ]/g, /[łŁ]/g, /[ńŃ]/g, /[óÓ]/g, /[śŚ]/g, /[żŻ]/g, /[źŹ]/g],
    POLISH_CHAR_REPLACEMNETS:  ['a', 'c', 'e', 'l', 'n', 'o', 's', 'z', 'z'],
    SEPARATOR:                 '-',
    SPACE:                     ' ',
    EMPTY:                     '',
    TYPE_UNDEFINED:            'undefined',

    initAll: function(selector) {
        var that = this;
        $(selector).each(function() {
            if (!$(this).data('already-added')) {
                $(this).data('already-added', true);
                that.init($(this));
            }
        })
    },

    init: function(selector) {
        var that = this;

        this.insertWidget(selector);
        this.addStyles();
        this.bindDatePicker(selector);
        this.initCustomSelect(selector);

        $(selector).find('form.koleo-widget').on('submit', function(event) {
            event.preventDefault();

            var startStation = that.parameterize($(selector).find('.start_station').val());
            var endStation = that.parameterize($(selector).find('.end_station').val());
            var formattedDate = that.formatDate($(selector).find('.date').val());
            var date = new Date(formattedDate);

            if (isNaN(date.valueOf())) {
                date = new Date();
            }

            var day = ('0' + date.getDate()).slice(-2);
            var month = ('0' + (date.getMonth() + 1)).slice(-2);
            var year = date.getFullYear();
            var hour = ('0' + date.getUTCHours()).slice(-2);

            var koleoDate = day + '-' + month + '-' + year + '_' + hour + ':00';

            var selectedCarriers = 'all/' + 'KD' + '/closed';
            window.location = 'https://koleo.pl/rozklad-pkp/' + startStation + '/' + endStation + '/' + koleoDate + '/'+ selectedCarriers + '?utm_medium=widget&utm_source=' + window.location.hostname;
        });
    },

    insertWidget: function(selector) {
        var html = ""
        var no_text = $(selector).data('no-text');
        if (no_text !== true) {
            html = '<a href="https://koleo.pl?utm_medium=widget&utm_source=' + window.location.hostname + '" title="KOLEO - rozkład jazdy i ceny biletów">Rozkład jazdy dostarcza <img src="https://koleo.pl/assets/logo.png"></a>';
        }
        html += `<form class="koleo-widget">
        <div class="flex-item"><select class="start_station" name="start_station" autocomplete="off">
                <option value="wroclaw-glowny" selected>WROCŁAW GŁÓWNY</option>
                <option value="legnica">LEGNICA</option>
                <option value="lubin">LUBIN</option>
                <option value="glogow">GŁOGÓW</option>
                <option value="zielona-gora-glowna">ZIELONA GÓRA GŁÓWNA</option>
                <option value="szczecin-dabie">SZCZECIN DĄBIE</option>
                <option value="miedzyzdroje">MIĘDZYZDROJE</option>
                <option value="swinoujscie">ŚWINOUJŚCIE</option>
            </select>
        </div>
        <div class="flex-item"><select class="end_station" name="end_station" autocomplete="off">
            <option value="wroclaw-glowny">WROCŁAW GŁÓWNY</option>
            <option value="legnica">LEGNICA</option>
            <option value="lubin">LUBIN</option>
            <option value="glogow">GŁOGÓW</option>
            <option value="zielona-gora-glowna">ZIELONA GÓRA GŁÓWNA</option>
            <option value="szczecin-dabie">SZCZECIN DĄBIE</option>
            <option value="miedzyzdroje">MIĘDZYZDROJE</option>
            <option value="swinoujscie" selected>ŚWINOUJŚCIE</option>
            </select>
        </div>
        <div class="flex-item"><input class="date" name="date" type="text" placeholder="KIEDY" autocomplete="off"></div>
        <div class="flex-item"><input class="submit" type="submit" value="Kup bilet"></div>
    </form>`
        var container = $(selector);
        var that = this;
        container.append(html);

        that.resizeContainer(container);
        $(window).resize(function() {
            that.resizeContainer(container);
        });
    },

    addStyles: function() {
        // var cssLink = $("<link>", { rel: "stylesheet", type: "text/css", href: "/widget/stylesheets/widget.css" });
        // var cssLink2 = $("<link>", { rel: "stylesheet", type: "text/css", href: "/widget/stylesheets/autocomplete.css" });
        // var cssLink3 = $("<link>", { rel: "stylesheet", type: "text/css", href: "/widget/stylesheets/customA11ySelect.css" });
        // var cssLink4 = $("<link>", { rel: "stylesheet", type: "text/css", href: "/widget/stylesheets/foundation-datepicker.css" });
        var cssLink = $("<link>", { rel: "stylesheet", type: "text/css", href: "https://widget.koleo.pl/kdp/widget/stylesheets/widget.css" });
        var cssLink2 = $("<link>", { rel: "stylesheet", type: "text/css", href: "https://widget.koleo.pl/kdp/widget/stylesheets/autocomplete.css" });
        var cssLink3 = $("<link>", { rel: "stylesheet", type: "text/css", href: "https://widget.koleo.pl/kdp/widget/stylesheets/customA11ySelect.css" });
        var cssLink4 = $("<link>", { rel: "stylesheet", type: "text/css", href: "https://widget.koleo.pl/kdp/widget/stylesheets/foundation-datepicker.css" });
        var cssLink5 = $("<link>", { rel: "stylesheet", type: "text/css", href: "https://fonts.googleapis.com/css?family=Lato" });

        cssLink.appendTo('head');
        cssLink2.appendTo('head');
        cssLink3.appendTo('head');
        cssLink4.appendTo('head');
        cssLink5.appendTo('head');
    },

    initCustomSelect: function(selector) {
        $(selector).find('.start_station, .end_station').customA11ySelect();
    },

    getData: function(term, $awesomecomplete, onData) {
        $.ajax({
            url: 'https://koleo.pl/ls.js?callback=?',
            type: 'js',
            dataType: 'jsonp',
            data: {
                q: term
            },

            success: function(data) {
               onData(data.stations);
            },

            error: function(data) {
                onData([]);
            }
        });
    },

    bindDatePicker: function(selector) {
        var dateInput = $(selector).find('.date');
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth();
        var day = today.getDate();
        var hour = today.getHours();

        var startDate = new Date(year, 5 , 22 - 1, hour);
        var initialDate = new Date(year, 5, 22, hour);
        var endDate = new Date(2024, 8, 1, 23);

        var workdays = (function(start, end) {
            for(var arr=[],dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
                var d = new Date(dt)

                if (d.getDay() === 0 || d.getDay() === 6 || (d.getDate() === 15 && d.getMonth() === 7)) {
                    continue;
                }
                arr.push(new Date(dt));
            }
            return arr;
        })(startDate, endDate);

        function nearestWeekendFrom(date) {
            if (date.getMonth() === 7 && (date.getDate() === 14 || date.getDate() === 15)) {
                return new Date(date.getFullYear(), 7, 15);
            } else {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (date.getDay() === 0 ? 0 : 6 - date.getDay()))
            }
        }

        dateInput.fdatepicker({
            initialDate: nearestWeekendFrom(initialDate),
            format: 'dd-mm-yyyy',
            language: 'pl',
            weekStart: 1,
            minView: 'month',
            minView: 'month',
            startDate: nearestWeekendFrom(startDate),
            endDate: endDate,
            datesDisabled: workdays.map(d => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`),
        });
    },

    formatDate: function(foundationFormatDate) {
        var day = foundationFormatDate.substr(0, 2);
        var month = foundationFormatDate.substr(3, 2);
        var year = foundationFormatDate.split(' ')[0].split('-').pop();
        var hour = '06:00';
        return year + '-' + month + '-' + day  + 'T' + hour + '+00:00';
    },

    parameterize: function(string, wordLimit) {
        for (var i = 0; i < this.POLISH_CHARS.length; i++) {
            string = string.replace(this.POLISH_CHARS[i], this.POLISH_CHAR_REPLACEMNETS[i]);
        }

        if(wordLimit && typeof wordLimit === 'number') {
            string = string.replace(this.TRIM_WHITESPACE_REGEXP, this.EMPTY)
                         .replace(this.MULTI_WHITESPACE_REGEXP, this.SPACE)
                         .split(this.SPACE)
                         .join(this.SPACE);
        }

        return string.replace(this.SPECIAL_CHAR_REGEXP, this.SEPARATOR)    // replace underscores, slashes and spaces with separator
                     .replace(this.MULTI_SEPARATOR_REGEXP, this.SEPARATOR) // replace multiple occurring separators
                     .replace(this.TRIM_SEPARATOR_REGEXP, this.EMPTY)      // trim leading and trailing separators
                     .replace('.', this.SEPARATOR)                    // replace dots with separator
                     .toLowerCase();                             // convert to lowercase

    },

    resizeContainer: function(container) {
        if (container.width() > 800)
            container.addClass('koleo-wide-widget');
        else
            container.removeClass('koleo-wide-widget');
    }
};
