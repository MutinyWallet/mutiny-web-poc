import { NodeManagerContext } from "@components/GlobalStateProvider";
import { useQuery } from "@tanstack/react-query";
import takeN from "@util/takeN";
import { useContext } from "react";
import Close from "../components/Close"
import PageTitle from "../components/PageTitle"
import prettyPrintAmount from "@util/prettyPrintAmount";
import { useNavigate } from "react-router-dom";
import { mainWrapperStyle } from "../styles";

type Utxo = {
    outpoint: string
    txout: {
        value: number
        script_pubkey: string
    }
    keychain: string
    is_spent: boolean
}

const SingleUtxo = ({ utxo }: { utxo: Utxo }) => {
    return (
        <li className="text-off-white border-b border-red py-2 mb-2">
            <h3 className="text-lg font-mono">
                {takeN(utxo.outpoint, 25)}
            </h3>
            <h3 className="text-lg font-light">{prettyPrintAmount(utxo.txout.value)} sats</h3>
            <h3 className="text-lg font-light">{utxo.is_spent ? <span className="text-red">Spent</span> : <span className="text-green">Unspent</span>}</h3>
            <h4 className="text-sm font-light opacity-50">Script Pubkey: {takeN(utxo.txout.script_pubkey, 25)}</h4>
        </li>
    )
}

function Utxos() {
    const { nodeManager } = useContext(NodeManagerContext);
    let navigate = useNavigate();

    function handleSweep() {
        navigate(`/send?all=true`)
    }

    const { data: utxos } = useQuery({
        queryKey: ['utxos'],
        queryFn: () => {
            console.log("Getting utxos...")
            const txs = nodeManager?.list_utxos() as Promise<Utxo[]>;
            return txs
        },
        enabled: !!nodeManager,
    })

    return (
        <>
            <header className='px-8 pt-8 flex justify-between items-center'>
                <PageTitle title="Utxos" theme="red" />
                <Close />
            </header>
            <main className={mainWrapperStyle({ padSides: "no" })}>
                <button className="mx-8" onClick={handleSweep}>Sweep Wallet</button>
                <ul className="overflow-y-scroll px-8 pb-[12rem] h-full">
                    {utxos?.map(utxo => (
                        <SingleUtxo utxo={utxo} key={utxo.outpoint} />
                    ))}
                </ul>
            </main>
        </>
    )
}

export default Utxos