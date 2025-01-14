import StreamMessage from './StreamMessage'
import MessageRef from './MessageRef'
import MessageIDStrict from './MessageIDStrict'

import { Serializer } from '../../Serializer'

const VERSION = 31

export default class StreamMessageSerializerV31 extends Serializer<StreamMessage> {
    toArray(streamMessage: StreamMessage): any[] {
        return [
            VERSION,
            streamMessage.messageId.toArray(),
            streamMessage.prevMsgRef ? streamMessage.prevMsgRef.toArray() : null,
            streamMessage.messageType,
            streamMessage.encryptionType,
            streamMessage.serializedContent,
            streamMessage.signatureType,
            streamMessage.signature,
        ]
    }

    fromArray(arr: any[]): StreamMessage<any> {
        const [
            version, // eslint-disable-line @typescript-eslint/no-unused-vars
            messageIdArr,
            prevMsgRefArr,
            messageType,
            encryptionType,
            serializedContent,
            signatureType,
            signature,
        ] = arr

        return new StreamMessage({
            messageId: MessageIDStrict.fromArray(messageIdArr),
            prevMsgRef: prevMsgRefArr ? MessageRef.fromArray(prevMsgRefArr) : null,
            content: serializedContent,
            messageType,
            contentType: StreamMessage.CONTENT_TYPES.JSON,
            encryptionType,
            signatureType,
            signature,
        })
    }
}

StreamMessage.registerSerializer(VERSION, new StreamMessageSerializerV31())
