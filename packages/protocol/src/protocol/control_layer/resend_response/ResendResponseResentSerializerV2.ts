import ControlMessage from '../ControlMessage'

import ResendResponseResent from './ResendResponseResent'

import { Serializer } from '../../../Serializer'

const VERSION = 2

export default class ResendResponseResentSerializerV2 extends Serializer<ResendResponseResent> {
    toArray(resendResponseResent: ResendResponseResent): any[] {
        return [
            VERSION,
            ControlMessage.TYPES.ResendResponseResent,
            resendResponseResent.requestId,
            resendResponseResent.streamId,
            resendResponseResent.streamPartition,
        ]
    }

    fromArray(arr: any[]): ResendResponseResent {
        const [
            version,
            type, // eslint-disable-line @typescript-eslint/no-unused-vars
            requestId,
            streamId,
            streamPartition,
        ] = arr

        return new ResendResponseResent({
            version, requestId, streamId, streamPartition
        })
    }
}

ControlMessage.registerSerializer(VERSION, ControlMessage.TYPES.ResendResponseResent, new ResendResponseResentSerializerV2())
