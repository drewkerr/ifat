$(document).ready(function() {

  var length;
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
    updateProgress();
    checking = false;
  }

  function updateProgress() {
    var complete = length - incomplete;
    $('.message').text(complete + ' / ' + length);
    $('.progress').css({'width': parseInt(complete/length*100) + '%'});
  }

  function onComplete() {
    $.get('save', { complete: true })
      .done(function() {
        $('.progress').css({'height': 0});
        $('.message').text('Complete!').addClass('complete');
        $('#quiz').fadeOut(1000);
        $('#instructions').fadeOut(1000);
        $('body').css({'margin-top': '4em', 'text-align': 'center'});
        $('<a href="javascript:history.back()"></a>').text('Start new session').addClass('button').appendTo('body');
      });
  }

  $.get('load', function(data) {
    // count down until all questions completed
    length = data.length;
    incomplete = data.length;
    // build quiz table from GET data
    var table = $('<table></table>').hide();
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
    table.fadeIn(1000);
  })
  .done(function(data) {
    // resume quiz on reload
    for (var q in data.answers) {
      for (var a in data.answers[q]) {
  	    var element = $('[class='+q+']').filter(':contains('+data.answers[q][a]+')');
        onConfirm(element);
		  }
    }
    // show progress bar
    $('<div></div>').addClass('message').hide().prependTo('body').slideDown();
    $('<div></div>').addClass('progress').prependTo('body');
    updateProgress();
  });

});