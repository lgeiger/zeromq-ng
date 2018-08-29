suite.add(`deliver for await proto=${proto} msgsize=${msgsize} n=${n} zmq=ng`, Object.assign({
  fn: async deferred => {
    const server = new zmq.ng.Dealer
    const client = new zmq.ng.Dealer

    await server.bind(address)
    client.connect(address)

    gc()

    const send = async () => {
      for (let i = 0; i < n; i++) {
        await client.send(Buffer.alloc(msgsize))
      }
    }

    const receive = async () => {
      let i = 0
      for await (const [msg] of server) {
        if (++i == n) server.close()
      }
    }

    await Promise.all([send(), receive()])

    gc()

    server.close()
    client.close()

    gc()

    deferred.resolve()
  }
}, benchOptions))