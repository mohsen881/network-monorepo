#!/usr/bin/env node
import { Command } from 'commander'
import { StreamrClient } from 'streamr-client'
import {
    envOptions,
    authOptions,
    exitWithHelpIfArgsNotBetween,
    formStreamrOptionsWithEnv,
} from './common'
import pkg from '../package.json'
import EasyTable from 'easy-table'

const program = new Command()
program
    .arguments('<storageNodeAddress>')
    .description('list streams parts in a storage node')
authOptions(program)
envOptions(program)
    .version(pkg.version)
    .action((storageNodeAddress: string, options: any) => {
        const client = new StreamrClient(formStreamrOptionsWithEnv(options))
        client.getStreamPartsByStorageNode(storageNodeAddress)
            .then((streamParts) => {
                if (streamParts.length > 0) {
                    console.info(EasyTable.print(streamParts.map(({ streamId, streamPartition }) => ({
                        streamId,
                        streamPartition,
                    }))))
                }
                return true
            }).catch((err) => {
                console.error(err)
                process.exit(1)
            })
    })
    .parse(process.argv)

exitWithHelpIfArgsNotBetween(program, 1, 1)
