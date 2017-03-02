$(document).ready(function() {

  var reload;

  function autoReload(checked) {
    if (checked) {
      clearTimeout(reload);
    } else {
      reload = setTimeout("window.location.reload();", 5000);
    }
  }

  autoReload();

  $('#view').click(function(event) {
    $('.left').toggle();
    $('.done').toggleClass("view");
    $('tr:last-child td:nth-child(2)').toggleClass("bottom-left");
    var checked = this.checked;
    autoReload(checked);
  });

  // $('#csv').click(function(event) {
  //   $.get('csv', { offset: new Date().getTimezoneOffset() } );
  // });

});