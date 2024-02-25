mongosh -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --eval "
use \"$MONGO_INITDB_DATABASE\";
db.createUser({user: \"$DB_USER\", pwd: \"$DB_PASSWORD\", roles: [{ role: \"dbOwner\", db: \"$MONGO_INITDB_DATABASE\" }]});"
