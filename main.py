from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from api import ServerManager
import os
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:1420"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from pathlib import Path
home = str(Path.home())
app_data_path = os.path.join(home,"AppData", "LocalLow", "Innersloth", "Among Us")
server_manager = ServerManager(app_data_path)

@app.get("/")
def read_root():
    return {"status": "Among Us Launcher backend is running"}
class AddServerRequest(BaseModel):
    name: str
    ping_server: str
    port: int
    translate_name: int
@app.post("/add_server")
def add_server(server_data: AddServerRequest):
    server_manager.add_server(server_data.name, server_data.ping_server, server_data.port, server_data.translate_name)
    return {"status": "Server added"}

@app.get("/servers")
def get_servers():
    return server_manager.get_servers()

@app.get("/now_server")
def get_now_server():
    return server_manager.get_now_server()

class RemoveServerRequest(BaseModel):
    index: int

@app.post("/remove_server")
def remove_server(server_data: RemoveServerRequest):
    try:
        server_manager.remove_server(server_data.index)
        return {"status": "Server removed"}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.post("/update_server")
def update_server(index: int, name: Optional[str] = None, ping_server: Optional[str] = None, port: Optional[int] = None, translate_name: Optional[int] = None):
    server_manager.update_server(index, name, ping_server, port, translate_name)
    return {"status": "Server updated"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
