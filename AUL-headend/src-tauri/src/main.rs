// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::io::Write;
use std::path::PathBuf;
use std::fs;
use std::collections::HashMap;
use chrono::Local;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct RegionInfo {
    #[serde(rename = "$type")]
    type_: String,
    #[serde(rename = "Name")]
    name: String,
    #[serde(rename = "PingServer")]
    ping_server: String,
    #[serde(rename = "TranslateName")]
    translate_name: i32,
    servers: Vec<ServerInfo>,
    target_server: Option<String>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ServerInfo {
    #[serde(rename = "Name")]
    name: String,
    #[serde(rename = "Ip")]
    ip: String,
    #[serde(rename = "Port")]
    port: i32,
    #[serde(rename = "UseDtls")]
    use_dtls: bool,
    players: i32,
    connection_failures: i32
}

struct ServerManager {
    file_path: PathBuf,
    log_path: PathBuf,
    preset_servers_url: String,
    data: std::sync::Mutex<HashMap<String, Vec<RegionInfo>>>
}

impl ServerManager {
    fn new(app_data_path: &str, preset_servers_url: &str) -> Self {
        let path = PathBuf::from(app_data_path);
        Self {
            file_path: path.join("regionInfo.json"),
            log_path: path.join("AULGK.log"),
            preset_servers_url: preset_servers_url.to_string(),
            data: std::sync::Mutex::new(HashMap::new())
        }
    }

    fn log(&self, message: &str) {
        if let Ok(mut file) = fs::OpenOptions::new().append(true).create(true).open(&self.log_path) {
            let _ = writeln!(file, "[{}] {}", Local::now().format("%Y-%m-%d %H:%M:%S"), message);
        }
    }

    fn load_data(&mut self) {
        if let Ok(contents) = fs::read_to_string(&self.file_path) {
            self.log(&format!("文件内容: {}", &contents));
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&contents) {
                if let Some(regions) = json.get("Regions").and_then(|v| v.as_array()) {
                    self.data.lock().unwrap().insert("Regions".to_string(), 
                        regions.iter()
                            .filter_map(|r| serde_json::from_value::<RegionInfo>(r.clone()).ok())
                            .collect()
                    );
                    self.log(&format!("成功解析数据，共加载{}个区域", self.data.lock().unwrap()["Regions"].len()));
                }
            }
        } else {
            self.log(&format!("无法读取文件: {:?}", &self.file_path));
        }
    }

    fn get_servers(&self) -> Vec<RegionInfo> {
        match reqwest::blocking::get(&self.preset_servers_url) {
            Ok(response) => {
                let json: serde_json::Value = response.json().unwrap_or_default();
                json["servers"].as_array()
                    .unwrap_or(&vec![])
                    .iter()
                    .filter_map(|server| {
                        serde_json::from_value::<RegionInfo>(server.clone()).ok()
                    })
                    .collect()
            }
            Err(e) => {
                eprintln!("获取服务器列表失败: {}", e);
                vec![]
            }
        }
    }

    fn get_now_server(&self) -> Vec<RegionInfo> {
        self.data.lock().unwrap().get("Regions").cloned().unwrap_or_default()
    }
}

#[tauri::command]
fn get_servers(manager: tauri::State<ServerManager>) -> serde_json::Value {
    match reqwest::blocking::get(&manager.preset_servers_url) {
        Ok(response) => response.json().unwrap_or_default(),
        Err(e) => {
            eprintln!("获取服务器列表失败: {}", e);
            serde_json::Value::Null
        }
    }
}

#[tauri::command]
fn get_now_server(manager: tauri::State<ServerManager>) -> serde_json::Value {
    if let Ok(contents) = fs::read_to_string(&manager.file_path) {
        serde_json::from_str(&contents).unwrap_or_default()
    } else {
        serde_json::Value::Null
    }
}

