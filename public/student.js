$(document).ready(function() {
  
  $('#session').fadeOut();
  $('#quiz').show();
  
  $.get('/load', function(data) {
  
	var table = $('<table></table>')
	$('#quiz').append(table);

	for (var question = 1; question <= data.length; question++) {
	    var tr = $('<tr></tr>');
		table.append(tr);
		
		var td = $('<td></td>').text(question + '.');
		tr.append(td);
		
		var choices = data.choices.split('');
		for (var choice in choices) {
		    var td = $('<td></td>').text(choices[choice]);
			td.attr('class', question);
			tr.append(td);

			td.click(function(event) {
				var question = $(this).attr('class');
				if (event.originalEvent !== undefined) {
					var response = $(this).text();
          var element = this;
      		$.get('/save', { question: question, response: response } )
            .done(function(data) {
            
              if (data == 'correct') {
                $(element).text('😄');
					      $(element).css({ 'text-shadow': '0 0 20px rgba(0,255,0,0.5)' });
					      for (var x = 1; x <= 2; x++) {
						      $(element).animate({ top: -10 }, 50)
						             .animate({ top: 0 }, 50);
					      }
					      $('[class=' + question + ']').off();
                
              } else {
                $(element).text('😳');
					      $(element).css({ 'text-shadow': '0 0 20px rgba(255,0,0,0.5)' });
					      for (var x = 1; x <= 2; x++) {
					        $(element).animate({ left: -3 }, 100 / 4)
							           .animate({ left: 3 }, 100 / 2)
							           .animate({ left: 0 }, 100 / 4);
					      }
					      $(element).animate({ opacity: 0}, 2000);
					      $(element).off();
              }
            });
        }
			});
		}
	}
  });
  
	$('#name').keyup();

});