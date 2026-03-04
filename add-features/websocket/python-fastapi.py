"""
WebSocket support for FastAPI.
Apply by importing setup_websocket_routes(app) in your main.py.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


def setup_websocket_routes(app: FastAPI) -> None:
    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await manager.connect(websocket)
        try:
            while True:
                data = await websocket.receive_text()
                await websocket.send_text(f"Echo: {data}")
                await manager.broadcast(f"Client says: {data}")
        except WebSocketDisconnect:
            manager.disconnect(websocket)

    print("🔌 WebSocket endpoint registered at /ws")