#[tauri::command]
fn remove_server(
    manager: tauri::State<'_, ServerManager>,
    region_name: String,
    server_name: String
) -> Result<(), String> {
    // 获取Mutex保护的数据
    let mut data = manager.data.lock().unwrap();
    
    // 获取现有Regions数据
    let mut existing_regions = if let Ok(contents) = fs::read_to_string(&manager.file_path) {
        serde_json::from_str::<serde_json::Value>(&contents)
            .ok()
            .and_then(|json| json.get("Regions").cloned())
            .and_then(|regions| regions.as_array().cloned())
            .unwrap_or_default()
    } else {
        Vec::new()
    };

    // 查找指定区域
    if let Some(region_index) = existing_regions.iter().position(|r| 
        r.get("Name").and_then(|n| n.as_str()) == Some(&region_name)
    ) {
        // 从区域中移除指定服务器
        if let Some(servers) = existing_regions[region_index].get_mut("Servers") {
            if let Some(servers_array) = servers.as_array_mut() {
                let original_len = servers_array.len();
                servers_array.retain(|s| 
                    s.get("Name").and_then(|n| n.as_str()) != Some(&server_name)
                );
                if servers_array.len() == original_len {
                    return Err(format!("未找到服务器: {}", server_name));
                }
            } else {
                return Err("Servers字段不是数组".to_string());
            }
        } else {
            // 当Servers字段不存在时，创建空数组
            existing_regions[region_index]["Servers"] = serde_json::json!([]);
        }
    } else {
        return Err(format!("未找到区域: {}", region_name));
    }
    

    // 转换数据为RegionInfo类型
    let regions: Vec<RegionInfo> = existing_regions.iter()
        .map(|v| {
            RegionInfo {
                type_: v["$type"].as_str().unwrap_or_default().to_string(),
                name: v["Name"].as_str().unwrap_or_default().to_string(),
                ping_server: v["PingServer"].as_str().unwrap_or_default().to_string(),
                translate_name: v["TranslateName"].as_i64().unwrap_or(0) as i32,
                servers: v["Servers"].as_array()
                    .unwrap_or(&vec![])
                    .iter()
                    .map(|s| ServerInfo {
                        name: s["Name"].as_str().unwrap_or_default().to_string(),
                        ip: s["Ip"].as_str().unwrap_or_default().to_string(),
                        port: s["Port"].as_i64().unwrap_or(0) as i32,
                        use_dtls: s["UseDtls"].as_bool().unwrap_or(false),
                        players: s["Players"].as_i64().unwrap_or(0) as i32,
                        connection_failures: s["ConnectionFailures"].as_i64().unwrap_or(0) as i32
                    })
                    .collect(),
                target_server: v["TargetServer"].as_str().map(|s| s.to_string())
            }
        })
        .collect();
    
    // 更新数据
    data.insert("Regions".to_string(), regions.clone());
    
    // 保存到文件
    let current_idx = if let Ok(contents) = fs::read_to_string(&manager.file_path) {
        serde_json::from_str::<serde_json::Value>(&contents)
            .ok()
            .and_then(|json| json.get("CurrentRegionIdx").cloned())
            .unwrap_or(serde_json::json!(0))
    } else {
        serde_json::json!(0)
    };
    
    let json = serde_json::json!({ 
        "CurrentRegionIdx": current_idx,
        "Regions": regions 
    });
    if let Err(e) = fs::write(&manager.file_path, json.to_string()) {
        manager.log(&format!("保存服务器数据失败: {}", e));
        return Err(format!("保存服务器数据失败: {}", e));
    }
    
    manager.log(&format!("成功移除服务器: {}:{}", region_name, server_name));
    Ok(())
}

