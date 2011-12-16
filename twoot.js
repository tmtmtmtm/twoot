
// Don't want Growl notifications? Change this to 0
var MAX_GROWLS = 3;

// How often (in seconds) to refresh.
var REFRESH_TIME = 90;

var LATEST_SEEN = 0;
var SERVER = 'http://twitter.com/';

//Reverse a collection
jQuery.fn.reverse = function() {
    return this.pushStack(this.get().reverse(), arguments);
};

(function($) {
  $.fn.gettweets = function(o){
    var growled = 0;
    return this.each(function(){
      var list = $('ul.tweet_list').prependTo(this);
      var url = URL_LATEST() +
        (LATEST_SEEN ? '?since_id=' + LATEST_SEEN : '?count=200');

      $.getJSON(url, function(data){
        $.each(data.reverse(), function(i, item) {
          // only if we don't already have this
          if($("#msg-" + item.id).length == 0) {

            list.prepend(tweet_as_HTML(item));

            if (item.favorited) {
              $('#msg-' + item.id + ' a.favorite').css('color', '#FF0');
            }

            if (item.id > LATEST_SEEN) LATEST_SEEN = item.id;

            if (growled++ < MAX_GROWLS) {
              fluid.showGrowlNotification({
                title: item.user.name + " @" + item.user.screen_name,
                description: item.text,
                priority: 2,
                icon: item.user.profile_image_url
              });
            }

          }
        });
      });
    });
  };
})(jQuery);

function tweet_as_HTML(item) {
  return('<li id="msg-' + item.id + '">' +
    '<img class="profile_image" src="' + item.user.profile_image_url +
      '" alt="' + item.user.name + '" />' +
    '<span class="time" title="' + item.created_at + '">' +
      '<a class="visit_status" href="' + URL_VISIT(item) + '">' +
        relative_time(item.created_at) +
      '</a>' +
    '</span>' +
    ' <a class="user" title="' + item.user.name + '" href="' +
      URL_USER(item.user) + '">' + item.user.screen_name + '</a>' +
    ' <a class="retweet" title="retweet this update"' +
      ' href="javascript:reTweet(\'' + item.user.screen_name + '\', \'' +
      item.text + '\')">&#x267A;</a>' +
    ' <a class="favorite" title="favorite this update"' +
      ' href="javascript:toggleFavorite(' + item.id + ')">&#10029;</a>' +
    ' <a class="reply" title="reply to ' + item.user.screen_name +
      '" href="javascript:replyTo(\'' + item.user.screen_name + '\', ' +
      item.id + ')">@</a>' +
    '<div class="tweet_text">' +
      item.text.replace(
        /(\w+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+)/g,
        '<a href="$1">$1</a>'
      ).replace(
        /[\@]+([A-Za-z0-9-_]+)/g,
        '<a href="' + SERVER + '$1">@$1</a>'
      ).replace(
        /[&lt;]+[3]/g,
        "<tt class='heart'>&#x2665;</tt>"
      ) +
    '</div>' +
  '</li>');
}

function twitterDate_to_jsDate(datestr) {
  var values = datestr.split(" ");
  time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
  return Date.parse(time_value);
}

function relative_time(time_value) {
  var now = new Date();
  var delta = (now.getTime() - twitterDate_to_jsDate(time_value)) / 1000 +
    (60 * now.getTimezoneOffset());
  if (delta <     1*60) return 'less than a minute ago';
  if (delta <     2*60) return 'a minute ago';
  if (delta <    45*60) return (delta / 60 | 0) + ' minutes ago';
  if (delta <    90*60) return 'an hour ago';
  if (delta <  2*60*60) return 'two hours ago';
  if (delta < 24*60*60) return '' + (delta / 3600 | 0) + ' hours ago';
  if (delta < 48*60*60) return '1 day ago';
  return (delta / 86400 | 0) + ' days ago';
}

//get all span.time and recalc from title attribute
function recalcTime() {
  $('a.visit_status').each(function(index) {
    $(this).text(relative_time($(this).parents("span.time").attr("title")));
  });
}

function showAlert(message) {
  $("#alert p").text(message);
  $("#alert").fadeIn("fast");
  return;
}

function reTweet(username, text) {
  $('#status').val($("#status").val() + ' RT @' + username + ': "' + text + '"');
  $('#status').focus();
  updateStatusCount();
  return;
}

function refreshMessages() {
  showAlert("Getting new tweets...");
  $(".tweets").gettweets();
  $("#alert").fadeOut(2000);
  return;
}

function replyTo(screen_name, status_id) {
  $("#status").val($("#status").val() + ' @' + screen_name + ' ');
  $("#status").focus();
  window.in_reply_to_status_id = status_id;
  return;
}

function setStatus(status_text) {
  var postVars = {
    status: status_text,
    source: "twoot"
  };
  if (window.in_reply_to_status_id) {
    postVars.in_reply_to_status_id = window.in_reply_to_status_id;
  }
  $.post(URL_UPDATE(), postVars, function(data) {
    clearStatusField();
  }, "json" );
  window.in_reply_to_status_id = null;
  return;
}

function updateStatusCount() {
  window.statusCount = 140 - $("#status").val().length;
  $("#status_count").text(window.statusCount.toString());
  return;
}

function clearStatusField() {
  var origColor = $('#status').css("background-color");
  $('#status').val($("#status").val()).css("background-color","#CF6").fadeOut('slow', function() {
    $('#status').val("").css("background-color", origColor).fadeIn('slow');
  });
  //maybe show some text below field with last message sent?
  refreshMessages();
  updateStatusCount();
  $('html').animate({scrollTop:0}, 'fast');
  return;
}

function toggleFavorite(id) {
  $.getJSON(URL_SHOW(id), function(data) {
    if (data.favorited) {
      $.post(URL_FAVE_DEL(id));
      $('#msg-' + id + ' a.favorite').css('color', '#CCC');
    } else {
      $.post(URL_FAVE_ADD(id));
      $('#msg-' + id + ' a.favorite').css('color', '#FF0');
    }
  });
}

function URL_UPDATE()     { return SERVER+'statuses/update.json'             }
function URL_LATEST()     { return SERVER+'statuses/friends_timeline.json'   }
function URL_SHOW(id)     { return SERVER+'statuses/show/'+id+'.json'        }
function URL_FAVE_ADD(id) { return SERVER+'favorites/create/'+id+'.json'     }
function URL_FAVE_DEL(id) { return SERVER+'favorites/destroy/'+id+'.json'    }
function URL_VISIT(i)     { return SERVER+i.user.screen_name+'/status/'+i.id }
function URL_USER(u)      { return SERVER+u.screen_name                      }

// set up basic stuff for first load
$(document).ready(function(){
  refreshMessages();
  $("#status_entry").submit(function() {
    setStatus($("#status").val());
    return false;
  });
  window.setInterval(refreshMessages, 1000 * REFRESH_TIME);
  window.setInterval(recalcTime,      1000 * 60);

  //Bind r key to request new messages
  $(document).bind('keydown', {
    combi:'r',
    disableInInput: true
  }, refreshMessages);
});


