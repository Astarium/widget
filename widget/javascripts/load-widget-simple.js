var el = document.createElement('script');
document.head.appendChild(el);
el.src = '//widget.koleo.pl/widget/javascripts/load-widget.js';
el.onload = function(){
    KoleoWidgetLoader.loadWidget(document.getElementsByClassName('koleo-widget-container'));
};
