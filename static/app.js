window.onload = function () {
let startChat = document.getElementById("startChat");
startChat.addEventListener("click", function (e) {
  document.getElementById("messages").style.display = "block"; // display the chat container
  e.currentTarget.style.display = "none"; // hide the startchat button
  // generating the random username
  let anonNames = [
      "Weirdoo", "CrazyEyes", "FunnyBunny", "SillyChatter", "Googler", "Bubbly", "Geeky", "JokerFace", "NightOwk",
        "SillyGoose", "WeakGamer", "CrazyCat", "SillyKitty", "Noobie", "BluePanda", "BananaHead", "TheEyeOfTheTiger",
      "VisionOfChat"]
  // randomly select a name
  function randomSelect() {
    return anonNames[(Math.floor(Math.random() * anonNames.length))];
  }

  let currentUser = randomSelect();
  let chatSocket;
  // display the chat container
  document.getElementById("chatContainer").style.display = "";
  document.querySelector("#currentUser").textContent =
    "Your name: " + currentUser;

  const reconnectInterval = 1000;
  let shouldReconnect = true;
function reset() {
    if (chatSocket) {
      shouldReconnect = false;
      chatSocket.close();
    }
    document.getElementById("messages").innerHTML = ""; // clear the messages
    currentUser = randomSelect(); // generate a new random username
    document.querySelector("#currentUser").textContent = "Your name: " + currentUser; // update the displayed username

    connect()
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
  // handling the enter key press
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
    // displaying the username of the sender as "You" to the same sender, else displaying the random username
    let displayedUsername = ""
    if (data.username === undefined){
        displayedUsername = "System";
    } else {
      displayedUsername = data.username === currentUser ? "You" : data.username;
    }

    if (displayedUsername === data.username){
      divUserNameAndMessage.innerHTML = "<div class='FirstUserNameColor'>" + displayedUsername  +"</div>"+": " +  data.message;
    } else {
      divUserNameAndMessage.innerHTML = "<div class='SecondUserNameColor'>"  + displayedUsername + "</div> "+ ": " + data.message ;
    }



    document.querySelector("#messages").appendChild(divUserNameAndMessage); // appending the message to the chat container
    scrollToBottom();
    function scrollToBottom() {
    document.querySelector("#messages").scrollTop = document.querySelector("#messages").scrollHeight;
}
  };

}

let disconnectButton = document.getElementById("disconnectButton");
    disconnectButton.addEventListener("click", function (e) {
      reset();
    });

connect()
});
}