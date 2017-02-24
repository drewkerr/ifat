$(document).ready(function() {
  
  var reload;
  
  function autoReload(checked) {
    if (checked) {
      clearTimeout(reload);
    } else {
      reload = setTimeout("window.location.reload();", 5000);
    }
  }
  
  $('#view').click(function(event) {
    $('.left').toggle();
    $('.complete').toggleClass("view");
    $('tr:last-child td:nth-child(2)').toggleClass("bottom-left");
    var checked = this.checked;
    autoReload(checked);
  });
  
  autoReload();

});