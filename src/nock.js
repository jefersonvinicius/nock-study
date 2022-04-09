const assert = require('assert');
const { writeFileSync } = require('fs');
const axios = require('axios').default;
const nock = require('nock');

const BASE_URL = 'http://localhost:3333';

const server = axios.create({
  baseURL: BASE_URL,
});

async function run() {
  {
    // should match with path
    nock(BASE_URL).get('/test').reply(200, { message: 'any' });
    const response = await server.get('/test');
    assert.deepStrictEqual(response.data, { message: 'any' });
  }

  {
    // should match with path and query strings
    nock(BASE_URL).get('/test?param=1').reply(200, { message: 'any' });
    const response = await server.get('/test?param=1');
    assert.deepStrictEqual(response.data, { message: 'any' });
  }

  {
    // should match using regex
    nock(BASE_URL)
      .get(/\/test/)
      .reply(200, { message: 'any' });
    const response = await server.get('/test?param=1');
    assert.deepStrictEqual(response.data, { message: 'any' });
  }

  {
    // should match with body
    nock(BASE_URL).post('/test', { data: 1 }).reply(200, { message: 'any' });
    const response = await server.post('/test', { data: 1 });
    assert.deepStrictEqual(response.data, { message: 'any' });
  }

  {
    // should scope data be correct
    const scope = nock(BASE_URL).get('/test1').reply(200, { message: 'any' }).post('/test2').reply(200);
    assert.equal(scope.isDone(), false);
    assert.deepStrictEqual(scope.pendingMocks(), [
      'GET http://localhost:3333/test1',
      'POST http://localhost:3333/test2',
    ]);
    assert.deepStrictEqual(scope.activeMocks(), [
      'GET http://localhost:3333/test1',
      'POST http://localhost:3333/test2',
    ]);
    await server.get('/test1');
    assert.equal(scope.isDone(), false);
    assert.deepStrictEqual(scope.pendingMocks(), ['POST http://localhost:3333/test2']);
    assert.deepStrictEqual(scope.activeMocks(), ['POST http://localhost:3333/test2']);
    await server.post('/test2');
    assert.equal(scope.isDone(), true);
    assert.deepStrictEqual(scope.pendingMocks(), []);
    assert.deepStrictEqual(scope.activeMocks(), []);
  }

  {
    // should rec the result
    nock.recorder.rec({
      output_objects: true,
      logging: (content) => writeFileSync('./rec.json', JSON.stringify(content)),
      use_separator: false,
    });
    const response = await server.get('/');
  }
}

process.on('uncaughtException', (error) => {
  console.log(error.message);
});

run();
