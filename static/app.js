window.onload = function () {
// hiding the emoji dropdown when clicking outside of it
    window.addEventListener('click', function(e) {
    const emojiDropdown = document.getElementById('emojiDropdown');
    const emojiButton = document.getElementById('emojiButton');
    if (!emojiDropdown.contains(e.target) && e.target !== emojiButton) {
        emojiDropdown.style.display = 'none';
    }
});

let startChat = document.getElementById("startChat");
document.getElementById("nameInput").focus();
document.getElementById("nameInput").onkeyup = function (e) {
    if (e.key === "Enter") {
        startChat.click();
    }
}
startChat.addEventListener("click", function (e) {
    let optionalName = document.getElementById("nameInput").value;

  document.getElementById("messages").style.display = "block"; // display the chat container
  e.currentTarget.style.display = "none"; // hide the startchat button
    document.getElementById("nameInput").style.display = "none"; // hide the name input field

  // generating the random username
  let anonNames = [
      "Weirdoo", "CrazyEyes", "FunnyBunny", "SillyChatter", "Googler", "Bubbly", "Geeky", "JokerFace", "NightOwk",
        "SillyGoose", "WeakGamer", "CrazyCat", "SillyKitty", "Noobie", "BluePanda", "BananaHead", "TheEyeOfTheTiger",
      "VisionOfChat"]
  // function to generate a random index number not exceeding the length of the array, then pass it to the array to select an element
  function randomSelect() {
    return anonNames[(Math.floor(Math.random() * anonNames.length))];
  }
  let currentUser;
  if (!optionalName){
      currentUser = randomSelect();
  } else {
        currentUser = optionalName + Math.floor(Math.random() * 1000);
  }



  let chatSocket;
  // display the chat container
  document.getElementById("chatContainer").style.display = "";
  document.querySelector("#currentUser").textContent =
    "Your name: " + currentUser;

    // setting the reconnect interval to 1 second if the websocket closes by itself
  const reconnectInterval = 1000;

    // setting the reconnect flag to true. This flag will be set to false when the user clicks on the disconnect button, so it won't reconnect to the websocket in this specific case
  let shouldReconnect = true;


  // this function is used by Disconnect button to reset the websocket connection and create a new chat
  // it clears the messages, generates a new random username, and calls the connect function
    function reset() {
        if (chatSocket) {
          shouldReconnect = false; // setting the reconnect flag to false, to prevent reconnecting to the same websocket
          chatSocket.close();
        }
        document.getElementById("messages").innerHTML = ""; // clear the messages
        if (!optionalName) {
            currentUser = randomSelect(); // generate a new random username
        }
        document.querySelector("#currentUser").textContent = "Your name: " + currentUser; // update the displayed username

        connect() // call the connect function to create a new websocket connection
      }

    function connect() {
     // creating the websocket connection (to be changed to wss:// if using https)
      chatSocket = new WebSocket("wss://" + window.location.host + "/");

      chatSocket.onopen = function (e) {
        console.log("The connection was established");
      };

      // handling the connection close message and reconnecting based on the reconnectInterval
      chatSocket.onclose = function (e) {
        console.log("The connection was closed");
        if (shouldReconnect) {
            setTimeout(connect, reconnectInterval);
        }

      };


  // focusing on the input field
  document.querySelector("#messageInput").focus();

  // EMOJIS
    document.getElementById("emojiButton").addEventListener("click", () => {
        if (document.getElementById("emojiDropdown").style.display === "block") {
            document.getElementById("emojiDropdown").style.display = "none";
            return;
        }
        document.getElementById("emojiDropdown").style.display = "block";
    })

    document.querySelectorAll(".emoji").forEach(emoji => {
        emoji.addEventListener("click", event => {
            document.getElementById("messageInput").value += event.target.textContent;
            document.getElementById("emojiDropdown").style.display = "none";
        })
    })

  // handling pressing the enter key to send the message
  document.querySelector("#messageInput").onkeyup = function (e) {
    if (e.key === "Enter") {
      document.querySelector("#SendMessageButton").click();
    }
  };

  // handling sending the message
  document.querySelector("#SendMessageButton").onclick = function (e) {
    const messageInput = document.querySelector("#messageInput").value;
    // sending the message to the server as a JSON string
    chatSocket.send(
      JSON.stringify({
        message: messageInput,
        username: currentUser,
      })
    );
    document.querySelector("#messageInput").value = ""; // emptying the input field
  };


  // handling view of the received messages
  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    if (!data.message){ // if the message is empty, do nothing
        return;
    }

    const divUserNameAndMessage = document.createElement("div");
    divUserNameAndMessage.className = "message";
    // displaying the username of the sender as "You" to the same sender, else displaying the random username
    // if the username is undefined, it means that the message is a system message, so displaying "System" as the username
    let displayedUsername = ""
    if (data.username === undefined){
        displayedUsername = "System";
    } else {
      displayedUsername = data.username === currentUser ? "You" : data.username;
    }

    // adding the username and the message to the div, styling the username color of users differently using CSS classes
    if (data.username === undefined) {
        divUserNameAndMessage.innerHTML = "<div class='SystemUserNameColor'>" + displayedUsername + "</div>" + ": " + data.message;
    } else if (data.username === currentUser) {
        divUserNameAndMessage.innerHTML = "<div class='FirstUserNameColor'>" + displayedUsername  +"</div>"+": " +  data.message;
    } else {
      divUserNameAndMessage.innerHTML = "<div class='SecondUserNameColor'>"  + displayedUsername + "</div> "+ ": " + data.message ;
    }


    // adding the newly generated div (username + message) to the messages container
    // scrolling to the bottom of the messages container to view the last added message using the scrollToBottom function
    document.querySelector("#messages").appendChild(divUserNameAndMessage);
    scrollToBottom();
    function scrollToBottom() {
    document.querySelector("#messages").scrollTop = document.querySelector("#messages").scrollHeight;
}
  };

}
   // handling the disconnect button, it calls the reset function
    let disconnectButton = document.getElementById("disconnectButton");
    disconnectButton.addEventListener("click", function (e) {
        reset();
    });

    connect() // calling the connect function to create a new websocket connection within startChat event listener
});
}