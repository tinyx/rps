use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use std::env;

fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

fn index2() -> impl Responder {
    HttpResponse::Ok().body("Hello world again!")
}

fn main() {
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(index))
            .route("/again", web::get().to(index2))
    })
    .bind(env::var("RPS_HOST").unwrap())
    .unwrap()
    .run()
    .unwrap();
}
