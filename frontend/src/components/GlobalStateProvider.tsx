import init, { InitOutput, NodeManager } from '@mutinywallet/node-manager';
import React, { createContext, useEffect, useRef, useState } from 'react';

interface Props {
    children: React.ReactElement;
}

export type NodeManagerSettingStrings = {
    network?: string, proxy?: string, esplora?: string, rgs?: string, lsp?: string,
}

interface NodeManagerProviderProps {
    setup: (settings: NodeManagerSettingStrings) => Promise<void>;
    nodeManager?: NodeManager;
}

export const NodeManagerContext = createContext<NodeManagerProviderProps>({ nodeManager: undefined, setup: async () => { } });

export function getExistingSettings(): NodeManagerSettingStrings {
    const network = localStorage.getItem('MUTINY_SETTINGS_network') || process.env.REACT_APP_NETWORK;
    const proxy = localStorage.getItem('MUTINY_SETTINGS_proxy') || process.env.REACT_APP_PROXY;
    const esplora = localStorage.getItem('MUTINY_SETTINGS_esplora') || process.env.REACT_APP_ESPLORA;
    const rgs = localStorage.getItem('MUTINY_SETTINGS_rgs') || process.env.REACT_APP_RGS || "";
    const lsp = localStorage.getItem('MUTINY_SETTINGS_lsp') || process.env.REACT_APP_LSP || "";

    return { network, proxy, esplora, rgs, lsp }
}

async function setAndGetMutinySettings(settings?: NodeManagerSettingStrings): Promise<NodeManagerSettingStrings> {
    let { network, proxy, esplora, rgs, lsp } = settings || {};

    let existingSettings = getExistingSettings();
    try {
        network = network || existingSettings.network;
        proxy = proxy || existingSettings.proxy;
        esplora = esplora || existingSettings.esplora;
        rgs = rgs || existingSettings.rgs;
        lsp = lsp || existingSettings.lsp;

        if (!network || !proxy || !esplora) {
            throw new Error("Missing a default setting for network, proxy, or esplora. Check your .env file to make sure it looks like .env.sample")
        }
        localStorage.setItem('MUTINY_SETTINGS_network', network);
        localStorage.setItem('MUTINY_SETTINGS_proxy', proxy);
        localStorage.setItem('MUTINY_SETTINGS_esplora', esplora);
        localStorage.setItem('MUTINY_SETTINGS_rgs', rgs ?? "");
        localStorage.setItem('MUTINY_SETTINGS_lsp', lsp ?? "");

        return { network, proxy, esplora, rgs, lsp }
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const GlobalStateProvider = ({ children }: Props) => {
    // eslint-disable-next-line
    const [wasm, setWasm] = useState<InitOutput>();
    const [nodeManager, setNodeManager] = useState<NodeManager>();
    const [wasmSupported, setWasmSupported] = useState(true)

    useEffect(() => {
        // https://stackoverflow.com/questions/47879864/how-can-i-check-if-a-browser-supports-webassembly
        const checkWasm = async () => {
            try {
                if (typeof WebAssembly === "object"
                    && typeof WebAssembly.instantiate === "function") {
                    const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
                    if (!(module instanceof WebAssembly.Module)) {
                        throw new Error("Couldn't instantiate WASM Module")
                    }
                } else {
                    throw new Error("No WebAssembly global object found")
                }
            } catch (e) {
                console.error(e)
                setWasmSupported(false);
            }
        }
        checkWasm();
    }, [])

    const nodeManagerInitialized = useRef(false);

    useEffect(() => {
        // TODO: learn why we init this but don't actually call stuff on it
        if (nodeManagerInitialized.current) {
            console.debug("Already initialized Node Manager")
        } else {
            nodeManagerInitialized.current = true;
            init().then((wasmModule) => {
                setWasm(wasmModule)
                setup().then(() => {
                    console.log("Setup complete")
                    console.timeEnd("Setup")
                }).catch((e) => {
                    console.error(e)
                })
            })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function setup(settings?: NodeManagerSettingStrings) {
        console.time("Setup");
        console.log("Starting setup...")
        try {
            const { network, proxy, esplora, rgs, lsp } = await setAndGetMutinySettings(settings)
            console.log("Initializing Node Manager")
            console.log("Using network", network);
            console.log("Using proxy", proxy);
            console.log("Using esplora address", esplora);
            console.log("Using rgs address", rgs);
            console.log("Using lsp address", lsp);

            const nodeManager = await new NodeManager("", undefined, proxy, network, esplora, rgs ?? "", lsp ?? "")

            let nodes = await nodeManager.list_nodes() as any[];

            // If we don't have any nodes yet, create one
            if (!nodes.length) {
                await nodeManager?.new_node()
            }

            // TODO this is some extra delay because the node manager isn't really "ready" the moment it's set
            await timeout(100)
            setNodeManager(nodeManager)
            nodeManagerInitialized.current = true;
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            {!wasmSupported ?
                <p>
                    WASM does not seem supported in your browser, this might not work for you!
                    You may have to turn on Javascript JIT in your browser settings.
                </p > :
                <NodeManagerContext.Provider value={{ nodeManager, setup }}>
                    {children}
                </NodeManagerContext.Provider>
            }
        </>
    )
}

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
