dev:
    cd ./frontend && npm run start-ssl

cert:
    mkdir -p ./frontend/.cert && mkcert -key-file ./frontend/.cert/key.pem -cert-file ./frontend/.cert/cert.pem "localhost"

local:
    cd ./frontend && npm link "@mutinywallet/mutiny-wasm"

remote:
    cd ./frontend && npm unlink --no-save "@mutinywallet/mutiny-wasm" && npm install
