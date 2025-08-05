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

    startStation: undefined,
    endStation: undefined,

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

        this.initDataParams(selector);
        this.insertWidget(selector);
        this.addStyles();
        this.bindDatePicker(selector);
        this.showLiveSearch(selector);

        $(selector).find('form.koleo-widget').on('submit', function(event) {
            event.preventDefault();

            var startStation = that.parameterize($(selector).find('.start_station').val());
            var endStation = that.parameterize($(selector).find('.end_station').val());
            var formattedDate = that.formatDate($(selector).find('.date').val());
            var date = new Date(formattedDate);

            if (!startStation || !endStation) return
            if (isNaN(date.valueOf())) {
                date = new Date();
            }

            var day = ('0' + date.getDate()).slice(-2);
            var month = ('0' + (date.getMonth() + 1)).slice(-2);
            var year = date.getFullYear();
            var hour = ('0' + date.getUTCHours()).slice(-2);

            var koleoDate = day + '-' + month + '-' + year + '_' + hour + ':00';

            const brands = $(selector).data('brands');
            const target = $(selector).data('target');
            const query = new URLSearchParams({
                utm_medium: 'widget',
                utm_source: window.location.hostname,
                ...(brands ? { brands } : {})
            })
            const url = new URL(`/rozklad-pkp/${startStation}/${endStation}/${koleoDate}?${query.toString()}`, 'https://koleo.pl') 

            window.open(url, target === '_blank' ? '_blank' : '_self');
        });
    },

    initDataParams: function(selector) {
        this.startStation = $(selector).data('start');
        this.endStation = $(selector).data('end');
    },

    insertWidget: function(selector) {
        const no_text = $(selector).data('no-text');
        const html = `
            ${no_text !== true
                ? `<a href="https://koleo.pl?utm_medium=widget&utm_source=${window.location.hostname}" title="KOLEO - rozkład jazdy i ceny biletów">Rozkład jazdy dostarcza <img src="https://koleo.pl/assets/logo.png"></a>`
                : ''
            }
            <form class="koleo-widget">
                <div class="flex-item">
                    <input class="start_station" name="start_station" type="text" placeholder="Z" autocomplete="off" ${this.startStation ? 'disabled' : ''}>
                </div>
                <div class="flex-item">
                    <input class="end_station" name="end_station" type="text" placeholder="DO" autocomplete="off" ${this.endStation ? 'disabled' : ''}>
                </div>
                <div class="flex-item">
                    <input class="date" name="date" type="text" placeholder="KIEDY" autocomplete="off">
                </div>
                <div class="flex-item">
                    <input class="submit" type="submit" value="Znajdź połączenie i kup bilet!">
                </div>
            </form>`

        const container = $(selector);
        container.append(html);

        if (this.startStation) $('input.start_station').val(this.startStation)
        if (this.endStation) $('input.end_station').val(this.endStation)

        this.resizeContainer(container);
        $(window).resize(() => {
            this.resizeContainer(container);
        });
    },

    addStyles: function() {
        var cssLink = $("<link>", { rel: "stylesheet", type: "text/css", href: `${window.KOLEO_BASE_URL || ''}/widget/stylesheets/widget.css` });
        var cssLink2 = $("<link>", { rel: "stylesheet", type: "text/css", href: `${window.KOLEO_BASE_URL || ''}/widget/stylesheets/autocomplete.css` });
        var cssLink3 = $("<link>", { rel: "stylesheet", type: "text/css", href: `${window.KOLEO_BASE_URL || ''}/widget/stylesheets/awesomecomplete.css` });
        var cssLink4 = $("<link>", { rel: "stylesheet", type: "text/css", href: `${window.KOLEO_BASE_URL || ''}/widget/stylesheets/foundation-datepicker.css` });
        var cssLink5 = $("<link>", { rel: "stylesheet", type: "text/css", href: "https://fonts.googleapis.com/css?family=Lato" });

        cssLink.appendTo('head');
        cssLink2.appendTo('head');
        cssLink3.appendTo('head');
        cssLink4.appendTo('head');
        cssLink5.appendTo('head');
    },

    showLiveSearch: function(selector) {
        $(selector).find('.start_station, .end_station').awesomecomplete({
            noResultsMessage: 'Nie ma takiej stacji.',
            dataMethod: this.getData,
            valueFunction: function(dataItem) {
                return dataItem.name;
            },
            renderFunction: function(dataItem) {
                return '<p class="title">' + dataItem.name + '</p>';
            },
            highlightMatches: false,
            typingDelay: 200
        });
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

        var startDate = new Date(year, month, day - 1, hour);
        var initialDate = new Date(year, month, day, hour);
        var endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 90);

        dateInput.fdatepicker({
            initialDate: initialDate,
            format: 'dd-mm-yyyy hh:ii',
            language: 'pl',
            weekStart: 1,
            minView: 1,
            startDate: startDate,
            endDate: endDate
        });
    },

    formatDate: function(foundationFormatDate) {
        var day = foundationFormatDate.substr(0, 2);
        var month = foundationFormatDate.substr(3, 2);
        var year = foundationFormatDate.split(' ')[0].split('-').pop();
        var hour = foundationFormatDate.split(' ').pop();
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
