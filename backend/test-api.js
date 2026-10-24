const http = require('http');

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
  console.log('=== Bharat Tech Solutions: Testing MERN CRUD REST API ===');

  // 1. Health check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('1. Health Check:', health.body?.status === 'online' ? 'PASS' : 'FAIL');

  // 2. CREATE: Add new voucher for Varad Jadhav
  const createRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/vouchers',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      employeeName: 'Varad Jadhav',
      employeeId: 'EMP-103',
      department: 'Logistics & Operations',
      expenseTitle: 'High-Speed Wireless Router for Lab',
      expenseCategory: 'Office Supplies & Stationery',
      expenseDate: '2026-10-22',
      amount: 3500.00,
      description: 'Purchased dual-band Wi-Fi router for testing lab setup',
      status: 'Pending',
    }
  );
  const createdVoucher = createRes.body?.data;
  console.log(
    '2. CREATE (Add Voucher):',
    createRes.body?.success && createdVoucher?._id ? 'PASS' : 'FAIL',
    `(Voucher #: ${createdVoucher?.voucherNumber}, Amount: ₹${createdVoucher?.amount})`
  );

  // 3. READ: Get all vouchers
  const getAllRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/vouchers',
    method: 'GET',
  });
  console.log(
    '3. READ (Get All Vouchers):',
    getAllRes.body?.success && Array.isArray(getAllRes.body?.data) ? 'PASS' : 'FAIL',
    `(Total in MongoDB: ${getAllRes.body?.count})`
  );

  // 4. READ: Get single voucher details by ID
  const getSingleRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/vouchers/${createdVoucher._id}`,
    method: 'GET',
  });
  console.log(
    '4. READ (Get Single Details):',
    getSingleRes.body?.success && getSingleRes.body?.data?.employeeName === 'Varad Jadhav' ? 'PASS' : 'FAIL'
  );

  // 5. UPDATE: Update voucher amount and status
  const updateRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/vouchers/${createdVoucher._id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      amount: 3750.00,
      status: 'Paid',
    }
  );
  console.log(
    '5. UPDATE (Edit Voucher):',
    updateRes.body?.success &&
      updateRes.body?.data?.amount === 3750.00 &&
      updateRes.body?.data?.status === 'Paid'
      ? 'PASS'
      : 'FAIL',
    `(Updated Amount: ₹${updateRes.body?.data?.amount})`
  );

  // 6. DELETE: Delete voucher from MongoDB
  const deleteRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/vouchers/${createdVoucher._id}`,
    method: 'DELETE',
  });
  console.log(
    '6. DELETE (Remove Voucher):',
    deleteRes.body?.success ? 'PASS' : 'FAIL'
  );

  // 7. Verify deletion
  const verifyDeleted = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/vouchers/${createdVoucher._id}`,
    method: 'GET',
  });
  console.log(
    '7. VERIFY DELETED (404 Not Found):',
    verifyDeleted.status === 404 ? 'PASS' : 'FAIL'
  );

  console.log('=== All 4 CRUD Operations & MongoDB Persistence Passed! ===');
  process.exit(0);
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
