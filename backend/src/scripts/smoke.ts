const baseUrl = process.env.SMOKE_API_URL || 'http://127.0.0.1:5010/api/v1';

interface RequestOptions {
  token?: string;
  cookie?: string;
  body?: unknown;
  expected?: number | number[];
}

interface ApiResult<T = Record<string, unknown>> {
  status: number;
  body: T;
  cookie?: string;
}

let assertions = 0;

const check = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
  assertions += 1;
};

async function api<T = Record<string, unknown>>(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.cookie) headers.Cookie = options.cookie;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const raw = await response.text();
  const body = raw ? JSON.parse(raw) as T : {} as T;
  const expected = Array.isArray(options.expected) ? options.expected : [options.expected ?? 200];
  if (!expected.includes(response.status)) {
    throw new Error(`${method} ${path} returned ${response.status}: ${raw}`);
  }
  const setCookie = response.headers.get('set-cookie');
  return {
    status: response.status,
    body,
    cookie: setCookie?.split(';')[0],
  };
}

type Envelope<T> = { success: boolean; message?: string; data: T };
type IdRecord = { _id: string; [key: string]: unknown };

async function login(username: string, password: string) {
  const result = await api<Envelope<{ accessToken: string; user: IdRecord }>>('POST', '/auth/login', {
    body: { username, password },
  });
  check(result.body.success, `${username} login succeeds`);
  check(Boolean(result.cookie), `${username} receives refresh cookie`);
  return { token: result.body.data.accessToken, cookie: result.cookie!, user: result.body.data.user };
}

