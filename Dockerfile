# syntax=docker/dockerfile:1
FROM oven/bun:latest AS web_build
WORKDIR /usr/src/website
COPY website/package.json .
COPY website/bun.lock .

RUN bun install

COPY website .

RUN bun run build
# final build inside /usr/src/website/dist

FROM rust:latest AS server_build
RUN USER=root cargo new --bin server
WORKDIR /server
COPY ./server/Cargo.lock ./Cargo.lock
COPY ./server/Cargo.toml ./Cargo.toml

RUN cargo build --release
RUN rm src/*.rs

COPY ./server/src ./src

RUN rm ./target/release/deps/server*
RUN cargo build --release
# server binary inside /server/target/release/server

FROM debian:bookworm-slim AS runtime
RUN apt-get update && apt install -y openssl
WORKDIR /app
EXPOSE 3000
COPY --from=web_build /usr/src/website/dist ./dist
COPY --from=server_build /server/target/release/server .

CMD [ "./server" ]
