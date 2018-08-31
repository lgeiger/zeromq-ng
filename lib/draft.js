const {capability} = require(".")

if (!capability.draft) {
  throw new Error("ZeroMQ was built without draft API support.")
}

/* Socket types. */
class Server extends Socket {
  constructor(options) { super(12, options) }
}

class Client extends Socket {
  constructor(options) { super(13, options) }
}

class Radio extends Socket {
  constructor(options) { super(14, options) }
}

class Dish extends Socket {
  constructor(options) { super(15, options) }
}

class Gather extends Socket {
  constructor(options) { super(16, options) }
}

class Scatter extends Socket {
  constructor(options) { super(17, options) }
}

class Datagram extends Socket {
  constructor(options) { super(18, options) }
}

Object.assign(module.exports, {
  Server,
  Client,
  Radio,
  Dish,
  Gather,
  Scatter,
  Datagram,
})
