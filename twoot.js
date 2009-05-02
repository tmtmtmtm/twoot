/*
* The Twitter request code is based on the jquery tweet extension by http://tweet.seaofclouds.com/
*
* */

// Don't want Growl notifications? Change this to 0
var MAX_GROWLS = 3;

var LAST_UPDATE;

//Reverse collection
jQuery.fn.reverse = function() {
    return this.pushStack(this.get().reverse(), arguments);
}; 


(function($) {
  $.fn.gettweets = function(o){
    var growled = 0;
    return this.each(function(){
      var list = $('ul.tweet_list').prependTo(this);
      var url = 'http://twitter.com/statuses/friends_timeline.json?count=200' + getSinceParameter();

      $.getJSON(url, function(data){
        $.each(data.reverse(), function(i, item) { 
          if($("#msg-" + item.id).length == 0) { // <- fix for twitter caching which sometimes have problems with the "since" parameter
            list.prepend('<li id="msg-' + item.id + '">' + 
              '<img class="profile_image" src="' + item.user.profile_image_url + '" alt="' + item.user.name + '" />' + 
              '<span class="time" title="' + item.created_at + '">' + 
                '<a class="visit_status" href="http://twitter.com/' + item.user.screen_name + '/status/' + item.id + '">' + relative_time(item.created_at) + '</a>' + 
              '</span>' + 
              ' <a class="user" title="' + item.user.name + '" href="http://twitter.com/' + item.user.screen_name + '">' + item.user.screen_name + '</a>' + 
              ' <a class="retweet" title="retweet this update" href="javascript:reTweet(\'' + item.user.screen_name + '\', \'' + item.text + '\')">&#x267A;</a>' + 
              ' <a class="favorite" title="favorite this update" href="javascript:toggleFavorite(' + item.id + ')">&#10029;</a>' + 
              ' <a class="reply" title="reply to ' + item.user.screen_name + '" href="javascript:replyTo(\'' + item.user.screen_name + '\', ' + item.id + ')">@</a>' + 
              '<div class="tweet_text">' + item.text.replace(/(\w+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+)/g, '<a href="$1">$1</a>').replace(/[\@]+([A-Za-z0-9-_]+)/g, '<a href="http://twitter.com/$1">@$1</a>').replace(/[&lt;]+[3]/g, "<tt class='heart'>&#x2665;</tt>") + '</div>' + 
            '</li>');

            if (item.favorited) {
              $('#msg-' + item.id + ' a.favorite').css('color', '#FF0');
            }

            if (growled++ < MAX_GROWLS) { 
              fluid.showGrowlNotification({
                title: item.user.name + " @" + item.user.screen_name,
                description: item.text,
                priority: 2,
                icon: item.user.profile_image_url
              });
            };

          }
        });
      });
    });
  };
})(jQuery);

function relative_time(time_value) {
    var values = time_value.split(" ");
    time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
    var parsed_date = Date.parse(time_value);
    var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
    var delta = parseInt((relative_to.getTime() - parsed_date) / 1000, null);
    delta = delta + (relative_to.getTimezoneOffset() * 60);
    if (delta < 60) return 'less than a minute ago';
    if (delta < 120) return 'a minute ago';
    if (delta < (45*60)) return (parseInt(delta / 60, null)).toString() + ' minutes ago';
    if (delta < (90*60)) return 'an hour ago';
    if (delta < (2*60*60)) return 'two hours ago';
    if (delta < (24*60*60)) return '' + (parseInt(delta / 3600, null)).toString() + ' hours ago';
    if (delta < (48*60*60)) return '1 day ago';
    return (parseInt(delta / 86400, null)).toString() + ' days ago';
};


//get all span.time and recalc from title attribute
function recalcTime() {
    $('a.visit_status').each(function(index) {
        $(this).text(relative_time($(this).parents("span.time").attr("title")));
    });
}


function getSinceParameter() {
    if(LAST_UPDATE == null) {
        return "";
    } else {
        return ";since=" + LAST_UPDATE;
    }
}

function showAlert(message) {
    $("#alert p").text(message);
    $("#alert").fadeIn("fast");
    return;
}

function reTweet(username, text) {
    $('#status').val($("#status").val() + " RT @" + username + ": \"" + text + "\"");
    $('#status').focus();
    updateStatusCount();
    return;
}

function refreshMessages() {
    showAlert("Getting new tweets...");
    $(".tweets").gettweets();
    LAST_UPDATE = new Date().toGMTString();	
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
    if (window.in_reply_to_status_id) {
        $.post("http://twitter.com/statuses/update.json", { status: status_text, in_reply_to_status_id: window.in_reply_to_status_id, source: "twoot" }, function(data) { checkStatus(); refreshStatusField(); }, "json" );
    } else {
        $.post("http://twitter.com/statuses/update.json", { status: status_text, source: "twoot" }, function(data) { checkStatus(); refreshStatusField(); }, "json" );
    };
    window.in_reply_to_status_id = null;
    return;
}

function refreshStatusField() {
    //maybe show some text below field with last message sent?
    refreshMessages();
    $("#status_count").text("140");
    $('html').animate({scrollTop:0}, 'fast'); 
    return;
}

function updateStatusCount() {
    window.statusCount = 140 - $("#status").val().length;
    $("#status_count").text(window.statusCount.toString());
    return;
}

function checkStatus () {
    var origColor = $('#status').css("background-color");
    if ($('#status').val().length == 140) {
        $("#status").val("Twoosh!").css("background-color","#CF6").fadeOut('slow', function() {
            $("#status").val("").css("background-color", origColor).fadeIn('slow');
        });
    } else {
        $('#status').val($("#status").val()).css("background-color","#CF6").fadeOut('slow', function() {
            $('#status').val("").css("background-color", origColor).fadeIn('slow');
        });
    }
}

function toggleFavorite(id) {
    $.getJSON("http://twitter.com/statuses/show/" + id + ".json", 
    function(data){
        if (data.favorited) {
            $.post('http://twitter.com/favorites/destroy/' + id + '.json');
            $('#msg-' + id + ' a.favorite').css('color', '#CCC');
        }
        else {
            $.post('http://twitter.com/favorites/create/' + id + '.json');
            $('#msg-' + id + ' a.favorite').css('color', '#FF0');
        }
    }
);
}


// set up basic stuff for first load
$(document).ready(function(){
    
    //get the user's messages
    refreshMessages();

    //add event capture to form submit
    $("#status_entry").submit(function() {
        setStatus($("#status").val());
        return false;
    });

    //set timer to reload messages every 70 secs
    window.setInterval("refreshMessages()", 65000);

    //set timer to recalc timestamps every 60 secs
    window.setInterval("recalcTime()", 60000);

    //Bind r key to request new messages
    $(document).bind('keydown', {combi:'r', disableInInput: true}, refreshMessages);
});
