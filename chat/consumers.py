import asyncio
import json
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.core.cache import cache


class ChatConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_group_name = None

    async def connect(self):
        """
        1. This function adds the first user (channel name) to the connected_users set and the waiting_users dictionary
        (the dictionary has the channel name as the key and the room group name as the value).

        2. The second user will be added only to the connected_users set as there is no need to wait
        (no need to be added to waited_users dictionary)

        3. once the second user connects, the first user will be removed from the waiting_users dictionary,
        they will both have the same room group name and will start the chat.
        they will both remains in the connected_users set.
        """

        # Accept the WebSocket connection
        await self.accept()

        # Retrieve the set of connected users from the cache, or create an empty set
        connected_users = cache.get('connected_users', set())

        # Add the current channel name to the set of connected users
        connected_users.add(self.channel_name)

        # Update the cache with the modified set of connected users
        cache.set('connected_users', connected_users)

        # Retrieve the set of waiting users from the cache, or create an empty set
        self.waiting_users = cache.get('waiting_users', {})

        # If there is a waiting user, connect them with the current user
        while self.waiting_users:
            # Get an arbitrary waiting user's channel name and room group name
            partner_channel_name, partner_room_group_name = self.waiting_users.popitem()

            # Check if the partner is already connected
            if partner_channel_name in connected_users:

                self.room_group_name = partner_room_group_name

                # Add both channels (self.channel_name & partner_channel_name) to the same room group (room_group_name)
                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name,
                )
                await self.channel_layer.group_add(
                    self.room_group_name,
                    partner_channel_name,
                )

                # Send a message to the current user to start the chat
                await self.send(text_data=json.dumps({"message": "Chat Started"}))

                # Send a message to the partner to start the chat on their end
                await self.channel_layer.send(
                    partner_channel_name,
                    {"type": "chat.start"}
                )

                # Update the cache with the modified waiting users
                cache.set('waiting_users', self.waiting_users)

                # Exit the connect method since a chat has started


                return

        # If no suitable partner is found, generate a new room group name
        self.room_group_name = str(uuid.uuid4())  # Generate a valid group name

        # Add the current channel to the waiting users with the new room group name
        self.waiting_users[self.channel_name] = self.room_group_name

        # Update the cache with the modified waiting users
        cache.set('waiting_users', self.waiting_users)

        # Inform the current user that they are waiting for a chat partner
        await self.send(text_data=json.dumps({"message": "Waiting for a chat partner"}))

    async def chat_start(self, event):
        # Handler for the "chat_start" event triggered by the partner
        # Send a message to the current user indicating that the chat has started
        await self.send(text_data=json.dumps({"message": "Chat Started"}))

    async def disconnect(self, close_code):

        """
        1. once the users disconnects, the channel name will be removed from the connected_users set
        2. if the user was in the waiting_users dictionary, it means that he did not find a partner yet, so they will be removed from there as well.
        3. if the user is disconnected and has not been reconnected again (user reconnection is handled in the front end)
         within the time frame mentioned (2 seconds), it will notify the partner that the user is disconnected
        4. remove the partner channel from the chat room group permanently (if the partner has not been reconnected)
        """
        # Handle WebSocket disconnection
        connected_users = cache.get('connected_users', set())

        # Remove the current channel from the set of connected users
        connected_users.remove(self.channel_name)
        cache.set('connected_users', connected_users)

        self.waiting_users = cache.get('waiting_users', {})

        if self.channel_name in self.waiting_users:
            del self.waiting_users[self.channel_name]
            cache.set('waiting_users', self.waiting_users)
        else:
            # If the user was in an active chat, wait for 2 seconds for the partner to reconnect
            await asyncio.sleep(2)  # Wait for 2 seconds for the partner to reconnect
            connected_users = cache.get('connected_users', set())

            # Check if the user has not reconnected, and notify the partner about the disconnect
            if self.channel_name not in connected_users:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {"type": "partner.disconnect"}
                )

            # Remove the current channel from the chat room group
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def partner_disconnect(self, event):
        # Handler for the "partner.disconnect" event
        # Inform the current user that their partner has disconnected
        await self.send(text_data=json.dumps({"message": "Your partner has disconnected. You can now close the chat."}))

    async def receive(self, text_data):
        # Handle incoming messages from the WebSocket
        text_data_json = json.loads(text_data)
        message = text_data_json.get("message")
        username = text_data_json.get("username")
        image = text_data_json.get("image")

        # Send the received message to all users in the chat room group
        await self.channel_layer.group_send(
            self.room_group_name, {
                "type": "sendMessage",
                "message": message,
                "username": username,
                "image": image,
            }
        )

    async def sendMessage(self, event):
        # Handler for the "sendMessage" event from the chat room group
        # Send the received message to the current user (the same user who sent the message)
        message = event.get("message")
        username = event.get("username")
        image = event.get("image")
        await self.send(text_data=json.dumps({
            "message": message,
            "username": username,
            "image": image,
        }))
