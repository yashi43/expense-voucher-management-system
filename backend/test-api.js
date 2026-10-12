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
  console.log('=== Starting End-to-End API Test Suite ===');

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
  const empToken = empLogin.body?.token;

  // 3. Director Login
  const dirLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'director@abc.com', password: 'Password123!' }
  );
  console.log('3. Director Login:', dirLogin.body?.success ? 'PASS' : 'FAIL');
  const dirToken = dirLogin.body?.token;

  // 4. Accounts Login
  const accLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'accounts@abc.com', password: 'Password123!' }
  );
  console.log('4. Accounts Login:', accLogin.body?.success ? 'PASS' : 'FAIL');
  const accToken = accLogin.body?.token;

  // 5. Create Draft Voucher
  const newVoucher = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/vouchers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
    },
    {
      department: 'Engineering',
      expenseTitle: 'Dev Server RAM Upgrade',
      expenseDate: '2026-10-10',
      expenseCategory: 'Software & Tools',
      amount: 199.99,
      expenseDescription: 'Added 64GB DDR5 memory to local test server',
      employeeSignature: '/uploads/signatures/employee-sample.svg',
    }
  );
  console.log(
    '5. Create Draft Voucher:',
    newVoucher.body?.success && newVoucher.body?.data?.status === 'Draft' ? 'PASS' : 'FAIL',
    `(Voucher #: ${newVoucher.body?.data?.voucherNumber})`
  );
  const createdVoucherId = newVoucher.body?.data?._id;

  // 6. Submit Voucher for Approval
  const submitRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/vouchers/${createdVoucherId}/submit`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${empToken}`,
    },
  });
  console.log(
    '6. Submit Voucher for Approval:',
    submitRes.body?.success && submitRes.body?.data?.status === 'Submitted' ? 'PASS' : 'FAIL'
  );

  // 7. Director Approves Voucher
  const approveRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/vouchers/${createdVoucherId}/approve`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dirToken}`,
      },
    },
    {
      directorSignature: '/uploads/signatures/director-sample.svg',
    }
  );
  console.log(
    '7. Director Approves Voucher:',
    approveRes.body?.success && approveRes.body?.data?.status === 'Approved' ? 'PASS' : 'FAIL'
  );

  // 8. Accounts Dashboard
  const accDash = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard/stats',
    method: 'GET',
    headers: { Authorization: `Bearer ${accToken}` },
  });
  console.log(
    '8. Accounts Dashboard Stats:',
    accDash.body?.success && accDash.body?.stats?.totalVouchers > 0 ? 'PASS' : 'FAIL'
  );

  console.log('=== All Core API Tests Completed ===');
  process.exit(0);
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
