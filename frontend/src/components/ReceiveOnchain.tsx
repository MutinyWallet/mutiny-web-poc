import QRCode from "react-qr-code"
import Copy from "../components/Copy";
import { useContext } from "react";
import { NodeManagerContext } from "@components/GlobalStateProvider";
import { useQuery } from "@tanstack/react-query";
import takeN from "@util/takeN";
import { useNavigate } from "react-router-dom";

export default function ReceiveOnchain({ onchainAddress }: { onchainAddress: string | undefined }) {
    const { nodeManager } = useContext(NodeManagerContext);
    let navigate = useNavigate();

    useQuery({
        queryKey: ['checktransaction'],
        queryFn: async () => {
            console.log("Checking address:", onchainAddress);
            const tx = await nodeManager?.check_address(onchainAddress!);
            if (!tx) {
                return false
            } else {
                console.log(tx)
                navigate(`/receive/final?address=${onchainAddress}`)
                return tx
            }
        },
        enabled: !!onchainAddress,
        refetchInterval: 1000
    })

    return (
        <>
            {onchainAddress &&
                <>
                    <div className="bg-[#ffffff] p-4">
                        <QRCode value={onchainAddress} />
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        {/* <p className="text-lg font-mono font-light break-all"> */}
                        <pre className="flex-1">
                            <code className="break-all whitespace-nowrap overflow-hidden overflow-ellipsis">
                                {takeN(onchainAddress, 28)}
                            </code>
                        </pre>
                        <div className="flex-0">
                            <Copy copyValue={onchainAddress} />
                        </div>
                    </div>
                </>
            }
        </>
    );
}
