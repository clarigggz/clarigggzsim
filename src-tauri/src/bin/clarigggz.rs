use clap::{Parser, Subcommand};
use serde_json::json;

#[derive(Parser)]
#[command(name = "clarigggz")]
#[command(about = "Clarigggz Spatial Platform CLI", long_about = None)]
struct Cli {
    #[arg(short, long, default_value_t = 4242)]
    port: u16,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Get current hardware metrics
    Status,
    /// Toggle the spatial kernel state
    Toggle,
    /// Run a script on the spatial engine
    Run {
        /// The script content or file path (not yet implemented)
        script: String,
    },
}

fn main() {
    let cli = Cli::parse();
    let base_url = format!("http://127.0.0.1:{}", cli.port);
    let client = reqwest::blocking::Client::new();

    match cli.command {
        Commands::Status => {
            match client.get(format!("{}/metrics", base_url)).send() {
                Ok(resp) => {
                    let text = resp.text().unwrap_or_else(|_| "Error reading metrics".into());
                    println!("--- Clarigggz Hardware Status ---");
                    println!("{}", text);
                }
                Err(_) => eprintln!("Error: Simulation server not found on port {}. Ensure CLI mode is enabled in Settings.", cli.port),
            }
        }
        Commands::Toggle => {
            match client.post(format!("{}/kernel/toggle", base_url)).send() {
                Ok(resp) => {
                    let running: bool = resp.json().unwrap_or(false);
                    println!("Kernel state toggled. Running: {}", running);
                }
                Err(_) => eprintln!("Error: Failed to toggle kernel."),
            }
        }
        Commands::Run { script } => {
            let body = json!({ "script": script });
            match client.post(format!("{}/script/run", base_url)).json(&body).send() {
                Ok(resp) => {
                    let text = resp.text().unwrap_or_else(|_| "Error reading response".into());
                    println!("Execution Result: {}", text);
                }
                Err(_) => eprintln!("Error: Failed to execute script."),
            }
        }
    }
}
