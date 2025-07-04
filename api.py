import json
import os
import re
import zipfile
import requests
import datetime
from typing import List, Optional

class RegionInfo:
    def __init__(self, name: str, ping_server: str, port: int, translate_name: int):
        self.name = name
        self.ping_server = ping_server
        self.port = port
        self.translate_name = translate_name

class ServerManager:
    def __init__(self, app_data_path: str, preset_servers_url: str = "https://mxzc.cloud/preset_servers.json"):
        self.app_data_path = app_data_path
        self.file_path = os.path.join(app_data_path, "regionInfo.json")
        self.log_path = os.path.join(app_data_path, "AULGK.log")
        self.preset_servers_url = preset_servers_url
        self.regions: List[RegionInfo] = []
        self.current_region_idx = 0
        self.load_data()

    def log(self, message: str):
        try:
            with open(self.log_path, "a") as log_file:
                log_file.write(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}\n")
        except Exception as e:
            print(f"Failed to write log: {e}")
    def get_servers(self):
        return requests.get(self.preset_servers_url).json()
    def get_now_server(self):
        # 格式化为[{"name":"name","pingServer":"pingServer","port":port}]
        self.load_data()
        print(self.data)
        return self.data["Regions"]
    def load_data(self):
        try:
            os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
            if os.path.exists(self.file_path):
                with open(self.file_path, "r", encoding="utf-8") as file:
                    self.data = json.load(file)
                    self.regions = []
                    for region_data in self.data["Regions"]:
                        self.regions.append(RegionInfo(
                            name=region_data["Name"],
                            ping_server=region_data["PingServer"],
                            port=region_data["Servers"][0]["Port"],
                            translate_name=region_data["TranslateName"]
                        ))
                    self.current_region_idx = self.data.get("CurrentRegionIdx", 0)
                self.log(f"Loaded {len(self.regions)} servers, current index: {self.current_region_idx}")
            else:
                self.save_data()
                self.log("No regionInfo.json found, created default file")
        except Exception as e:
            self.log(f"Failed to load data: {e}")

    def save_data(self):
        try:
            data = {
                "CurrentRegionIdx": self.current_region_idx,
                "Regions": [{"$type": "StaticHttpRegionInfo, Assembly-CSharp", "Name": region.name, "PingServer": region.ping_server, "Servers": [{"Name": "Http-1", "Ip": f"https://{region.ping_server}", "Port": region.port, "UseDtls": False, "Players": 0, "ConnectionFailures": 0}], "TargetServer": None, "TranslateName": region.translate_name} for region in self.regions]
            }
            with open(self.file_path, "w") as file:
                file.write(json.dumps(data, indent=2))
            self.log("Server data saved")
        except Exception as e:
            self.log(f"Failed to save data: {e}")

    def add_server(self, name: str, ping_server: str, port: int, translate_name: int):
        new_server = RegionInfo(name, ping_server, port, translate_name)
        self.regions.append(new_server)
        self.save_data()
        self.log(f"Added new server: {name}")

    def remove_server(self, index: int):
        if 0 <= index < len(self.regions):
            self.regions.pop(index)
            with open(self.file_path, "w") as file:
                file.write(json.dumps({"current_region_idx": self.current_region_idx, "Regions": [{"Name": region.name, "PingServer": region.ping_server, "Port": region.port, "TranslateName": region.translate_name} for region in self.regions]}))
        else:
            self.log("Invalid server index")

    def update_server(self, index: int, name: Optional[str] = None, ping_server: Optional[str] = None, port: Optional[int] = None, translate_name: Optional[int] = None):
        if 0 <= index < len(self.regions):
            server = self.regions[index]
            if name is not None:
                server.name = name
            if ping_server is not None:
                server.ping_server = ping_server
            if port is not None:
                server.port = port
            if translate_name is not None:
                server.translate_name = translate_name
            self.save_data()
            self.log(f"Updated server at index {index}")
        else:
            self.log("Invalid server index")

    def load_preset_servers(self):
        try:
            response = requests.get(self.preset_servers_url)
            response.raise_for_status()
            preset_servers = response.json()
            for server in preset_servers:
                self.add_server(server["name"], server["pingServer"], int(server["port"]), 1003)
            self.log(f"Loaded {len(preset_servers)} preset servers from {self.preset_servers_url}")
        except Exception as e:
            self.log(f"Failed to load preset servers: {e}")

    def validate_server_name(self, name: str) -> bool:
        if not name:
            self.log("Server name cannot be empty")
            return False
        return True

    def validate_ping_server(self, server: str) -> bool:
        if not server:
            self.log("Ping server address cannot be empty")
            return False
        if len(server) < 1 or len(server) > 64:
            self.log("Server address length must be between 1 and 64 characters")
            return False
        return True

    def validate_port(self, port: int) -> bool:
        if port < 0 or port > 65535:
            self.log("Port must be between 0 and 65535")
            return False
        return True

    def validate_translate_name(self, translate_name: int) -> bool:
        if translate_name <= 1000:
            self.log("TranslateName must be greater than 1000")
            return False
        return True
