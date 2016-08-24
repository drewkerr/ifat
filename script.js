$(document).ready(function() {
	var key = 'ABCDABCDABCDABC'.split('');
	function save() {
		Cookies.set('response', $("#gform").serializeArray(),
				   { expires: 1/96 });
	}
	var question = 0;
	var table = $('<table></table>')
	$('#quiz').append(table);
	for (var answer in key) {
	    var tr = $('<tr></tr>');
		table.append(tr);
		
		var td = $('<td></td>').text(++question + '.');
		td.addClass('question');
		var input = $('<input type="hidden" />')
		input.attr('name', "Question " + question);
		input.attr('id', question);
		td.append(input);
		tr.append(td);
		
		var choices = 'ABCD'.split('');
		for (choice in choices) {
		    var td = $('<td></td>').text(choices[choice]);
			td.attr('class', question);
			tr.append(td);
			if (choices[choice] == key[answer]) {
				td.click(function(event) {
					var q = $(this).attr('class');
					if (event.originalEvent !== undefined) {
						var v = $(this).text();
						$('#' + q).val(function(i, value) {
							return value + v;
						});
						save();
					}
					for (var x = 1; x <= 2; x++) {
						$(this).animate({ top: -10 }, 50)
						       .animate({ top: 0 }, 50);
					}
					$(this).text('😄');
					$(this).css({ 'text-shadow': '0 0 20px rgba(0,255,0,0.5)' });
					$('[class=' + q + ']').off();
				});
			} else {
				td.click(function(event) {
					var q = $(this).attr('class');
					if (event.originalEvent !== undefined) {
						var v = $(this).text();
						$('#' + q).val(function(i, value) {
							return value + v;
						});
						save();
					}
					for (var x = 1; x <= 2; x++) {
					    $(this).animate({ left: -3 }, 100 / 4)
							   .animate({ left: 3 }, 100 / 2)
							   .animate({ left: 0 }, 100 / 4);
					}
					$(this).text('😳');
					$(this).css({ 'text-shadow': '0 0 20px rgba(255,0,0,0.5)' });
					$(this).off();
				});
			}
		}
	}
	
	$('#name').keyup(save);
	
	// Load state from cookie
	var cookie = Cookies.get('response');
	var submitted = Cookies.get('submitted');
	if (cookie !== undefined) {
		var json = JSON.parse(cookie);
		for (var i in json) {
			var field = json[i];
			$('input[name="'+field['name']+'"]').val(field['value']);
		}
		$('input').filter(':hidden').each(function(i) {
			var value = $(this).val()
			for (var i in value) {
				$(this).parent().siblings().filter(':contains('+value[i]+')').click();
			}
		});
		if (submitted !== undefined) {
			function pad2(n) {
				return (n < 10 ? '0' : '') + n
			}
			function updatetime() {
				var now = new Date();
				var out = new Date(parseInt(submitted));
				var diff = (out - now);
				if (diff <= 0) {
					Cookies.remove('response');
					Cookies.remove('submitted');
					location.reload();
				} else {
					var min = Math.floor(diff/(60*1000));
					var sec = Math.floor(diff/1000 - min*60);
					$('button').text(min+':'+pad2(sec));
					setTimeout(function() {
						updatetime();
					}, 1000);
				}
			}
			updatetime();
			$('button').attr('disabled', true);
			$('#name').attr('readonly', true);
		}
	}
	
	// Submit response using AJAX
	$('#gform').submit(function(event) {
		event.preventDefault();
		var incomplete = false;
		function shake(elem) {
			var settings = { 'shakes': 3,
			    			 'distance': 10,
			   	 			 'duration': 300 };
			for (var x = 1; x <= settings.shakes; x++) {
			    elem.animate({ left: settings.distance * -1 }, (settings.duration / settings.shakes) / 4)
			        .animate({ left: settings.distance }, (settings.duration / settings.shakes) / 2)
		            .animate({ left: 0 }, (settings.duration / settings.shakes) / 4);
			}
		}
		if ($('#name').val() === '') {
			$('#name').attr('placeholder', 'Please enter name(s)');
			$('#name').focus();
			incomplete = true;
		}
		var question = 0;
		$('input').filter(':hidden').each(function(i) {
			if ($(this).val().indexOf(key[question++]) === -1) {
				$(this).parent().css('color','red');
				incomplete = true;
			} else {
				$(this).parent().css('color','#999');
			}
		});
		if (incomplete) {
			shake($('button'));
        } else {
			var url = 'https://script.google.com/macros/s/AKfycbyFTftVFNOioDAzlLvXhIoNQJzLtMPDZSh5ffr4KP4CB-VnW1I/exec'
			var posting = $.post(url, $(this).serialize());
			$('button').text('Sending');
			posting.done(function(data) {
				var timeout = new Date().getTime() + 15 * 60 * 1000;
				Cookies.set('submitted', timeout, { expires: timeout });
				$('button').text('Sent');
				$('button').attr('disabled', true);
				$('#name').attr('readonly', true);
			});
			posting.fail(function(data) {
				$('button').text('Submit');
				shake($('button'));
			});
        }
	});
});