# Cloudsphere — Run Locally

This document explains how to run the Cloudsphere project locally (server + client).

## Prerequisites

- Node.js and npm installed
- MongoDB running locally (or a remote connection URI)

## Environment

- Ensure the server environment file exists at [server/.env](server/.env#L1-L5). Important variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/cloudsphere
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

Replace values as needed for your environment.

## Install

From the project root, install server and client dependencies:

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

## Run (development)

Start the server (uses `nodemon` in dev):

```bash
cd server
npm run dev
# or: npm start
```

Start the client (Vite):

```bash
cd client
npm run dev
```

## Verify

- Server health endpoint: http://localhost:5000/api/health
- Client UI: http://localhost:5173/

## Troubleshooting

- If the server logs "Failed to connect to MongoDB" or you see `ECONNREFUSED`, ensure MongoDB is running locally (e.g. `mongod`) or update `MONGO_URI` in [server/.env](server/.env#L1-L5) to point to a reachable MongoDB instance.
- If ports conflict, update `PORT` in [server/.env](server/.env#L1-L5) and the Vite port in `client/vite.config.js` if present.

## Notes

- The server will still start without an active MongoDB connection for local UI development, but DB-backed features will not function until a DB connection is available.

Feel free to ask me to add a `README` section for deployment, Docker, or environment examples.
# Cloudsphere
