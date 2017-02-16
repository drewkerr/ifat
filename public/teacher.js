$(document).ready(function() {
  
  $('#new').submit(function(event) {
    event.preventDefault();
    $.post('/teacher', { key: key } )
      .done(function(data) {
        
      }
  });
  

});