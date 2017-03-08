$(document).ready(function() {

  var incomplete;
  var checking = false;

  function onConfirm(element) {
    var question = $(element).attr('class');
    // disable row
    $('[class=' + question + ']').off();
    // mark confirmed
   	$(element).addClass('confirmed');
    // count down questions left to answer
    incomplete--;
    if (incomplete == 0) {
      onComplete();
    }
    checking = false;
  }

  function onComplete() {
    $.get('save', { complete: true })
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
                $(element).removeClass('selected');
                var question = $(element).attr('class');
		            var response = $(element).text();
                $.get('save', { question: question, response: response, save: clicked } )
                  .done(function() {
                    onConfirm(element);
                  });
              } else {
                $('.selected').removeClass('selected');
                $(element).addClass('selected');
                checking = false;
              }
            }
          }
			  });
		  }
	  }
  })
  .done(function(data) {
    // resume quiz on reload
    for (var q in data.answers) {
      for (var a in data.answers[q]) {
  	    var element = $('[class='+q+']').filter(':contains('+data.answers[q][a]+')');
        onConfirm(element);
		  }
    }
  });

});