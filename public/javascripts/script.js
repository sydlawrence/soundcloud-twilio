

var pusher = new Pusher('efa61030395bf0550164');
  var channel = pusher.subscribe('callAnswered');
  channel.bind('soundcloudphone', function(data) {
    document.getElementById("phoneSuccess").innerHTML = "Phone Call Answered :D";
  });