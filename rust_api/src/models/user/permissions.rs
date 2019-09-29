use diesel::{
    backend::Backend,
    deserialize::{self, FromSql},
    serialize::{self, Output, ToSql},
    sql_types::Text,
};
use juniper::GraphQLEnum;
use serde_derive::{Deserialize, Serialize};
use std::io::Write;

#[derive(
    Clone,
    Debug,
    PartialEq,
    Eq,
    Hash,
    Serialize,
    Deserialize,
    FromSqlRow,
    GraphQLEnum,
)]
pub enum Permission {
    ViewUsers,
    ManageUsers,
    ManagePages,
    ViewUnpublishedPosts,
    ManagePosts,
}

// This shit below is basically wizardry ripped from Diesel to wrangle
// the type system into submission. It lets Permission convert
// to/from SQL.

impl<DB> ToSql<Text, DB> for Permission
where
    DB: Backend,
    String: ToSql<Text, DB>, // Magic
{
    fn to_sql<W: Write>(&self, out: &mut Output<W, DB>) -> serialize::Result {
        // Convert this permission to a string of its name
        let name_str: String = serde_json::to_string(self)?;
        name_str.to_sql(out)
    }
}

impl<DB> FromSql<Text, DB> for Permission
where
    DB: Backend,
    *const str: FromSql<Text, DB>, // Magic
{
    fn from_sql(bytes: Option<&DB::RawValue>) -> deserialize::Result<Self> {
        // Convert this permission from a string of its name
        let name_str: String = String::from_sql(bytes)?;
        Ok(serde_json::from_str(&name_str)?)
    }
}
