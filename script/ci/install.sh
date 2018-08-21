#!/bin/sh
set -e

if [ -n "${WINDIR}" ]; then
  # Give preference to all MSYS64 binaries. This solves issues with mkdir and
  # other commands not working properly.
  export PATH="/usr/bin:${PATH}"
  export PYTHON="/c/Python27/python"
elif [ "$TRAVIS_OS_NAME" = "osx" ]; then
  # MacOS still needs a few things to be installed.
  brew update && brew install yarn coreutils
  alias timeout=gtimeout

  if [ -n "${ZMQ_SHARED}" ]; then
    brew install zeromq
  fi
fi

echo "Installing dependencies..."

if [ -n "${ALPINE_CHROOT}" ]; then
  sudo script/ci/alpine-chroot-install.sh -b v3.8 -p 'nodejs-dev yarn build-base git curl python2' -k 'CI TRAVIS_.* ZMQ_.* NODE_.* npm_.*'
fi

if [ -n "${ZMQ_SHARED}" ]; then
  export npm_config_zmq_shared=true
fi

export npm_config_build_from_source=true

if [ -n "${ALPINE_CHROOT}" ]; then
  /alpine/enter-chroot yarn global add node-gyp
  /alpine/enter-chroot yarn install
else
  yarn install
fi
