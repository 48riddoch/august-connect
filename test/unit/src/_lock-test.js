let test = require('tape')
let proxyquire = require('proxyquire')

let session = callback => (callback(null, {headers:{}}))
let lockData = {
  body: {foo: 'bar'},
  headers: {foo: 'bar'}
}
let locks = callback => (callback(null, lockData))
let params
let tiny = {
  put: (p, callback) => {
    params = p
    callback(null, {body:'foo'})
  }
}
let lock = proxyquire('../../../src/_lock', {
  './util/session': session,
  './_locks': locks,
  'tiny-json-http': tiny
})

test('Returns a Promise or uses continuation passing', t => {
  t.plan(5)
  let isPromise = lock() instanceof Promise
  t.ok(isPromise, 'Promise returned (without params)')
  isPromise = lock('foo') instanceof Promise
  t.ok(isPromise, 'Promise returned (with params)')
  lock(() => (t.pass('Executed callback (without params)')))
  lock(null, () => (t.pass('Executed callback (null params)')))
  lock('foo', () => (t.pass('Executed callback (with params)')))
})

test('Calls August endpoint with correct params (passed lockID)', t => {
  t.plan(3)
  lock('myLockID', (err, result) => {
    if (err) t.fail(err)
    t.equal(params.url, 'https://api-production.august.com/remoteoperate/myLockID/lock', 'Valid August endpoint')
    t.equal(params.headers['Content-Length'], 0, 'Appended zero content-length to request headers')
    t.ok(result, 'Returned result')
  })
})

test('Fails when no lockID is passed and multiple locks are returned by the API', t => {
  t.plan(1)
  lockData.body['baz'] = 'buz'
  lock(null, (err) => {
    delete lockData.body['baz']
    t.ok(err, `Error returned: ${err}`)
  })
})

test('Calls August endpoint with correct params (no lockID passed)', t => {
  t.plan(3)
  lock(null, (err, result) => {
    if (err) t.fail(err)
    t.equal(params.url, 'https://api-production.august.com/remoteoperate/foo/lock', 'Valid August endpoint')
    t.equal(params.headers['Content-Length'], 0, 'Appended zero content-length to request headers')
    t.ok(result, 'Returned result')
  })
})
