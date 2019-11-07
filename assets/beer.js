var tapDefaults = ["Tap 16", "Temporarily", "Offline", "n/a", "n/a", "n/a", "empty", "1/12/1997", "empty", "1/12/1997", "n/a"];

function refreshTapList() {
  var taps_url = 'https://docs.google.com/spreadsheets/d/1SipVaaHNzAbI0F4C-wk_TPxxf8lVG4r4q-nqsI-uQhY/export?format=tsv&gid=0';
  var ondeck_url = 'https://docs.google.com/spreadsheets/d/1SipVaaHNzAbI0F4C-wk_TPxxf8lVG4r4q-nqsI-uQhY/export?format=tsv&gid=382420153';
  $.get(taps_url, function(tap_data) {
    $.get(ondeck_url, function(ondeck_data) {
      var taps = parseSheet(tap_data);
      var ondeck = parseSheet(ondeck_data);

      var nextUp = nextByStyle(ondeck);

      taps[0].ondeck = nextUp.cider[0];
      taps[1].ondeck = nextUp.ipa[0];
      taps[2].ondeck = nextUp.other[0];
      taps[3].ondeck = nextUp.kombucha[0];

      var divs = taps.map(renderTap);

      $('#taplist').empty().append(divs);
    });
  });
}

function parseSheet(data) {
  var lines = data.split("\n");
  // Remove header row
  lines.shift();

  var taps = lines.map(function(line) {
    var elems = line.split("\t");
    var values = elems.map(function(elem, idx) {
      if (elem.trim()) {
        return elem.trim();
      } else {
        return tapDefaults[idx];
      }
    });

    var tap = {tap: values[0],
               brewery: values[1],
               beer_name: values[2],
               style: values[3],
               abv: values[4],
               ibu: values[5],
               link: values[6],
               tap_date: values[7],
               vol: values[8],
               delivery_date: values[9],
               origin: values[10]}

    return tap;
  });

  return taps;
}

function renderTap(tap) {
  var div = '';
  div += '<div class="' + (tap.vol == 'empty' ? 'tap-table empty' : 'tap-table') + '">';
  div += '<h4 class="tap-index">' + tap.tap + '</h4>';
  div += '<h3>' + tap.brewery + '</h3>';
  div += '<h2>' + tap.beer_name + '</h2>';
  div += '<h5>' + tap.origin + '</h5>';
  div += '<div class="beer-data">';
  div += '<p><span class="label">Style:</span> <span class="value">' + tap.style + '</span></p>';
  div += '<p><span class="label">ABV:</span> <span class="value">' + tap.abv + '</p>';
  div += '<p><span class="label">IBU:</span> <span class="value">' + tap.ibu + '</span></p>';
  div += '<p><span class="label">Tap Date:</span> <span class="value">' + tap.tap_date + '</span></p>';
  div += '</div>';

  if (tap.ondeck) {
    div += renderOndeck(tap.ondeck);
  }

  div += '</div>';
  return div;
}

function renderOndeck(tap) {
  var div = '';
  div += '<div class="tap-table on-deck">';
  div +=   '<h3>' + tap.brewery + '</h3>';
  div +=   '<h2>' + tap.beer_name + '</h2>';
  div +=   '<h5>' + tap.origin + '</h5>';
  div +=   '<div class="beer-data">';
  div +=     '<p><span class="label">Style:</span> <span class="value">' + tap.style + '</span></p>';
  div +=     '<p><span class="label">ABV:</span> <span class="value">' + tap.abv + '</p>';
  div +=     '<p><span class="label">IBU:</span> <span class="value">' + tap.ibu + '</span></p>';
  div +=   '</div>';
  div += '</div>';
  return div;
}

function nextByStyle(ondeck) {
  var sortKey = function(tap) {
    // month/day/year
    var date = tap.delivery_date.split('/');
    // year, month, day
    return [date[2], date[0], date[1]];
  }

  ondeck.sort(function(elem1, elem2) {
    return sortKey(elem1) < sortKey(elem2);
  });

  var styles = {ipa: [], cider: [], other: [], kombucha: []};
  ondeck.forEach(function(tap) {
    if (tap.style.match(/ipa/i)) {
      styles.ipa.push(tap)
    } else if (tap.style.match(/cider/i)) {
      styles.cider.push(tap)
    } else if (tap.style.match(/kombucha/i)) {
      styles.kombucha.push(tap)
    } else {
      styles.other.push(tap)
    }
  });

  return styles;
}
