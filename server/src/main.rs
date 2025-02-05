use axum::{extract::OriginalUri, http::Request, Router};
use std::env;
use tokio::net::TcpListener;
use tower_http::{services::ServeDir, trace::TraceLayer};
use tracing::info_span;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    let root_dir = env::var("ROOT_DIR").unwrap_or(String::from("dist"));

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                // axum logs rejections from built-in extractors with the `axum::rejection`
                // target, at `TRACE` level. `axum::rejection=trace` enables showing those events
                format!(
                    "{}=debug,tower_http=debug,axum::rejection=trace",
                    env!("CARGO_CRATE_NAME")
                )
                .into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let app = Router::new()
        .fallback_service(ServeDir::new(root_dir))
        .layer(
            TraceLayer::new_for_http().make_span_with(|request: &Request<_>| {
                // Log the matched route's path (with placeholders not filled in).
                // Use request.uri() or OriginalUri if you want the real path.

                let path = if let Some(path) = request.extensions().get::<OriginalUri>() {
                    // This will include `/api`
                    path.0.path().to_owned()
                } else {
                    // The `OriginalUri` extension will always be present if using
                    // `Router` unless another extractor or middleware has removed it
                    request.uri().path().to_owned()
                };

                info_span!(
                    "http_request",
                    method = ?request.method(),
                    path,
                )
            }),
        );

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::debug!("Serving static files on {}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}
