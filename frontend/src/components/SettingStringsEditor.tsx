import { toastAnything } from "@util/dumb";
import { ChangeEvent, useContext, useState } from "react";
import { inputStyle, selectStyle } from "../styles";
import ConfirmDialog from "./ConfirmDialog";
import { getExistingSettings, NodeManagerContext, NodeManagerSettingStrings } from "./GlobalStateProvider";

export default function SettingStringsEditor() {
    const { setup } = useContext(NodeManagerContext);

    const [nodeManagerSettings, setNodeManagerSettings] = useState<NodeManagerSettingStrings>(getExistingSettings());
    const [dialogOpen, setDialogOpen] = useState(false);
    const confirmMessage = "Are you sure? Changing networks will delete your node's state. This can't be undone!";

    async function handleSaveSettings() {
        console.log('save existing network', getExistingSettings().network)
        console.log('save node manager network', nodeManagerSettings.network)
        try {
            let existingNetwork = getExistingSettings().network;
            if (existingNetwork !== nodeManagerSettings.network) {
                setDialogOpen(true);
            } else {
                await setup(nodeManagerSettings);
                window.location.reload();

            }
        } catch (e) {
            console.error(e)
            toastAnything(e)
        }
    }

    async function confirmStateReset() {
        try {
            localStorage.clear();
            await setup(nodeManagerSettings);
            window.location.reload();
        } catch (e) {
            console.error(e)
            toastAnything(e)
        }

        setDialogOpen(false);
    }

    const handleInputChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        console.log("typing")
        setNodeManagerSettings({
            ...nodeManagerSettings,
            [name]: value,
        });
    };

    const handleSelectChange = (name: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNodeManagerSettings({
            ...nodeManagerSettings,
            [name]: e.target.value,
        });
    };

    return (
        <>
            <p className="text-2xl font-light">Don't trust us! Use your own servers to back Mutiny</p>
            <div className="flex flex-col gap-2 w-full">
                <h3 className="text-lg font-light uppercase mt-2">Network</h3>
                <div className="flex gap-2">
                    <select onChange={handleSelectChange("network")} className={selectStyle({ accent: "blue" })} value={nodeManagerSettings.network} placeholder="Network">
                        <option className="text-base" value="bitcoin">Mainnet</option>
                        <option className="text-base" value="testnet">Testnet</option>
                        <option className="text-base" value="signet">Signet</option>
                        <option className="text-base" value="regtest">Regtest</option>
                    </select>
                </div>
                <h3 className="text-lg font-light uppercase mt-2">Esplora</h3>
                <input onChange={handleInputChange("esplora")} defaultValue={nodeManagerSettings.esplora} className={`w-full ${inputStyle({ accent: "blue" })}`} type="text" placeholder='Esplora' />
                <h3 className="text-lg font-light uppercase mt-2">RGS</h3>
                <input onChange={handleInputChange("rgs")} defaultValue={nodeManagerSettings.rgs} className={`w-full ${inputStyle({ accent: "blue" })}`} type="text" placeholder='RGS' />
                <h3 className="text-lg font-light uppercase mt-2">LSP</h3>
                <input onChange={handleInputChange("lsp")} defaultValue={nodeManagerSettings.lsp} className={`w-full ${inputStyle({ accent: "blue" })}`} type="text" placeholder='LSP' />
                <h3 className="text-lg font-light uppercase mt-2">Websockets Proxy</h3>
                <input onChange={handleInputChange("proxy")} defaultValue={nodeManagerSettings.proxy} className={`w-full ${inputStyle({ accent: "blue" })}`} type="text" placeholder='Websocket Proxy' />
            </div>
            <button className="mt-4" onClick={handleSaveSettings}>Save Settings</button>
            <ConfirmDialog open={dialogOpen} message={confirmMessage} onCancel={() => setDialogOpen(false)} onConfirm={confirmStateReset} />
        </>
    )


}
