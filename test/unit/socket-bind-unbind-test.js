const zmq = require("../..")
const semver = require("semver")
const {assert} = require("chai")
const {uniqAddress} = require("./helpers")

for (const proto of ["inproc", "ipc", "tcp"]) {
  describe(`socket with ${proto} bind/unbind`, function() {
    before(function() {
      /* ZMQ < 4.1 fails with assertion errors with inproc.
         See: https://github.com/zeromq/libzmq/pull/2123/files */
      if (proto == "inproc" && semver.satisfies(zmq.version, "< 4.1")) this.skip()
    })

    beforeEach(function() {
      this.sock = new zmq.Dealer
    })

    afterEach(function() {
      this.sock.close()
      gc()
    })

    describe("bind", function() {
      it("should resolve", async function() {
        await this.sock.bind(uniqAddress(proto))
        assert.ok(true)
      })

      it("should throw error if not bound to endpoint", async function() {
        const address = uniqAddress(proto)
        try {
          await this.sock.unbind(address)
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
          await this.sock.bind("foo-bar")
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
          await this.sock.bind("foo://bar")
          assert.ok(false)
        } catch (err) {
          assert.instanceOf(err, Error)
          assert.equal(err.message, "Protocol not supported")
          assert.equal(err.code, "EPROTONOSUPPORT")
          assert.equal(err.errno, process.platform == "linux" ? 93 : 43)
          assert.equal(err.address, "foo://bar")
        }
      })

      it("should fail during other bind", async function() {
        let promise
        try {
          promise = this.sock.bind(uniqAddress(proto))
          await this.sock.bind(uniqAddress(proto))
          assert.ok(false)
        } catch (err) {
          assert.instanceOf(err, Error)
          assert.equal(err.message, "Socket is blocked by async operation (e.g. bind/unbind)")
          assert.equal(err.code, "EBUSY")
          assert.typeOf(err.errno, "number")
        }
        await promise
      })
    })

    describe("unbind", function() {
      it("should resolve", async function() {
        const address = uniqAddress(proto)
        await this.sock.bind(address)
        await this.sock.unbind(address)
        assert.ok(true)
      })

      it("should throw error for invalid uri", async function() {
        try {
          await this.sock.unbind("foo-bar")
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
          await this.sock.unbind("foo://bar")
          assert.ok(false)
        } catch (err) {
          assert.instanceOf(err, Error)
          assert.equal(err.message, "Protocol not supported")
          assert.equal(err.code, "EPROTONOSUPPORT")
          assert.equal(err.errno, process.platform == "linux" ? 93 : 43)
          assert.equal(err.address, "foo://bar")
        }
      })

      it("should fail during other unbind", async function() {
        let promise
        const address = uniqAddress(proto)
        await this.sock.bind(address)
        try {
          promise = this.sock.unbind(address)
          await this.sock.unbind(address)
          assert.ok(false)
        } catch (err) {
          assert.instanceOf(err, Error)
          assert.equal(err.message, "Socket is blocked by async operation (e.g. bind/unbind)")
          assert.equal(err.code, "EBUSY")
          assert.typeOf(err.errno, "number")
        }
        await promise
      })
    })
  })
}
