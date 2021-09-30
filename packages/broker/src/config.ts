import { SmartContractRecord } from 'streamr-network/dist/src/streamr-protocol'

export interface NetworkSmartContract {
    contractAddress: string
    jsonRpcProvider: string
}

export type TrackerRegistryItem = SmartContractRecord

export interface TurnConfig {
    url: string,
    username: string,
    password: string
}

export interface NetworkConfig {
    name: string,
    trackers: TrackerRegistryItem[] | NetworkSmartContract,
    stun: string | null,
    turn: TurnConfig | null
    location: {
        latitude: number,
        longitude: number,
        country: string,
        city: string
    } | null
}

export interface HttpServerConfig {
    port: number,
    privateKeyFileName: string | null,
    certFileName: string | null
}

export interface StorageNodeRegistryItem {
    address: string
    url: string
}

export interface StorageNodeConfig {
    registry: NetworkSmartContract
}

export interface Config {
    ethereumPrivateKey: string
    generateSessionId: boolean
    network: NetworkConfig,
    streamrUrl: string,
    streamrAddress: string,
    storageNodeConfig: StorageNodeConfig,
    httpServer: HttpServerConfig
    plugins: Record<string,any>
    apiAuthentication: {
        keys: string[]
    } | null
}
