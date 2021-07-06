import { Gate, instanceId } from './index'
import { Debug } from './log'

/**
 * Implements an async buffer.
 * Push items into buffer, push will async block once buffer is full.
 * and will unblock once buffer has been consumed.
 */
export class PushBuffer<T> implements AsyncGenerator<T> {
    readonly id
    readonly debug

    protected readonly buffer: T[] = []
    readonly bufferSize: number

    /** open when writable */
    protected readonly writeGate: Gate
    /** open when readable */
    protected readonly readGate: Gate
    protected done = false
    protected error: Error | undefined
    protected iterator?: AsyncGenerator<T>

    constructor(bufferSize = 10) {
        this.id = instanceId(this)
        this.bufferSize = bufferSize
        // start both closed
        this.writeGate = new Gate(`${this.id}-write`)
        this.readGate = new Gate(`${this.id}-read`)
        this.writeGate.close()
        this.readGate.close()
        this.debug = Debug(this.id)
        // this.debug('create', this.bufferSize)
    }

    /**
     * Puts item in buffer and opens readGate.
     * Blocks until writeGate is open again (or locked)
     * @returns Promise<true> if item was pushed, Promise<false> if done or became done before writeGate opened.
     */
    async push(item: T) {
        if (this.done) {
            return false
        }

        this.buffer.push(item)
        this.updateWriteGate()
        this.readGate.open()
        return this.writeGate.check()
    }

    private updateWriteGate() {
        this.writeGate.setOpenState(!this.isFull())
    }

    end(err?: Error) {
        this.done = true
        if (err) {
            this.error = err
        }

        this.readGate.lock()
        this.writeGate.lock()
    }

    throw(err: Error) {
        this.end(err)
        return this[Symbol.asyncIterator]().throw(err)
    }

    return(v?: T) {
        this.end()
        return this[Symbol.asyncIterator]().return(v)
    }

    next() {
        return this[Symbol.asyncIterator]().next()
    }

    isFull() {
        return !(this.buffer.length < this.bufferSize)
    }

    private async* iterate() {
        try {
            while (!this.done) {
                const ok = await this.readGate.check() // eslint-disable-line no-await-in-loop
                if (!ok) {
                    // no more reading
                    break
                }

                // keep reading off front of buffer until buffer empty
                while (this.buffer.length) {
                    const v = this.buffer.shift()!
                    // maybe open write gate
                    this.updateWriteGate()
                    yield v
                }

                this.readGate.close()

                if (this.done) {
                    break
                }
            }

            if (this.error) {
                throw this.error
            }
        } finally {
            this.buffer.length = 0
            this.writeGate.lock()
            this.readGate.lock()
        }
    }

    [Symbol.asyncIterator]() {
        if (!this.iterator) {
            this.iterator = this.iterate()
        }

        return this.iterator
    }
}

/**
 * Pull from a source into some PushBuffer
 */

export async function pull<T>(src: AsyncGenerator<T>, dest: PushBuffer<T>) {
    if (!src) {
        throw new Error('no source')
    }

    try {
        for await (const v of src) {
            const ok = await dest.push(v)
            if (!ok) {
                break
            }
        }
    } catch (err) {
        dest.end(err)
    } finally {
        dest.end()
    }
}

/**
 * Pull from a source into self.
 */

export class PullBuffer<InType> extends PushBuffer<InType> {
    source: AsyncGenerator<InType>
    constructor(source: AsyncGenerator<InType>, size = 256) {
        super(size)
        this.source = source
        pull(this.source, this)
    }
}