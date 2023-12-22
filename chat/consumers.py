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
        await self.accept()

        connected_users = cache.get('connected_users', set())
        connected_users.add(self.channel_name)
        cache.set('connected_users', connected_users)

        self.waiting_users = cache.get('waiting_users', {})

        while self.waiting_users:
            partner_channel_name, partner_room_group_name = self.waiting_users.popitem()

            if partner_channel_name in connected_users:
                self.room_group_name = partner_room_group_name
                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name,
                )
                await self.channel_layer.group_add(
                    self.room_group_name,
                    partner_channel_name,
                )
                await self.send(text_data=json.dumps({"message": "Chat Started"}))
                await self.channel_layer.send(
                    partner_channel_name,
                    {"type": "chat.start"}
                )
                cache.set('waiting_users', self.waiting_users)
                return

        self.room_group_name = str(uuid.uuid4())  # Generate a valid group name
        self.waiting_users[self.channel_name] = self.room_group_name
        cache.set('waiting_users', self.waiting_users)
        await self.send(text_data=json.dumps({"message": "Waiting for a chat partner"}))

    async def chat_start(self, event):
        await self.send(text_data=json.dumps({"message": "Chat Started"}))

    async def disconnect(self, close_code):
        connected_users = cache.get('connected_users', set())
        connected_users.remove(self.channel_name)
        cache.set('connected_users', connected_users)

        self.waiting_users = cache.get('waiting_users', {})

        if self.channel_name in self.waiting_users:
            del self.waiting_users[self.channel_name]
            cache.set('waiting_users', self.waiting_users)
        else:
            await asyncio.sleep(2)  # Wait for 2 seconds for the partner to reconnect
            connected_users = cache.get('connected_users', set())
            if self.channel_name not in connected_users:  # Check if the user has reconnected
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {"type": "partner.disconnect"}
                )
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def partner_disconnect(self, event):
        await self.send(text_data=json.dumps({"message": "Your partner has disconnected. You can now close the chat."}))

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        username = text_data_json["username"]

        await self.channel_layer.group_send(
            self.room_group_name, {
                "type": "sendMessage",
                "message": message,
                "username": username,
            }
        )

    async def sendMessage(self, event):
        message = event["message"]
        username = event["username"]
        await self.send(text_data=json.dumps({
            "message": message,
            "username": username,
        }))
