const assert = require('assert')
const Connection = require('../lib/connection.js')
const Stream = require('../lib/stream.js')
const StreamrBinaryMessage = require('../lib/protocol/StreamrBinaryMessage')
const StreamrBinaryMessageWithKafkaMetadata = require('../lib/protocol/StreamrBinaryMessageWithKafkaMetadata')

describe('Connection', function () {

	var connection
	var fakeSocket

	beforeEach(function() {
		fakeSocket = {
			id: 'socketId',
			received: [],
			send: function(msg) {
				this.received.push(msg)
			}
		}
		connection = new Connection(fakeSocket)
	})

	it('id returns socket id', function() {
		assert.equal(connection.id, 'socketId')
	})

	describe("stream management", function () {
		describe('addStream', function () {
			it('adds stream to the connection', function () {
				const stream0 = new Stream('stream', 0, 'subscribed')
				const stream2 = new Stream('stream', 1, 'subscribing')
				connection.addStream(stream0)
				connection.addStream(stream2)
				assert.deepEqual(connection.getStreams(), [stream0, stream2])
			})
		})

		describe('removeStream', function () {
			var stream1
			var stream2
			var stream3

			beforeEach(function () {
				stream1 = new Stream('stream1', 0, 'subscribed')
				stream2 = new Stream('stream2', 0, 'subscribed')
				stream3 = new Stream('stream3', 0, 'subscribed')
				connection.addStream(stream1)
				connection.addStream(stream2)
				connection.addStream(stream3)
			})

			it('removes stream if it exists', function () {
				connection.removeStream("stream2", 0)
				assert.deepEqual(connection.getStreams(), [stream1, stream3])
			})

			it('keeps streams intact if argument stream does not exist', function () {
				connection.removeStream("stream4", 0)
				assert.deepEqual(connection.getStreams(), [stream1, stream2, stream3])
			})
		})

		describe('getStreams', function () {
			var stream1
			var stream2
			var stream3

			beforeEach(function () {
				stream1 = new Stream('stream1', 0, 'subscribed')
				stream2 = new Stream('stream2', 0, 'subscribed')
				stream3 = new Stream('stream3', 0, 'subscribed')
				connection.addStream(stream1)
				connection.addStream(stream2)
				connection.addStream(stream3)
			})

			it('returns a copy of its streams', function () {
				connection.getStreams().push("foobar")
				assert.deepEqual(connection.getStreams(), [stream1, stream2, stream3])
			})
		})
	})

	describe("send functions", function() {
		var msgWithMetaData

		beforeEach(function() {
			const streamrBinaryMessage = new StreamrBinaryMessage("streamId", 0, new Date(2017, 2, 24, 13, 45, 0), 0,
				StreamrBinaryMessage.CONTENT_TYPE_JSON, {})
			msgWithMetaData = new StreamrBinaryMessageWithKafkaMetadata(streamrBinaryMessage, 25, 24, 0)
		})

		function expectedMessage(msgCode) {
			return JSON.stringify([0, msgCode, '', msgWithMetaData.toArray()])
		}

		it('sendRaw sends expected message to socket', function() {
			connection.sendRaw(['666', 'hello world'])
			assert.deepEqual(fakeSocket.received, [['666', 'hello world']])
		})

		it('sendUnicast sends expected message to socket', function() {
			connection.sendUnicast(msgWithMetaData)
			assert.deepEqual(fakeSocket.received, [expectedMessage(1)])
		})

		it('sendSubscribed sends expected message to socket', function() {
			connection.sendSubscribed(msgWithMetaData)
			assert.deepEqual(fakeSocket.received, [expectedMessage(2)])
		})

		it('sendUnsubscribed sends expected message to socket', function() {
			connection.sendUnsubscribed(msgWithMetaData)
			assert.deepEqual(fakeSocket.received, [expectedMessage(3)])
		})

		it('sendResending sends expected message to socket', function() {
			connection.sendResending(msgWithMetaData)
			assert.deepEqual(fakeSocket.received, [expectedMessage(4)])
		})

		it('sendResent sends expected message to socket', function() {
			connection.sendResent(msgWithMetaData)
			assert.deepEqual(fakeSocket.received, [expectedMessage(5)])
		})

		it('sendNoResend sends expected message to socket', function() {
			connection.sendNoResend(msgWithMetaData)
			assert.deepEqual(fakeSocket.received, [expectedMessage(6)])
		})

		it('sendError sends expected message to socket', function() {
			connection.sendError(msgWithMetaData)
			assert.deepEqual(fakeSocket.received, [expectedMessage(7)])
		})
	})
})