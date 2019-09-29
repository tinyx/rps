use crate::{
    diesel::prelude::*,
    error::{Error, ErrorKind, Result},
    graphql::{Context, DbConn},
    models::Permission,
    schema::users,
};
use juniper::{graphql_object, FieldResult, GraphQLObject};
use rocket::{
    http::{Cookie, Cookies, Status},
    request::{self, FromRequest},
    Request,
};
use serde_derive::Serialize;

const USER_ID_COOKIE_NAME: &str = "userid";

#[derive(Debug, Serialize, Identifiable, Queryable, GraphQLObject)]
pub struct User {
    pub id: String, // Google user ID
    pub permissions: Vec<Permission>,
    pub email: String,
    pub name: String,
    pub picture: String,
    pub given_name: String,
    pub family_name: String,
    pub locale: String,
}

impl User {
    /// Checks if the user has the given permission.
    pub fn has_permission(&self, permission: &Permission) -> bool {
        self.permissions.contains(permission)
    }

    fn get_by_id_authless(conn: &PgConnection, id: &str) -> Result<Self> {
        Ok(users::dsl::users.find(id).get_result::<Self>(conn)?)
    }

    fn get_many(ctx: &Context) -> Result<Vec<Self>> {
        // Check for the proper permissions
        auth!(ctx, Permission::ViewUsers);
        // Get all users
        Ok(users::table.load::<Self>(ctx.db_conn())?)
    }

    fn get_by_id(ctx: &Context, id: &str) -> Result<Self> {
        // Check for the proper permissions
        auth!(ctx, Permission::ViewUsers);
        Self::get_by_id_authless(ctx.db_conn(), id)
    }

    pub fn from_cookie(
        conn: &PgConnection,
        cookies: &mut Cookies,
    ) -> Result<Self> {
        match cookies.get_private(USER_ID_COOKIE_NAME) {
            None => Err(ErrorKind::Authentication.into()),
            Some(user_id_cookie) => {
                Self::get_by_id_authless(conn, user_id_cookie.value())
            }
        }
    }

    pub fn add_cookie(&self, cookies: &mut Cookies) {
        cookies.add_private(Cookie::new(USER_ID_COOKIE_NAME, self.id.clone()));
    }

    pub fn remove_cookie(cookies: &mut Cookies) {
        cookies.remove_private(Cookie::named(USER_ID_COOKIE_NAME));
    }

    pub fn get_cookie(cookies: &mut Cookies) -> Option<Cookie<'static>> {
        cookies.get_private(USER_ID_COOKIE_NAME)
    }
}

impl<'a, 'r> FromRequest<'a, 'r> for User {
    type Error = Error;

    fn from_request(
        req: &'a Request<'r>,
    ) -> request::Outcome<Self, Self::Error> {
        // Get either a User or one of our Errors
        let res: Result<Self> = match User::get_cookie(&mut req.cookies()) {
            // No User ID cookie == No access for you
            None => {
                // Create an Authentication error, then use its From
                // definition to get a status code.
                Err(ErrorKind::Authentication.into())
            }
            // Check the value of the cookie for a valid user ID
            Some(user_id_cookie) => {
                // Get a DB connection. This can't fail, because
                // DbConn::Error=(), so an unwrap is safe.
                let conn: DbConn = req.guard().unwrap();
                Self::get_by_id_authless(&conn, user_id_cookie.value())
            }
        };

        // Convert the User/Error to a rocket Outcome
        match res {
            Ok(user) => request::Outcome::Success(user),
            // Get an HTTP code from the error and return it
            Err(err) => request::Outcome::Failure((Status::from(&err), err)),
        }
    }
}

pub struct UserQuery;

graphql_object!(UserQuery: Context | &self | {
    field get_many(&executor) -> FieldResult<Vec<User>> {
        Ok(User::get_many(&executor.context())?)
    }

    field get(&executor, id: String) -> FieldResult<User> {
        Ok(User::get_by_id(&executor.context(), &id)?)
    }
});
