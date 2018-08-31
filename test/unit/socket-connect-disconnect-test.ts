import * as zmq from "../.."
import {assert} from "chai"
import {testProtos, uniqAddress} from "./helpers"

for (const proto of testProtos("tcp", "ipc", "inproc")) {
  describe(`socket with ${proto} connect/disconnect`, function() {
    beforeEach(function() {
      this.sock = new zmq.Dealer
    })

    afterEach(function() {
      this.sock.close()
      global.gc()
    })

    describe("connect", function() {
      it("should throw error for invalid uri", async function() {
        try {
          await this.sock.connect("foo-bar")
          assert.ok(false)
        } catch (err) {
          assert.instanceOf(err, Error)
          assert.equal(err.message, "Invalid argument")
          assert.equal(err.code, "EINVAL")
          assert.typeOf(err.errno, "number")
          assert.equal(err.address, "foo-bar")
        }
      })

      it("should throw error for invalid protocol", async function() {
        try {
          await this.sock.connect("foo://bar")
          assert.ok(false)
        } catch (err) {
          assert.instanceOf(err, Error)
          assert.equal(err.message, "Protocol not supported")
          assert.equal(err.code, "EPROTONOSUPPORT")
          assert.typeOf(err.errno, "number")
          assert.equal(err.address, "foo://bar")
        }
      })

      it("should allow setting routing id on router", async function() {
        this.sock = new zmq.Router({mandatory: true})
        await this.sock.connect(uniqAddress(proto), {routingId: "remoteId"})
        await this.sock.send(["remoteId", "hi"])
      })
    })

    describe("disconnect", function() {
      it("should throw error if not connected to endpoint", async function() {
        const address = uniqAddress(proto)
        try {
          await this.sock.disconnect(address)
          assert.ok(false)
        } catch (err) {
          assert.instanceOf(err, Error)
          assert.equal(err.message, "No such endpoint")
          assert.equal(err.code, "ENOENT")
          assert.typeOf(err.errno, "number")
          assert.equal(err.address, address)
        }
      })

      it("should throw error for invalid uri", async function() {
        try {
          await this.sock.disconnect("foo-bar")
          assert.ok(false)
        } catch (err) {
          assert.instanceOf(err, Error)
          assert.equal(err.message, "Invalid argument")
          assert.equal(err.code, "EINVAL")
          assert.typeOf(err.errno, "number")
          assert.equal(err.address, "foo-bar")
        }
      })

      it("should throw error for invalid protocol", async function() {
        try {
          await this.sock.disconnect("foo://bar")
          assert.ok(false)
        } catch (err) {
          assert.instanceOf(err, Error)
          assert.equal(err.message, "Protocol not supported")
          assert.equal(err.code, "EPROTONOSUPPORT")
          assert.typeOf(err.errno, "number")
          assert.equal(err.address, "foo://bar")
        }
      })
    })
  })
}