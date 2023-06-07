# KOLEO Widget

Widget KOLEO, to prosty sposób, by dodać [wyszukiwarkę rozkładu jazdy z cenami pociągów](https://koleo.pl) na swoją stronę.

[Podgląd widgetu](https://widget.koleo.pl/kdp)

# Aby umieścić widget na stronie
Wersja uproszczona: umieść poniższy fragment w wybranym miejscu w pliku HTML.
```
<div class="koleo-widget-container"></div>
<script src="https://widget.koleo.pl/kdp/widget/javascripts/load-widget-simple.js"></script>
```
[Przykładowe użycie](https://widget.koleo.pl/kdp/example_embed_simple.html)

Alternatywnie: Umieść następujący skrypt uzupełniając argument `selektor` odpowiednią wartością, wskazującą na istniejący element HTML.
```
var el = document.createElement('script');
document.head.appendChild(el);
el.src = 'https://widget.koleo.pl/kdp/widget/javascripts/load-widget.js';
el.onload = function(script){
    KoleoWidgetLoader.loadWidget(selektor);
};
```

[Przykładowe użycie](https://widget.koleo.pl/kdp/example_embed.html)

# Licencja

Wykorzystanie widgetu na stronie wymaga pisemnej zgody KOLEO, zgłoszenie proszę wysłać na adres: widget@koleo.pl
Copyright © 2015-2020 Astarium. Wszelkie prawa zastrzeżone.