#[tauri::command]
fn add_server(
    manager: tauri::State<'_, ServerManager>,
    name: String,
    ping_server: String,
    port: i32,
    _translate_name: i32
) -> Result<(), String> {
    // 获取Mutex保护的数据
    let mut data = manager.data.lock().unwrap();
    
    // 创建新的服务器信息
    let new_server = ServerInfo {
        name,
        ip: ping_server.clone(),
        port,
        use_dtls: false,
        players: 0,
        connection_failures: 0
    };

    // 获取现有Regions数据
    let mut existing_regions = if let Ok(contents) = fs::read_to_string(&manager.file_path) {
        serde_json::from_str::<serde_json::Value>(&contents)
            .ok()
            .and_then(|json| json.get("Regions").cloned())
            .and_then(|regions| regions.as_array().cloned())
            .unwrap_or_default()
    } else {
        Vec::new()
    };

    // 查找或创建以服务器名命名的区域
    let mut region_index = None;
    for (i, region) in existing_regions.iter().enumerate() {
        if let Some(name) = region.get("Name").and_then(|n| n.as_str()) {
            if name == new_server.name {
                region_index = Some(i);
                break;
            }
        }
    }

    // 创建新的服务器信息
    let new_server_json = serde_json::json!({ 
        "Name": new_server.name,
        "Ip": ping_server,
        "Port": port,
        "UseDtls": false,
        "Players": 0,
        "ConnectionFailures": 0
    });

    if let Some(index) = region_index {
        if let Some(servers) = existing_regions[index].get_mut("Servers") {
            if let Some(servers_array) = servers.as_array_mut() {
                servers_array.push(new_server_json);
            } else {
                // 如果Servers字段存在但不是数组，则创建新的数组
                *servers = serde_json::json!([new_server_json]);
            }
        } else {
            // 如果Servers字段不存在，则创建
            existing_regions[index]["Servers"] = serde_json::json!([new_server_json]);
        }
    } else {
        let new_region = serde_json::json!({ 
            "$type": "StaticHttpRegionInfo, Assembly-CSharp",
            "Name": new_server.name,
            "PingServer": ping_server,
            "Servers": [new_server_json],
            "TargetServer": null,
            "TranslateName": _translate_name
        });
        existing_regions.push(new_region);
    }

    // 转换数据为RegionInfo类型
    let regions: Vec<RegionInfo> = existing_regions.iter()
        .map(|v| {
            RegionInfo {
                type_: v["$type"].as_str().unwrap_or_default().to_string(),
                name: v["Name"].as_str().unwrap_or_default().to_string(),
                ping_server: v["PingServer"].as_str().unwrap_or_default().to_string(),
                translate_name: v["TranslateName"].as_i64().unwrap_or(0) as i32,
                servers: v["Servers"].as_array()
                    .unwrap_or(&vec![])
                    .iter()
                    .map(|s| ServerInfo {
                        name: s["Name"].as_str().unwrap_or_default().to_string(),
                        ip: s["Ip"].as_str().unwrap_or_default().to_string(),
                        port: s["Port"].as_i64().unwrap_or(0) as i32,
                        use_dtls: s["UseDtls"].as_bool().unwrap_or(false),
                        players: s["Players"].as_i64().unwrap_or(0) as i32,
                        connection_failures: s["ConnectionFailures"].as_i64().unwrap_or(0) as i32
                    })
                    .collect(),
                target_server: v["TargetServer"].as_str().map(|s| s.to_string())
            }
        })
        .collect();
    
    // 更新数据
    data.insert("Regions".to_string(), regions.clone());
    
    // 保存到文件
    let current_idx = if let Ok(contents) = fs::read_to_string(&manager.file_path) {
        serde_json::from_str::<serde_json::Value>(&contents)
            .ok()
            .and_then(|json| json.get("CurrentRegionIdx").cloned())
            .unwrap_or(serde_json::json!(0))
    } else {
        serde_json::json!(0)
    };
    
    let json = serde_json::json!({ 
        "CurrentRegionIdx": current_idx,
        "Regions": regions 
    });
    if let Err(e) = fs::write(&manager.file_path, json.to_string()) {
        manager.log(&format!("保存服务器数据失败: {}", e));
        return Err(format!("保存服务器数据失败: {}", e));
    }
    
    manager.log(&format!("成功添加服务器: {}:{}", ping_server, port));
    Ok(())
}

