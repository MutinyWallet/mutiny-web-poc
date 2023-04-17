import { useQuery } from "@tanstack/react-query"
import { NodeManager } from "@mutinywallet/mutiny-wasm"

export const usePriceQuery = (nodeManager: NodeManager | undefined) =>
    useQuery({
        queryKey: ['price'],
        queryFn: async () => {
            console.log("Checking bitcoin price...")
            return await nodeManager?.get_bitcoin_price()
        },
        enabled: !!nodeManager,
    })
