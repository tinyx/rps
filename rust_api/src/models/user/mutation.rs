use crate::{
    diesel::prelude::*,
    error::{Error, ErrorKind, Result},
    graphql::{Context, DbConn},
    models::{Permission, User},
    schema::users,
};
use google_signin::IdInfo;
use itertools::Itertools;
use juniper::{graphql_object, FieldResult};
use serde_derive::Deserialize;
use std::convert::TryFrom;

impl User {
    fn delete(ctx: &Context, id: &str) -> Result<Self> {
        auth!(ctx, Permission::ManageUsers);
        Ok(diesel::delete(users::table.find(id)).get_result(ctx.db_conn())?)
    }

    fn set_permissions(
        ctx: &Context,
        id: &str,
        permissions: Vec<Permission>,
    ) -> Result<Self> {
        auth!(ctx, Permission::ManageUsers);

        let uniq: Vec<_> = permissions.into_iter().unique().collect();

        // Set the permissions field to the new value
        let q = diesel::update(users::table.find(id))
            .set(users::permissions.eq(uniq))
            .get_result(ctx.db_conn());
        Ok(q?)
    }
}

#[derive(Debug, Deserialize, AsChangeset, Insertable)]
#[table_name = "users"]
pub struct NewUser {
    pub id: String,
    pub email: String,
    pub name: String,
    pub picture: String,
    pub given_name: String,
    pub family_name: String,
    pub locale: String,
}

impl NewUser {
    pub fn upsert(&self, conn: &DbConn) -> Result<User> {
        // Try to insert, if there's a conflict, update the existing row
        Ok(diesel::insert_into(users::table)
            .values(self)
            .on_conflict(users::id)
            .do_update()
            .set(self)
            .get_result(&conn as &PgConnection)?)
    }
}

// Simple macro that converts a None for a User field into an Error
macro_rules! check_field {
    ($val:expr, $field:expr) => {
        $val.ok_or_else(|| {
            Error::from(ErrorKind::MissingUserFields(vec![$field.into()]))
        })?
    };
}

impl TryFrom<IdInfo> for NewUser {
    type Error = Error;

    fn try_from(idinfo: IdInfo) -> Result<Self> {
        Ok(Self {
            id: idinfo.sub,
            // Convert each Option field into a Result. Will be a
            // MissingLoginField error instead of None.
            email: check_field!(idinfo.email, "email"),
            name: check_field!(idinfo.name, "name"),
            picture: check_field!(idinfo.picture, "picture"),
            given_name: check_field!(idinfo.given_name, "given_name"),
            family_name: check_field!(idinfo.family_name, "family_name"),
            locale: check_field!(idinfo.locale, "locale"),
        })
    }
}

pub struct UserMutation;

graphql_object!(UserMutation: Context | &self | {
    field delete(&executor, id: String) -> FieldResult<User> {
        Ok(User::delete(&executor.context(), &id)?)
    }

    field set_permissions(
        &executor,
        id: String,
        permissions: Vec<Permission>,
    ) -> FieldResult<User> {
        Ok(User::set_permissions(&executor.context(), &id, permissions)?)
    }
});
