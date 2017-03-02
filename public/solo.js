$(document).ready(function() {

  var incomplete;
  var checking = false;

  function onConfirm(element, clicked) {
    var question = $(element).attr('class');
		var response = $(element).text();
    $.get('save', { question: question, response: response, save: clicked } )
      .done(function() {
        var question = $(element).attr('class');
		    $('[class=' + question + ']').off();
      	$(element).addClass('confirmed');
        incomplete--;
        if (incomplete == 0) {
          onComplete();
        }
      });
  }

  function onComplete() {
    $.get('save', { complete: true } )
      .done(function() {
        $("<div></div>").text('Complete!').addClass('message').hide().prependTo('body').slideDown();
      });
  }

  $.get('load', function(data) {
    // count down until all questions completed
    incomplete = data.length;
    // build quiz table from GET data
    var table = $('<table></table>');
    $('#quiz').append(table);
	  for (var question = 1; question <= data.length; question++) {
	    var tr = $('<tr></tr>');
	    table.append(tr);
		  var td = $('<td></td>').text(question + '.');
      td.addClass('question');
		  tr.append(td);
		  var choices = data.choices.split('');
		  for (var choice in choices) {
		    var td = $('<td></td>').text(choices[choice]);
        td.attr('class', question);
			  tr.append(td);

        td.click(function(event) {
          // only if not handling an event
          if (!checking) {
            // save only if click() by user
            var clicked = event.originalEvent !== undefined;
            if (clicked) {
              checking = true;
              var element = this;
              var selected = $(element).hasClass('selected');
              if (selected) {
                $(this).removeClass('selected');
                onConfirm(element, clicked);
                checking = false;
              } else {
                $('.selected').removeClass('selected');
                $(this).addClass('selected');
                checking = false;
              }
            } else {
              onConfirm(element, clicked);
            }
          }
			  });
		  }
	  }

    // resume quiz on reload
    for (var q in data.answers) {
      for (var a in data.answers[q]) {
  		  $('[class='+q+']').filter(':contains('+data.answers[q][a]+')').click();
			}
    }
  });
});