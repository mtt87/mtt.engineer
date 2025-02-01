use axum::Router;
use std::{env, net::SocketAddr};
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    let root_dir = env::var("ROOT_DIR").unwrap_or(String::from("dist"));
    let app = Router::new().fallback_service(ServeDir::new(root_dir));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("Serving static files on http://{}", addr);

    axum_server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
