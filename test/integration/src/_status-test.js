let test = require('tape')
let status = require('../../../src/_status')
let isCI = process.env.CI
// eslint-disable-next-line
if (!isCI) require('dotenv').config()

test('Get lock status', async t => {
  t.plan(1)
  let lock = await status()
  console.log(lock)
  t.ok(lock.status, `Got lock status: ${lock.status}`)
})
