var Chats = Backbone.Model.extend({
  // runs as soon as Chats is instantiated
  initialize: function() {
    this.set({username: window.location.search.split('=')[1],
      roomname: undefined,
      friends: {},
      server: 'https://api.parse.com/1/classes/chatterbox',
      fetchInProgress: false});
    $('.currentRoom').text(this.get('roomname') || 'all messages');
    this.fetch();
    setInterval(this.fetch.bind(this), 3000);
  },
  // posts provided message ({username, text, roomname})
  send: function(message) {
    $('.spinner').removeClass('hidden');
    $.ajax({
      url: this.get('server'),
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      },
      complete: function (data) {
        $('.spinner').addClass('hidden');
      }
    });
  },

  // retrieves and displays 100 latest messages
  // transits message to app.addRoom to add new rooms to room list
  fetch: function() {
    if (!this.get('fetchInProgress')) { // guard in case last fetch unresolved
      this.set({fetchInProgress: true});
      $('.spinner').removeClass('hidden');
      $.ajax(this.get('server'), {
        type: 'GET',
        data: {
          order: "-createdAt",
          where: {
            roomname: this.get('roomname')
          }
        },
        contentType: 'application/json',
        success: function (data) {
          console.log('chatterbox: Message retrieved');
          this.set({fetchInProgress: false,
            data: null});
          this.set({data: data});
        }.bind(this),
        error: function (data) {
          this.set({fetchInProgress: false});
          console.error('chatterbox: Failed to retrieve message');
        }.bind(this),
        complete: function (data) {
          $('.spinner').addClass('hidden');
        }
      });
    }
  },


});

var ChatsView = Backbone.View.extend({
  initialize: function() {
    this.model.on('change:data', function() {
      if (this.model.get('data')) {
        this.render();
      }
    }, this);

    // listener on send message button - sends message in input
    $('.send').on('click', function(event) {
      event.preventDefault();
      this.handleSubmit();
    }.bind(this));

    // listener on create room button - creates room in input
    $('.createRoom').on('click', function(event) {
      event.preventDefault();
      var $roomSelect = $('.roomSelect');
      var $input = $('.newRoom');
      var newRoomName = $input.val();
      $input.val('');
      $('.message').focus(); // shifts focus back to chat input
      $('.currentRoom').text(newRoomName);
      console.log(this.model.get('roomname'));
      this.model.set({roomname: newRoomName});
      console.log(this.model.get('roomname'));
      if (!_.some($roomSelect.children(), function(item) {
        return $(item).text() === newRoomName;
      })) {
        var $roomname = $('<a href="#" class="roomname"></a>');
        $roomname.text(newRoomName);
        $roomSelect.append($roomname);
        $roomSelect.append($('<br>'));
      }
    }.bind(this));

    var self = this; // next 3 listeners use this to access DOM nodes
    // listener on room selection anchors - changes rooms
    $('.roomSelect').on('click', '.roomname', function(event) {
      event.preventDefault();
      if ($(this).hasClass('showAll')) {
        self.model.set({roomname: undefined}); // nameless room shows all messages
      } else {
        self.model.set({roomname: $(this).text()});
      }
      $('.currentRoom').text(self.model.get('roomname') || 'all messages');
      self.model.fetch();
    });

    // listener on username anchors - toggles friend (bold font)
    $('.chats').on('click', '.username', function(event) {
      event.preventDefault();
      var username = $(this).text();
      var friendList = self.model.get('friends');
      if (self.model.get('friends')[username] === undefined) {
        friendList[username] = true;
      } else {
        delete friendList[username];
      }
      self.model.set({friends: friendList});

      // filters current messages to add class friend to friends
      // (bold font)
      $('.message').filter(function() {
        return $(this).children('.username').text() === username;
      }).toggleClass('friend');
    });
  },

  // takes text from input and transmits message {} to app.send
  handleSubmit: function() {
    var $input = $('.message');
    var message = {
      username: this.model.get('username'),
      text: $input.val(),
      roomname: this.model.get('roomname')
    };
    this.model.send(message);
    $input.val('');
    $input.focus();
  },

  clearMessages: function() {
    $('.chats').empty();
  },

  // adds new rooms to room list
  addRoom: function(message) {
    var $roomSelect = $('.roomSelect');
    if (!_.some($roomSelect.children(), function(item) {
      return $(item).text() === (message.roomname || '');
    })) {
      var $roomname = $('<a href="#" class="roomname"></a>');
      $roomname.text(message.roomname);
      $roomSelect.append($roomname);
      $roomSelect.append($('<br>'));
    }
  },

  // appends usernames and messages to chat window
  // any usernames in friends list gain friend class (bold font)
  addMessage: function(message) {
    var $message = $('<div class="message"></div>');
    var $username = $('<a href="#" class="username"></a>');
    $username.text(message.username);
    var username = $username.text();
    if (this.model.get('friends')[username]) {
      $message.addClass('friend');
    }
    $message.text(' ' + message.text);
    $message.prepend($username);
    $('.chats').append($message);
  },

  render: function() {
    var messages = this.model.get('data');
    this.clearMessages();
    $('.chats').append('<br>');

    _.each(messages.results, function(result) {
      this.addMessage(result);
      this.addRoom(result);
    }.bind(this));
  }
});
