import { Plugin, PluginOptions } from './Plugin'
import { PublishHttpPlugin } from './plugins/publishHttp/PublishHttpPlugin'
import { MetricsPlugin } from './plugins/metrics/MetricsPlugin'
import { WebsocketPlugin } from './plugins/websocket/WebsocketPlugin'
import { WebsocketPlugin as LegacyWebsocketPlugin } from './plugins/legacyWebsocket/WebsocketPlugin'
import { MqttPlugin } from './plugins/mqtt/MqttPlugin'
import { StoragePlugin } from './plugins/storage/StoragePlugin'
import { TestnetMinerPlugin } from './plugins/testnetMiner/TestnetMinerPlugin'

export const createPlugin = (name: string, pluginOptions: PluginOptions): Plugin<any>|never => {
    switch (name) {
        case 'publishHttp':
            return new PublishHttpPlugin(pluginOptions)
        case 'metrics':
            return new MetricsPlugin(pluginOptions)
        case 'websocket':
            return new WebsocketPlugin(pluginOptions)
        case 'legacyWebsocket':
            return new LegacyWebsocketPlugin(pluginOptions)
        case 'mqtt':
            return new MqttPlugin(pluginOptions)
        case 'storage':
            return new StoragePlugin(pluginOptions)
        case 'testnetMiner':
            return new TestnetMinerPlugin(pluginOptions)
        default:
            throw new Error(`Unknown plugin: ${name}`)
    }
}
