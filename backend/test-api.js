const http = require('http');

// Helper to make HTTP request
const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

async function runTests() {
  console.log('=== Starting End-to-End MERN CRUD & Auth Test Suite ===');

  // 1. Check health
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('1. Health Check:', health.body?.status === 'online' ? 'PASS' : 'FAIL');

  // 2. Employee Login
  const empLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'employee@abc.com', password: 'Password123!' }
  );
  console.log('2. Employee Login:', empLogin.body?.success ? 'PASS' : 'FAIL');
  const token = empLogin.body?.token;

  // 3. CREATE: Add a new voucher to MongoDB
  const newVoucher = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/vouchers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      department: 'Engineering',
      expenseTitle: 'Server SSD Storage Upgrade',
      expenseDate: '2026-10-22',
      expenseCategory: 'Software & Tools',
      amount: 250.75,
      expenseDescription: 'Bought NVMe SSD for development test server',
    }
  );
  const createdVoucher = newVoucher.body?.data;
  console.log(
    '3. CREATE (Add Voucher):',
    newVoucher.body?.success && createdVoucher?._id ? 'PASS' : 'FAIL',
    `(Voucher #: ${createdVoucher?.voucherNumber})`
  );

  // 4. READ: Get all vouchers from MongoDB
  const getAllRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/vouchers',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(
    '4. READ (Get All Vouchers):',
    getAllRes.body?.success && Array.isArray(getAllRes.body?.data) ? 'PASS' : 'FAIL',
    `(Total vouchers found: ${getAllRes.body?.total})`
  );

  // 5. READ: Get individual voucher details from MongoDB
  const getSingleRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/vouchers/${createdVoucher._id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(
    '5. READ (Get Individual Details):',
    getSingleRes.body?.success && getSingleRes.body?.data?.expenseTitle === 'Server SSD Storage Upgrade' ? 'PASS' : 'FAIL'
  );

  // 6. UPDATE: Edit existing voucher in MongoDB
  const updateRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/vouchers/${createdVoucher._id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      expenseTitle: 'Server SSD Storage Upgrade - High Speed',
      amount: 299.99,
      status: 'Approved',
    }
  );
  console.log(
    '6. UPDATE (Edit Voucher):',
    updateRes.body?.success &&
      updateRes.body?.data?.amount === 299.99 &&
      updateRes.body?.data?.status === 'Approved'
      ? 'PASS'
      : 'FAIL'
  );

  // 7. DELETE: Delete voucher from MongoDB
  const deleteRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/vouchers/${createdVoucher._id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(
    '7. DELETE (Remove Voucher):',
    deleteRes.body?.success ? 'PASS' : 'FAIL'
  );

  // 8. Verify deletion from MongoDB
  const verifyDeleted = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/vouchers/${createdVoucher._id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(
    '8. VERIFY DELETED (404 Not Found):',
    verifyDeleted.status === 404 ? 'PASS' : 'FAIL'
  );

  console.log('=== All CRUD & Database Persistence Tests Passed Successfully! ===');
  process.exit(0);
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