#[tauri::command]
fn remove_server_by_index(
    manager: tauri::State<'_, ServerManager>,
    region_index: usize,
    server_index: usize
) -> Result<(), String> {
    // 获取Mutex保护的数据
    let mut data = manager.data.lock().unwrap();
    
    // 获取现有Regions数据
    let mut existing_regions = if let Ok(contents) = fs::read_to_string(&manager.file_path) {
        serde_json::from_str::<serde_json::Value>(&contents)
            .ok()
            .and_then(|json| json.get("Regions").cloned())
            .and_then(|regions| regions.as_array().cloned())
            .unwrap_or_default()
    } else {
        Vec::new()
    };

    // 检查区域索引是否有效
    if region_index >= existing_regions.len() {
        return Err(format!("无效的区域索引: {}", region_index));
    }

    // 检查服务器索引是否有效
    println!("region_index: {}, server_index: {}", region_index, server_index);
    println!("region: {:?}", existing_regions);
    // 删除对应索引
    existing_regions.remove(region_index);


    // 转换数据为RegionInfo类型
    let regions: Vec<RegionInfo> = existing_regions.iter()
        .map(|v| {
            RegionInfo {
                type_: v["$type"].as_str().unwrap_or_default().to_string(),
                name: v["Name"].as_str().unwrap_or_default().to_string(),
                ping_server: v["PingServer"].as_str().unwrap_or_default().to_string(),
                translate_name: v["TranslateName"].as_i64().unwrap_or(0) as i32,
                servers: v["Servers"].as_array()
                    .unwrap_or(&vec![])
                    .iter()
                    .map(|s| ServerInfo {
                        name: s["Name"].as_str().unwrap_or_default().to_string(),
                        ip: s["Ip"].as_str().unwrap_or_default().to_string(),
                        port: s["Port"].as_i64().unwrap_or(0) as i32,
                        use_dtls: s["UseDtls"].as_bool().unwrap_or(false),
                        players: s["Players"].as_i64().unwrap_or(0) as i32,
                        connection_failures: s["ConnectionFailures"].as_i64().unwrap_or(0) as i32
                    })
                    .collect(),
                target_server: v["TargetServer"].as_str().map(|s| s.to_string())
            }
        })
        .collect();
    
    // 更新数据
    data.insert("Regions".to_string(), regions.clone());
    
    // 保存到文件
    let current_idx = if let Ok(contents) = fs::read_to_string(&manager.file_path) {
        serde_json::from_str::<serde_json::Value>(&contents)
            .ok()
            .and_then(|json| json.get("CurrentRegionIdx").cloned())
            .unwrap_or(serde_json::json!(0))
    } else {
        serde_json::json!(0)
    };
    
    let json = serde_json::json!({ 
        "CurrentRegionIdx": current_idx,
        "Regions": regions 
    });
    if let Err(e) = fs::write(&manager.file_path, json.to_string()) {
        manager.log(&format!("保存服务器数据失败: {}", e));
        return Err(format!("保存服务器数据失败: {}", e));
    }
    
    manager.log(&format!("成功移除服务器: 区域索引={}, 服务器索引={}", region_index, server_index));
    Ok(())
}

// 更新invoke_handler以包含add_server命令
fn main() {
    let home = dirs::home_dir().expect("Could not find home directory");
    let app_data_path = home.join("AppData").join("LocalLow").join("Innersloth").join("Among Us");
    let mut server_manager = ServerManager::new(
        app_data_path.to_str().unwrap(),
        "https://mxzc.cloud/preset_servers.json"
    );
    server_manager.load_data();
    tauri::Builder::default()
        .manage(server_manager)
        .invoke_handler(tauri::generate_handler![get_servers, get_now_server, add_server, remove_server, remove_server_by_index])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
