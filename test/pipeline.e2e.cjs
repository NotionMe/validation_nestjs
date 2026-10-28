const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createApp } = require('../dist/main');
const { TrimPipe } = require('../dist/common/pipes/trim.pipe');

test('TrimPipe рекурсивно очищає об’єкти та масиви', () => {
  const input = { name: '  Борщ  ', nested: { values: [' x ', 0, false, null] } };
  const result = new TrimPipe().transform(input);
  assert.deepEqual(result, { name: 'Борщ', nested: { values: ['x', 0, false, null] } });
  assert.equal(input.name, '  Борщ  ');
});

test('Request Pipeline: варіант 4', async (t) => {
  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const baseUrl = await app.getUrl();
  const valid = {
    title: '   Борщ український   ', price: 125.5,
    weightGrams: 350, calories: 180, isSpicy: false,
  };
  let id;

  async function request(method, path, body) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      status: response.status,
      headers: response.headers,
      body: response.status === 204 ? null : await response.json(),
    };
  }

  function checkError(result, statusCode, path, method) {
    assert.equal(result.status, statusCode);
    assert.equal(result.body.success, false);
    assert.equal(result.body.statusCode, statusCode);
    assert.equal(result.body.path, path);
    assert.equal(result.body.method, method);
    assert.equal(typeof result.body.error, 'string');
    assert.ok(Number.isFinite(Date.parse(result.body.timestamp)));
    assert.ok(result.body.message);
  }

  await t.test('1: POST → 201, trim і X-Response-Time', async () => {
    const result = await request('POST', '/dishes', valid);
    assert.equal(result.status, 201);
    assert.equal(result.body.title, 'Борщ український');
    assert.equal(result.body.isSpicy, false);
    assert.match(result.headers.get('x-response-time'), /^\d+(\.\d+)?ms$/);
    id = result.body.id;
    assert.ok(Number.isInteger(id));
  });

  await t.test('2: невідоме поле → 400, масив порушень', async () => {
    const result = await request('POST', '/dishes', { ...valid, hackerField: 'malicious' });
    checkError(result, 400, '/dishes', 'POST');
    assert.ok(Array.isArray(result.body.message));
    assert.ok(result.body.message.includes('property hackerField should not exist'));
  });

  await t.test('3: рядок замість числа → 400 у GlobalExceptionFilter', async () => {
    const result = await request('POST', '/dishes', { ...valid, price: '125.5' });
    checkError(result, 400, '/dishes', 'POST');
    assert.ok(result.body.message.some((message) => message.includes('price')));
  });

  await t.test('4: query limit=5 → число 5', async () => {
    const result = await request('GET', '/dishes?limit=5');
    assert.equal(result.status, 200);
    assert.equal(result.body.limit, 5);
    assert.equal(result.body.total, 1);
    assert.ok(result.body.items.length <= 5);
  });

  await t.test('5: усі обмеження варіанта 4', async () => {
    for (const [field, value] of [
      ['title', '   '], ['title', 123], ['price', -1], ['price', 0],
      ['weightGrams', 9], ['calories', -1], ['isSpicy', 'false'],
    ]) {
      const result = await request('POST', '/dishes', { ...valid, [field]: value });
      checkError(result, 400, '/dishes', 'POST');
      assert.ok(result.body.message.some((message) => message.includes(field)));
    }
    const missing = await request('POST', '/dishes', {});
    checkError(missing, 400, '/dishes', 'POST');
  });

  await t.test('6: граничні значення → 201', async () => {
    const result = await request('POST', '/dishes', {
      ...valid, price: 0.01, weightGrams: 10, calories: 0, isSpicy: true,
    });
    assert.equal(result.status, 201);
  });

  await t.test('7: PATCH перевіряє лише передані поля', async () => {
    const result = await request('PATCH', `/dishes/${id}`, { title: '  Суп  ' });
    assert.equal(result.status, 200);
    assert.equal(result.body.title, 'Суп');
    assert.equal(result.body.price, valid.price);
    for (const body of [{ price: -1 }, { title: null }, { hackerField: true }]) {
      checkError(await request('PATCH', `/dishes/${id}`, body), 400, `/dishes/${id}`, 'PATCH');
    }
  });

  await t.test('8: query перевіряється, типове limit=10', async () => {
    assert.equal((await request('GET', '/dishes')).body.limit, 10);
    for (const query of ['limit=abc', 'limit=0', 'limit=101', 'limit=1.5', 'extra=1']) {
      const path = `/dishes?${query}`;
      checkError(await request('GET', path), 400, path, 'GET');
    }
  });

  await t.test('9: помилки 400 та 404 мають спільний формат', async () => {
    checkError(await request('GET', '/dishes/abc'), 400, '/dishes/abc', 'GET');
    checkError(await request('GET', '/dishes/999999'), 404, '/dishes/999999', 'GET');
    checkError(await request('GET', '/missing'), 404, '/missing', 'GET');
  });

  await t.test('10: DELETE → 204, повторний GET → 404', async () => {
    const result = await request('DELETE', `/dishes/${id}`);
    assert.equal(result.status, 204);
    assert.match(result.headers.get('x-response-time'), /^\d+(\.\d+)?ms$/);
    checkError(await request('GET', `/dishes/${id}`), 404, `/dishes/${id}`, 'GET');
  });
});
