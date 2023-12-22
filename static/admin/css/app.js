document.getElementById("startChat").addEventListener("click", function () {
  document.getElementById("startChat").style.display = "none";
  const currentUser = "Anonymous_" + Math.floor(Math.random() * 1000000);
  document.getElementById("id_chat_item_container").style.display = "";
  document.querySelector("#current_user").textContent =
    "Your name: " + currentUser;
  const chatSocket = new WebSocket("ws://" + window.location.host + "/");
  chatSocket.onopen = function (e) {
    console.log("The connection was established");
  };

  chatSocket.onclose = function (e) {
    console.log("The connection was closed");
  };

  document.querySelector("#id_message_send_input").focus();

  document.querySelector("#id_message_send_input").onkeyup = function (e) {
    if (e.keyCode == 13) {
      document.querySelector("#id_message_send_button").click();
    }
  };

  document.querySelector("#id_message_send_button").onclick = function (e) {
    const messageInput = document.querySelector("#id_message_send_input").value;
    chatSocket.send(
      JSON.stringify({
        message: messageInput,
        username: currentUser,
      })
    );
  };

  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);

    const div = document.createElement("div");
    const displayedUsername =
      data.username === currentUser ? "You" : data.username;
    div.innerHTML =
      "<strong>" + displayedUsername + "</strong>: " + data.message;
    document.querySelector("#id_message_send_input").value = "";
    document.querySelector("#messages").appendChild(div);
  };
});
