$(document).ready(function() {

  var incomplete;
  var checking = false;

  function onCorrect(element) {
    // disable row
    var question = $(element).attr('class');
    $('[class=' + question + ']').off();
    // nod head
    $(element).text('😄');
		$(element).css({ 'text-shadow': '0 0 20px rgba(0,255,0,0.5)' });
		for (var x = 1; x <= 2; x++) {
			$(element).animate({ top: -10 }, 50)
						    .animate({ top: 0 }, 50);
		}
    // count down questions left to answer
    incomplete--;
    if (incomplete == 0) {
      onComplete();
    }
    checking = false;
  }

  function onIncorrect(element) {
    // disable element
    $(element).off();
    // shake head
    $(element).text('😳');
		$(element).css({ 'text-shadow': '0 0 20px rgba(255,0,0,0.5)' });
		for (var x = 1; x <= 2; x++) {
			$(element).animate({ left: -3 }, 100 / 4)
						    .animate({ left: 3 }, 100 / 2)
						    .animate({ left: 0 }, 100 / 4);
		}
    // hide element
		$(element).animate({ opacity: 0}, 2000);
    checking = false;
  }

  function onComplete() {
    $.get('save', { complete: true } )
      .done(function() {
        $("<div></div>").text('Complete!').addClass('message').hide().prependTo('body').slideDown();
      });
  }

  $.get('load', function(data) {
    // questions to be completed
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
            var save = event.originalEvent !== undefined;
            if (save) {
              checking = true;
            }
            var question = $(this).attr('class');
					  var response = $(this).text();
            var element = this;
      		  $.get('save', { question: question, response: response, save: save } )
              .done(function(correct) {
                if (correct) {
                  onCorrect(element);
                } else {
                  onIncorrect(element);
                }
              });
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