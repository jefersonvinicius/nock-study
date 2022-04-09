const http = require('http');
const faker = require('@faker-js/faker').default;

const server = http.createServer(async (request, response) => {
  const [, queryString] = request.url.split('?');
  const headers = request.headers;
  const body = await parseBody(request);
  const query = parseURLParams(queryString);
  console.log('');
  console.log(`${request.method} ${request.url} -- ${new Date().toISOString()}`);
  console.log('QUERY');
  console.log(stringify(query));
  console.log('HEADERS:');
  console.log(stringify(headers));
  console.log('BODY:');
  console.log(stringify(body));

  const data = generateRandomResponseData();
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(data));
});

function generateRandomResponseData() {
  const items = Array.from({ length: faker.datatype.number({ min: 10, max: 100 }) }).map(() => {
    const username = faker.internet.userName();
    return {
      username,
      email: faker.internet.email(username),
      creditCard: faker.finance.creditCardNumber(),
    };
  });

  return {
    items,
    total: items.length,
  };
}

async function parseBody(request) {
  const bodyBuffer = [];
  for await (const chunk of request) {
    bodyBuffer.push(chunk);
  }
  const bodyString = Buffer.concat(bodyBuffer).toString();
  return bodyString ? JSON.parse(bodyString) : null;
}

function parseURLParams(queryString) {
  const urlSearchParams = new URLSearchParams(queryString);
  const keys = Array.from(urlSearchParams.keys());
  return keys.reduce((prev, key) => ({ ...prev, [key]: urlSearchParams.get(key) }), {});
}

function stringify(data) {
  return JSON.stringify(data, null, 4);
}

server.listen(3333, () => {
  console.log('Listening at http://localhost:3333');
});
