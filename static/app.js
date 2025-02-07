window.onload = function () {
    let systemAudio = new Audio("https://" + window.location.host + "/static/notification.mp3");
    let userAudio = new Audio("https://" + window.location.host + "/static/meownotification.mp3");

    let audioIsEnabled = true;
    let chatSocket;
    let selectedImage;
    let startChat = document.getElementById("startChat");
    document.getElementById("nameInput").focus();
    document.getElementById("nameInput").onkeyup = function (e) {
        if (e.key === "Enter") {
            startChat.click();
        }
    }

    /* START OF THE AUDIO CHECKBOX FUNCTIONALITY */
    document.getElementById("notificationCheckBox").addEventListener("change", function () {
        audioIsEnabled = this.checked;
    })
    /* END OF THE AUDIO CHECKBOX FUNCTIONALITY */

    /* START OF THE EMOJI FUNCTIONALITY */
    function emojiFunctionality() {
        window.addEventListener('click', function (e) {
        const emojiDropdown = document.getElementById('emojiDropdown');
        const emojiButton = document.getElementById('emojiButton');
        if (!emojiDropdown.contains(e.target) && e.target !== emojiButton) {
            emojiDropdown.style.display = 'none';
        }
    });

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
    }

    /* END OF THE EMOJI FUNCTIONALITY */
    emojiFunctionality()


    /*
    The main event listener. It's triggered when the user clicks on the start chat button.
    It contains the whole functionality of the frontend.
     */
    startChat.addEventListener("click", function (e) {
            /*
            1. Display the chat container
            2. Hide the startchat button
            3. Hide the name input field
             */
            document.getElementById("messages").style.display = "block";
            e.currentTarget.style.display = "none";
            document.getElementById("nameInput").style.display = "none";


            /* START OF THE NAME FUNCTIONALITY */
            /*
            1. Get the name from the name input field if the user entered it.
            2. If the user didn't enter a name, generate a random name from the list of names.
            3. In any of the above cases, adding a random number to the end of the name to make it unique.
            */
            let optionalName = document.getElementById("nameInput").value;
            let anonNames = [
                "Weirdoo", "CrazyEyes", "FunnyBunny", "SillyChatter", "Googler", "Bubbly", "Geeky", "JokerFace", "NightOwk",
                "SillyGoose", "WeakGamer", "CrazyCat", "SillyKitty", "Noobie", "BluePanda", "BananaHead", "TheEyeOfTheTiger",
                "VisionOfChat"]

            function randomSelect() {
                return anonNames[(Math.floor(Math.random() * anonNames.length))] + Math.floor(Math.random() * 1000);
            }

            let currentUser;
            if (!optionalName) {
                currentUser = randomSelect();
            } else {
                currentUser = optionalName + Math.floor(Math.random() * 1000);
            }
            /* END OF THE NAME FUNCTIONALITY */


            /* START OF THE IMAGE UPLOAD FUNCTIONALITY */
            /*
            1. Get the image from the image input field if the user uploaded it.
            2. If the user didn't upload an image, the selectedImage variable will remain null (defined at the top of this file).
            3. Change the text of the "upload image" button to the name of the selected file, and shorten the name if it's too long.
            4. Trigger the click event of the image input field (the default html input field hidden by CSS) when the user clicks on the "upload image" button.
            */
            document.getElementById("imageInput").addEventListener("change", function (e) {
                let file = e.target.files[0];
                let reader = new FileReader();
                reader.onloadend = function () {
                    selectedImage = reader.result;
                }
                reader.readAsDataURL(file);

                // change the text of the upload image button to the name of the selected file
                let fileName = file ? file.name : "Upload Image";
                // shorten the file name if it's too long
                if (fileName.length > 10) {
                    fileName = fileName.slice(0, 10) + "...";
                }
                document.getElementById("customImageButton").textContent = fileName;
            })

            document.getElementById("customImageButton").addEventListener("click", function (e) {
                document.getElementById("imageInput").click();
            })
            /* END OF THE IMAGE UPLOAD FUNCTIONALITY */


            /*
            1. Display the chat container
            2. Display the current username
            3. Set the reconnect flag to true (This flag will be set to false when the user clicks on the disconnect button, so it won't reconnect to the websocket in this specific case)
            4. Add an event listener to the disconnect button to reset the websocket connection and create a new chat.
            */
            document.getElementById("chatContainer").style.display = "";
            document.querySelector("#currentUser").innerHTML =
                "<i class=\"bi bi-person\"></i>" + " Your name: " + `(${currentUser})`;
            let shouldReconnect = true;
            let disconnectButton = document.getElementById("disconnectButton");
            disconnectButton.addEventListener("click", function (e) {
                reset();
            });

            /* START OF THE RESET FUNCTIONALITY */
            /* This function is used by Disconnect button to reset the websocket connection and create a new chat.
            1. Close the websocket connection.
            2. Empty the chat container.
            3. Generate a new random username if the user didn't enter a name.
            4. Display the new username.
            5. Call the connect function to create a new websocket connection.
            */
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

            /* END OF THE RESET FUNCTIONALITY */


            /* START OF THE CONNECT FUNCTIONALITY */
            /*
            1. Create a new websocket connection.
            2. Handle the connection open/close events and print on console.
            3. Reconnect based on the reconnection interval if the connection was closed.
            4. Focus on the input field & handle pressing the enter key to send the message.
            5. Handle sending the message (message + username + image) to the server.
            6. Clearing the message and the image input fields after sending the message.
            7. Handling onmessage event to display the received message:
                - Create a new div to contain the username and the message.
                - Styling the username color of users differently using CSS classes.
                - Handling the image message.
                - Adding the newly generated div (username + message) to the chat container.
                - Scrolling to the bottom of the chat container to view the last added message using the scrollToBottom function.
                - Playing the notification sound when receiving a message.
            */
            function connect() {
                // creating the websocket connection ws:// (to be changed to wss:// if using https)
                let protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
                chatSocket = new WebSocket(protocol + window.location.host + "/");

                chatSocket.onopen = function (e) {
                    console.log("The connection was established");
                };

                const reconnectInterval = 1000;
                chatSocket.onclose = function (e) {
                    console.log("The connection was closed");
                    if (shouldReconnect) {
                        setTimeout(connect, reconnectInterval);
                    }
                };

                document.querySelector("#messageInput").focus();
                document.querySelector("#messageInput").onkeyup = function (e) {
                    if (e.key === "Enter") {
                        document.querySelector("#SendMessageButton").click();
                    }
                };

                // SEND FUNCTIONALITY
                document.querySelector("#SendMessageButton").onclick = function (e) {
                    const messageInput = document.querySelector("#messageInput").value;
                    chatSocket.send(
                        JSON.stringify({
                            message: messageInput,
                            username: currentUser,
                            image: selectedImage,
                        })
                    );
                    document.querySelector("#messageInput").value = "";
                    selectedImage = null;
                    document.getElementById("imageInput").value = "";
                    document.getElementById("customImageButton").textContent = "Upload Image";
                };

                // ONMESSAGE FUNCTIONALITY
                chatSocket.onmessage = function (e) {
                    const data = JSON.parse(e.data);
                    const divUserNameAndMessage = document.createElement("div");
                    divUserNameAndMessage.className = "message";
                    let displayedUsername = ""

                    if (data.username === undefined) {
                        displayedUsername = "System";
                    } else {
                        displayedUsername = data.username === currentUser ? `${currentUser} (You)` : data.username;
                    }

                    let img = null;
                    let link = null;
                    if (data.image) {
                        img = document.createElement("img");
                        img.src = data.image;
                        img.width = 400;
                        link = document.createElement("a");
                        link.href = data.image;
                        link.target = "_blank";
                        link.appendChild(img);
                    }

                    if (!data.message && !data.image) {
                        return;
                    }

                    if (data.username === undefined) {
                        divUserNameAndMessage.innerHTML = "<div class='SystemUserNameColor'>" + displayedUsername + "</div>" + ": " + data.message;
                    } else if (data.username === currentUser) {
                        divUserNameAndMessage.innerHTML = "<div class='FirstUserNameColor'>" + displayedUsername + "</div>" + ": " + data.message;
                    } else {
                        divUserNameAndMessage.innerHTML = "<div class='SecondUserNameColor'>" + displayedUsername + "</div> " + ": " + data.message;
                    }

                    if (link) {
                        divUserNameAndMessage.appendChild(document.createElement("br"));
                        divUserNameAndMessage.appendChild(link);
                    }

                    document.querySelector("#messages").appendChild(divUserNameAndMessage);

                    function scrollToBottom() {
                        document.querySelector("#messages").scrollTop = document.querySelector("#messages").scrollHeight;
                    }
                    scrollToBottom();

                    if (data.username === undefined && audioIsEnabled) {
                        systemAudio.play();

                    } else if (data.username !== currentUser && audioIsEnabled) {
                        userAudio.play();
                    }
                };
            }
            /* END OF THE CONNECT FUNCTIONALITY */
            connect() // calling the connect function to create a new websocket connection within startChat event listener
        }
    );
}