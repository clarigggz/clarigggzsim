use clap::{Parser, Subcommand};
use colored::*;
use comfy_table::Table;
use indicatif::{ProgressBar, ProgressStyle};
use serde_json::json;
use std::fs;
use std::path::PathBuf;
use std::time::Duration;

#[derive(Parser)]
#[command(name = "clarigggz")]
#[command(about = "Clarigggz Spatial Platform CLI", long_about = None)]
#[command(version = "0.2.0")]
struct Cli {
    #[arg(short, long, default_value_t = 4242)]
    port: u16,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Get current hardware metrics in a table
    Status,
    /// Continuously monitor simulation status
    Watch {
        #[arg(short, long, default_value_t = 1000)]
        interval: u64,
    },
    /// Toggle the spatial kernel state
    Toggle,
    /// Toggle the glasses display
    Display,
    /// Manage simulation recording
    Record {
        #[command(subcommand)]
        action: RecordAction,
    },
    /// Run a script on the spatial engine
    Run {
        /// Script string or path to .rhai file
        #[arg(index = 1)]
        target: String,

        /// Run script from file even if it looks like a string
        #[arg(short, long)]
        file: bool,
    },
}

#[derive(Subcommand)]
enum RecordAction {
    /// Start recording hardware metrics
    Start,
    /// Stop recording and save to JSON
    Stop {
        #[arg(short, long, default_value = "recording.json")]
        output: PathBuf,
    },
}

fn main() {
    let cli = Cli::parse();
    let base_url = format!("http://127.0.0.1:{}", cli.port);
    let client = reqwest::blocking::Client::new();

    match cli.command {
        Commands::Status => {
            get_status(&client, &base_url, cli.port);
        }
        Commands::Watch { interval } => {
            watch_status(&client, &base_url, interval);
        }
        Commands::Toggle => {
            post_action(
                &client,
                &format!("{}/kernel/toggle", base_url),
                "Kernel Toggled",
            );
        }
        Commands::Display => {
            post_action(
                &client,
                &format!("{}/display/toggle", base_url),
                "Display Toggled",
            );
        }
        Commands::Record { action } => match action {
            RecordAction::Start => {
                post_action(
                    &client,
                    &format!("{}/recording/start", base_url),
                    "Recording Started",
                );
            }
            RecordAction::Stop { output } => {
                match client.post(format!("{}/recording/stop", base_url)).send() {
                    Ok(resp) => {
                        let data = resp.text().unwrap_or_default();
                        fs::write(&output, data).expect("Failed to write recording");
                        println!("{} Saved to {:?}", "✔".green(), output);
                    }
                    Err(_) => eprintln!("{} Failed to stop recording.", "✘".red()),
                }
            }
        },
        Commands::Run { target, file } => {
            let script = if file || target.ends_with(".rhai") {
                fs::read_to_string(&target).unwrap_or_else(|_| {
                    eprintln!("{} Could not read file: {}", "✘".red(), target);
                    std::process::exit(1);
                })
            } else {
                target
            };

            let body = json!({ "script": script });
            match client
                .post(format!("{}/script/run", base_url))
                .json(&body)
                .send()
            {
                Ok(resp) => {
                    let result: serde_json::Value = resp
                        .json()
                        .unwrap_or(json!({"success": false, "data": "Parse error"}));
                    if result["success"].as_bool().unwrap_or(false) {
                        println!("{} {}", "✔".green(), "Success".bold());
                    } else {
                        println!("{} Execution Failed: {}", "✘".red(), result["data"]);
                    }
                }
                Err(_) => eprintln!("{} Failed to connect to engine.", "✘".red()),
            }
        }
    }
}

fn get_status(client: &reqwest::blocking::Client, base_url: &str, port: u16) {
    match client.get(format!("{}/metrics", base_url)).send() {
        Ok(resp) => {
            let metrics: serde_json::Value = resp.json().unwrap_or_default();

            let mut table = Table::new();
            table.set_header(vec!["METRIC", "VALUE", "STATUS"]);

            let temp = metrics["temperature"].as_f64().unwrap_or(0.0);
            let temp_color = if temp > 60.0 { Color::Red } else { Color::Cyan };

            table.add_row(vec![
                "CPU Load".cell(),
                format!("{:.1}%", metrics["cpu_load"].as_f64().unwrap_or(0.0)).cell(),
                "NOMINAL".green().cell(),
            ]);
            table.add_row(vec![
                "Temperature".cell(),
                format!("{:.1}°C", temp).color(temp_color).cell(),
                if temp > 60.0 {
                    "HOT".red()
                } else {
                    "COOL".green()
                }
                .cell(),
            ]);
            table.add_row(vec![
                "Battery".cell(),
                format!("{:.0}%", metrics["battery_level"].as_f64().unwrap_or(0.0)).cell(),
                if metrics["battery_level"].as_f64().unwrap_or(0.0) < 20.0 {
                    "LOW".yellow()
                } else {
                    "OK".green()
                }
                .cell(),
            ]);

            let rot = metrics["rotation"].as_array();
            if let Some(r) = rot {
                table.add_row(vec![
                    "Rotation (XYZ)".cell(),
                    format!("{:.1}, {:.1}, {:.1}", r[0], r[1], r[2]).cell(),
                    "ACTIVE".cyan().cell(),
                ]);
            }

            println!(
                "\n{} {}",
                "Clarigggz Platform".bold(),
                format!("(Port {})", port).dimmed()
            );
            println!("{}", table);
        }
        Err(_) => {
            eprintln!(
                "{} Simulation server not found. Enable CLI Mode in Desktop App.",
                "✘".red()
            );
        }
    }
}

fn watch_status(client: &reqwest::blocking::Client, base_url: &str, interval: u64) {
    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .template("{spinner:.cyan} Monitoring Clarigggz (Ctrl+C to stop) | {msg}")
            .unwrap(),
    );

    loop {
        match client.get(format!("{}/metrics", base_url)).send() {
            Ok(resp) => {
                let m: serde_json::Value = resp.json().unwrap_or_default();
                let rot = m["rotation"]
                    .as_array()
                    .map(|r| format!("{:.1}, {:.1}, {:.1}", r[0], r[1], r[2]))
                    .unwrap_or_default();
                pb.set_message(format!(
                    "CPU: {:.1}% | Temp: {:.1}°C | Rot: {}",
                    m["cpu_load"].as_f64().unwrap_or(0.0),
                    m["temperature"].as_f64().unwrap_or(0.0),
                    rot
                ));
            }
            Err(_) => pb.set_message("Waiting for server...".yellow().to_string()),
        }
        std::thread::sleep(Duration::from_millis(interval));
    }
}

fn post_action(client: &reqwest::blocking::Client, url: &str, success_msg: &str) {
    match client.post(url).send() {
        Ok(_) => println!("{} {}", "✔".green(), success_msg.bold()),
        Err(_) => eprintln!("{} Command failed.", "✘".red()),
    }
}
