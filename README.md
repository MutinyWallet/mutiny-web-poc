# mutiny-web (proof of concept)

The first version of the mutiny web concept, built during the bolt.fun hackathon.

The node logic is built in rust and located [here](https://github.com/MutinyWallet/mutiny-node) and the typescript bindings for that is located [here](https://www.npmjs.com/package/@mutinywallet/node-manager).

## Development 

### Dependencies

- [node](https://nodejs.org/en/)
- [just](https://github.com/casey/just)
- [mkcert](https://github.com/FiloSottile/mkcert)

### Build

Get all the dependencies above first.

```
cd frontend
npm i
npm start
```

### Local node-manager

To make local development easier with a latest local version of the node manager, you may want to `npm link` it.

In your `mutiny-node` local repo:

```
just pack && cd node-manager/pkg && npm link
```

Now in this repo, link them.

```
just local
```

To revert back and use the remote version of node-manager:

```
just remote
```


## With SSL

Since we plan to use web workers and other SSL-required things, we can also do SSL in localhost to make testing a little less gotch-ey.

First generate the local cert (requires `mkcert` command):

```
just cert
```

Then start react with SSL flags:

```
npm run start-ssl
```

### PWA

To test out PWA stuff you need to `build` and then run the built artifact:

```
npm run build
```

(if you don't have a server installed: `npm install -g serve`)

Then serve the build folder:

```
serve -s build
```

They recommend running this in an incognito window because caching can be annoying with this stuff. Works for me in Chrome to install Mutiny as a desktop app.

### Bitcoin networks

You'll need a regtest bitcoin node, electrs, and an exposed port to whatever regtest node you are connecting to.

#### For Testnet / Mainnet mutiny

Mutiny defaults to regtest, but the network can be set by environment variable (it's set to "bitcoin" in the production deployment).

Create a `.env.local` file in the frontend dir and add this:

```
REACT_APP_NETWORK="testnet"
```

Or

```
REACT_APP_NETWORK="bitcoin"
```

Then restart your dev server.

#### For [electrs](https://github.com/Blockstream/electrs)

First build it, then run this script for regtest, replacing paths and passwords where necessary. YMMV. One special note is that this is for cookie password based auth.

```
/path/to/target/release/electrs -vvvv --daemon-dir /path/to/.bitcoin/regtest/data/ --timestamp --blocks-dir /path/to/.bitcoin/regtest/data/regtest/blocks/ --cookie="bitcoinrpc:{cookiebasedpassword}" --db-dir /path/to/.electrs/ --network regtest --http-addr 0.0.0.0:3003
```
