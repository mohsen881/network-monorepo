#!/usr/bin/env node
import { Command } from 'commander'
import { subscribe } from '../src/subscribe'
import { envOptions, authOptions, exitWithHelpIfArgsNotBetween, formStreamrOptionsWithEnv, createFnParseInt, getStreamId } from './common'
import pkg from '../package.json'

const program = new Command()
program
    .arguments('<streamId>')
    .description('subscribe to a stream, prints JSON messages to stdout line-by-line')
    .option('-p, --partition [partition]', 'partition', createFnParseInt('--partition'), 0)
    .option('-d, --disable-ordering', 'disable ordering of messages by OrderingUtil', false)
authOptions(program)
envOptions(program)
    .version(pkg.version)
    .action((streamIdOrPath: string, options: any) => {
        options.orderMessages = !options.disableOrdering
        const streamId = getStreamId(streamIdOrPath, options)!
        subscribe(streamId, options.partition, formStreamrOptionsWithEnv(options))
    })
    .parse(process.argv)

exitWithHelpIfArgsNotBetween(program, 1, 1)