async function main() {
  const unique = Date.now().toString(36);
  const health = await api<Envelope<{ status: string }>>('GET', '/health');
  check(health.body.data.status === 'healthy', 'health endpoint reports healthy');
  await api('POST', '/auth/login', { body: { username: 'admin', password: 'wrong-password' }, expected: 401 });

  const admin = await login('admin', 'admin123');
  const cashier = await login('cashier', 'cashier123');
  const user = await login('user', 'user123');

  const refreshed = await api<Envelope<{ accessToken: string }>>('POST', '/auth/refresh', { cookie: admin.cookie });
  check(Boolean(refreshed.body.data.accessToken), 'refresh cookie issues a new access token');
  await api('POST', '/categories', { token: user.token, body: { name: `Forbidden ${unique}` }, expected: 403 });
  await api('POST', '/suppliers', { token: cashier.token, body: { name: `Forbidden ${unique}` }, expected: 403 });

  const category = (await api<Envelope<IdRecord>>('POST', '/categories', {
    token: admin.token,
    body: { name: `Smoke Category ${unique}`, description: 'CRUD verification' },
    expected: 201,
  })).body.data;
  const updatedCategory = (await api<Envelope<IdRecord>>('PUT', `/categories/${category._id}`, {
    token: admin.token,
    body: { description: 'Updated CRUD verification' },
  })).body.data;
  check(updatedCategory.description === 'Updated CRUD verification', 'category update persists');

  const size = (await api<Envelope<IdRecord>>('POST', '/sizes', {
    token: admin.token,
    body: { name: `T${unique.slice(-5)}`, description: 'Smoke size', sortOrder: 999 },
    expected: 201,
  })).body.data;
  const color = (await api<Envelope<IdRecord>>('POST', '/colors', {
    token: admin.token,
    body: { name: `Smoke Color ${unique}`, hexCode: '#123ABC' },
    expected: 201,
  })).body.data;
  const customer = (await api<Envelope<IdRecord>>('POST', '/customers', {
    token: cashier.token,
    body: { name: `Smoke Customer ${unique}`, email: `smoke.${unique}@example.com` },
    expected: 201,
  })).body.data;
  const supplier = (await api<Envelope<IdRecord>>('POST', '/suppliers', {
    token: admin.token,
    body: { name: `Smoke Supplier ${unique}`, email: `supplier.${unique}@example.com` },
    expected: 201,
  })).body.data;

  const employeeUsername = `smoke_${unique}`.slice(0, 30);
  const employee = (await api<Envelope<IdRecord>>('POST', '/users', {
    token: admin.token,
    body: {
      name: 'Smoke Employee',
      username: employeeUsername,
      email: `${employeeUsername}@example.com`,
      password: 'SmokePass123!',
      role: 'user',
    },
    expected: 201,
  })).body.data;
  const employeeSession = await login(employeeUsername, 'SmokePass123!');
  await api('POST', '/auth/change-password', {
    token: employeeSession.token,
    body: { currentPassword: 'SmokePass123!', newPassword: 'SmokePass456!', confirmPassword: 'SmokePass456!' },
  });
  await login(employeeUsername, 'SmokePass456!');
  await api('PATCH', '/auth/me', { token: employeeSession.token, body: { phone: '+855 10 000 001' } });

  const product = (await api<Envelope<IdRecord>>('POST', '/products', {
    token: admin.token,
    body: {
      name: `Smoke Product ${unique}`,
      brand: 'Smoke Brand',
      category: category._id,
      images: [],
      variants: [{
        size: size._id,
        color: color._id,
        sku: `SMK-${unique}`.toUpperCase(),
        costPrice: 10,
        salePrice: 20,
        quantity: 4,
        lowStockLevel: 1,
      }],
    },
    expected: 201,
  })).body.data;
  check(Array.isArray(product.variants) && (product.variants as unknown[]).length === 1, 'product and variant create atomically');
  await api('DELETE', `/categories/${category._id}`, { token: admin.token, expected: 409 });
  await api('PUT', `/products/${product._id}`, { token: admin.token, body: { brand: 'Updated Smoke Brand' } });
  await api('DELETE', `/products/${product._id}`, { token: admin.token });
  await api('DELETE', `/categories/${category._id}`, { token: admin.token });
  await api('DELETE', `/sizes/${size._id}`, { token: admin.token });
  await api('DELETE', `/colors/${color._id}`, { token: admin.token });

  const products = (await api<Envelope<Array<IdRecord>>>('GET', '/products?status=active', { token: cashier.token })).body.data;
  const seedProduct = products.find((item) => Array.isArray(item.variants) && (item.variants as unknown[]).length > 0)!;
  const variant = (seedProduct.variants as Array<IdRecord & { quantity: number }>)[0];
  const initialStock = variant.quantity;

  await api('POST', '/inventory/adjustments', {
    token: admin.token,
    body: { variantId: variant._id, change: 2, type: 'ADJUSTMENT', reason: 'Smoke recount increase' },
    expected: 201,
  });
  const adjustedInventory = (await api<Envelope<Array<IdRecord & { quantity: number }>>>('GET', '/inventory', { token: admin.token })).body.data;
  check(adjustedInventory.find((item) => item._id === variant._id)?.quantity === initialStock + 2, 'positive stock adjustment persists');
  await api('POST', '/inventory/adjustments', {
    token: admin.token,
    body: { variantId: variant._id, change: -2, type: 'ADJUSTMENT', reason: 'Smoke recount restore' },
    expected: 201,
  });
  await api('POST', '/inventory/adjustments', {
    token: admin.token,
    body: { variantId: variant._id, change: -(initialStock + 1000), type: 'LOST', reason: 'Must not go negative' },
    expected: 409,
  });

  const sale = (await api<Envelope<IdRecord & { grandTotal: number }>>('POST', '/sales', {
    token: cashier.token,
    body: { items: [{ variantId: variant._id, quantity: 1 }], customerId: customer._id, discount: 0, paymentMethod: 'cash', amountReceived: 1000 },
    expected: 201,
  })).body.data;
  const afterSale = (await api<Envelope<Array<IdRecord & { quantity: number }>>>('GET', '/inventory', { token: cashier.token })).body.data;
  check(afterSale.find((item) => item._id === variant._id)?.quantity === initialStock - 1, 'sale decrements stock once');
  await api('POST', '/sales', {
    token: cashier.token,
    body: { items: [{ variantId: variant._id, quantity: initialStock + 1000 }], paymentMethod: 'cash' },
    expected: 409,
  });
  await api('PATCH', `/sales/${sale._id}/cancel`, { token: cashier.token, expected: 403 });
  await api('PATCH', `/sales/${sale._id}/cancel`, { token: admin.token });
  await api('PATCH', `/sales/${sale._id}/cancel`, { token: admin.token, expected: 409 });
  const afterCancel = (await api<Envelope<Array<IdRecord & { quantity: number }>>>('GET', '/inventory', { token: admin.token })).body.data;
  check(afterCancel.find((item) => item._id === variant._id)?.quantity === initialStock, 'sale cancellation restores stock exactly once');

  const purchase = (await api<Envelope<IdRecord>>('POST', '/purchases', {
    token: admin.token,
    body: { supplierId: supplier._id, items: [{ variantId: variant._id, quantity: 3, costPrice: 9 }], status: 'ordered', discount: 1 },
    expected: 201,
  })).body.data;
  await api('PATCH', `/purchases/${purchase._id}/receive`, { token: admin.token });
  await api('PATCH', `/purchases/${purchase._id}/receive`, { token: admin.token, expected: 409 });
  await api('DELETE', `/purchases/${purchase._id}`, { token: admin.token, expected: 409 });
  const afterPurchase = (await api<Envelope<Array<IdRecord & { quantity: number }>>>('GET', '/inventory', { token: admin.token })).body.data;
  check(afterPurchase.find((item) => item._id === variant._id)?.quantity === initialStock + 3, 'receiving purchase increments stock once');

  const settings = (await api<Envelope<IdRecord & { storeName: string; currency: string; taxRate: number; receiptNote?: string }>>('GET', '/settings', { token: cashier.token })).body.data;
  const updatedSettings = (await api<Envelope<IdRecord & { taxRate: number }>>('PUT', '/settings', {
    token: admin.token,
    body: { storeName: settings.storeName, currency: settings.currency, taxRate: 7.5, receiptNote: settings.receiptNote || '' },
  })).body.data;
  check(updatedSettings.taxRate === 7.5, 'store tax setting persists');
  await api('PUT', '/settings', {
    token: admin.token,
    body: { storeName: settings.storeName, currency: settings.currency, taxRate: settings.taxRate, receiptNote: settings.receiptNote || '' },
  });

  for (const path of ['/dashboard/stats', '/payments', '/audit-logs', '/reports/sales', '/reports/profit', '/reports/purchases', '/reports/inventory', '/reports/top-products']) {
    const result = await api('GET', path, { token: admin.token });
    check((result.body as { success?: boolean }).success, `${path} returns a successful data envelope`);
  }
  const history = await api<Envelope<unknown[]>>('GET', '/inventory/history', { token: admin.token });
  check(history.body.data.length >= 4, 'inventory ledger records adjustments, sale, return, and purchase');

  await api('DELETE', `/customers/${customer._id}`, { token: admin.token, expected: 409 });
  await api('DELETE', `/suppliers/${supplier._id}`, { token: admin.token, expected: 409 });
  await api('DELETE', `/users/${employee._id}`, { token: admin.token });
  await api('POST', '/auth/logout', { token: admin.token, cookie: admin.cookie });

  console.log(`Smoke verification passed with ${assertions} assertions.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
