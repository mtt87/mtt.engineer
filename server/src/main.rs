use axum::{
    Router,
    extract::{OriginalUri, Request},
    http::{HeaderValue, StatusCode, Uri, header},
    middleware::{self, Next},
    response::Response,
};
use std::env;
use tokio::net::TcpListener;
use tower_http::{services::ServeDir, trace::TraceLayer};
use tracing::info_span;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

async fn content_negotiation_middleware(mut request: Request, next: Next) -> Response {
    let wants_markdown = request
        .headers()
        .get(header::ACCEPT)
        .and_then(|v| v.to_str().ok())
        .map(|v| v.contains("text/md") || v.contains("text/markdown"))
        .unwrap_or(false);

    if wants_markdown {
        let path = request.uri().path();
        let new_path = if path == "/" {
            "/index.md".to_string()
        } else if !path.contains('.') {
            format!("{}.md", path.trim_end_matches('/'))
        } else {
            path.to_string()
        };

        if let Ok(uri) = new_path.parse::<Uri>() {
            *request.uri_mut() = uri;
        }
    }

    let mut response = next.run(request).await;

    if wants_markdown && response.status() != StatusCode::NOT_FOUND {
        response.headers_mut().insert(
            header::CONTENT_TYPE,
            HeaderValue::from_static("text/markdown; charset=utf-8"),
        );
        // Don't cache markdown responses — Cloudflare ignores Vary on Accept
        // and would serve the cached markdown to regular browser requests.
        response.headers_mut().insert(
            header::CACHE_CONTROL,
            HeaderValue::from_static("no-store"),
        );
    } else {
        response.headers_mut().insert(
            header::CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=60, stale-while-revalidate=86400"),
        );
    }

    response
}

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
        .layer(middleware::from_fn(content_negotiation_middleware))
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
