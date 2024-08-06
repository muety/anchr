# 📡 How to run?

## Prerequisites

In order to host Anchr on your own, you need a few things.

* Node.js >= 20.x
* MongoDB >= latest
  * Alternative 1: [Mongo Atlas](https://mongodb.com/atlas) (hosted cloud MongoDB)
  * Alternative 2: [FerretDB](https://www.ferretdb.io/) (with Postgres or SQLite)

## Database Setup

```bash
mongosh
> use admin;  // choose 'admin' as your database
> db.createUser({user: 'anchr', pwd: passwordPrompt(), roles: [{ role: 'root', db: 'admin' }]});  // create user 'anchr'
> exit
```

### Configuration

1. `$ git clone https://github.com/muety/anchr`
2. Copy `.env.example` to `.env` and edit the contents to set environment variables:
    * `PORT`: TCP port to start the server on (default: `3000`)
    * `LISTEN_ADDR`: IPv4 address to make the server listen on (default: `127.0.0.1`)
    * `ANCHR_PUBLIC_URL`: Public base URL of your hosted instance (no trailing slash) (default: `http://localhost:3000`)
    * `ANCHR_DB_USER`: MongoDB user name (default: `anchr`)
    * `ANCHR_DB_PASSWORD`: MongoDB password ( **required** )
    * `ANCHR_DB_HOST`: MongoDB host name (default: `localhost`)
    * `ANCHR_DB_PORT`: MongoDB port (default: `27017`)
    * `ANCHR_DB_NAME`: MongoDB database name (default: `admin`)
    * `ANCHR_UPLOAD_DIR`: Absolute path to a file system directory (must exist!) to persist uploaded images to (default: `/var/data/anchr`)
    * `ANCHR_ALLOW_SIGNUP`: Whether to allow sign up of new users (default: `true`)
    * `ANCHR_VERIFY_USERS`: Whether require new users to activate their accounts with an e-mail link (requires mailing) (default: `true`)
    * `ANCHR_BASIC_AUTH`: Whether to allow authenticating using [HTTP Basic Auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes) (default: `true`)
    * `ANCHR_EXPOSE_METRICS`: Whether to expose [Prometheus](https://prometheus.io) metrics under the public `/api/metrics` endpoint (default: `false`)

---

## ⚙️ Run

### Setup

1. $ > `source env.sh`
2. $ > `corepack enable`
3. $ > `yarn`
4. $ > `cd public && ../node_modules/.bin/bower install && cd ..`

### Option 1: Run Natively

#### For development

1. Run backend >`yarn start`
2. Run frontend >`yarn start:frontend`
3. Go to <http://localhost:9000> and enjoy live reload

#### In production

1. $ > `yarn run build` (build frontend)
2. $ > `yarn run production`

#### Option 2: Run with Docker

1. $ > `docker build -t anchr .`
2. $ > `source env.sh`
3. $ > `docker-compose up -d`
4. Go to <http://localhost:3000> and enjoy live reload


### Upgrade packges

```bash
# Backend
$ yarn plugin import interactive-tools
$ yarn upgrade-interactive

# Frontend
$ cat bower.json | jq   '.dependencies | keys[]' -r | xargs npx bower update
```

## 📓 License

GNU General Public License v3 (GPL-3) @ [USFAkbari](akbari7694@gmail.com)
