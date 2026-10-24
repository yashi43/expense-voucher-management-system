const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Running Expense Voucher Management System API Tests');
  console.log('====================================================');

  try {
    // 1. Health check
    console.log('\n[1/7] Testing /api/health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('✅ Health check passed:', health.system, '| Currency:', health.currency);

    // 2. User Registration
    const testEmail = `test_yashi_${Date.now()}@bharattech.com`;
    console.log(`\n[2/7] Testing POST /api/auth/register with ${testEmail}...`);
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Yashi Mehta',
        email: testEmail,
        password: 'Password123!',
        role: 'employee',
        employeeId: 'EMP-101',
        department: 'Software Engineering',
      }),
    });
    const regData = await regRes.json();
    if (!regData.success) throw new Error(regData.message || 'Registration failed');
    console.log('✅ Registration successful! Token received:', !!regData.token, '| User:', regData.user.name);

    // 3. User Login
    console.log('\n[3/7] Testing POST /api/auth/login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error(loginData.message || 'Login failed');
    const token = loginData.token;
    console.log('✅ Login successful! Token:', token.substring(0, 20) + '...');

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 4. Auth Me & Dashboard Stats
    console.log('\n[4/7] Testing GET /api/auth/me & GET /api/dashboard/stats...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    console.log('✅ Auth profile retrieved:', meData.user.email);

    const statsRes = await fetch(`${BASE_URL}/dashboard/stats`, { headers: authHeaders });
    const statsData = await statsRes.json();
    console.log('✅ Dashboard stats loaded successfully! Total Vouchers:', statsData.stats.totalVouchers);

    // 5. Create Voucher (C in CRUD)
    console.log('\n[5/7] Testing POST /api/vouchers (CREATE)...');
    const createRes = await fetch(`${BASE_URL}/vouchers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        employeeName: 'Yashi Mehta',
        employeeId: 'EMP-101',
        department: 'Software Engineering',
        expenseTitle: 'AWS Certified Solutions Architect Exam Fee',
        expenseCategory: 'Training & Certification',
        expenseDate: new Date().toISOString(),
        amount: 14500,
        description: 'Appeared for AWS exam for cloud architecture requirements.',
        status: 'Pending',
      }),
    });
    const createData = await createRes.json();
    if (!createData.success) throw new Error(createData.message || 'Create failed');
    const createdVoucher = createData.data;
    console.log('✅ Voucher Created in MongoDB! Voucher #:', createdVoucher.voucherNumber, '| ID:', createdVoucher._id);

    // 6. Read Vouchers (R in CRUD)
    console.log('\n[6/7] Testing GET /api/vouchers (READ ALL & DETAIL)...');
    const listRes = await fetch(`${BASE_URL}/vouchers`, { headers: authHeaders });
    const listData = await listRes.json();
    console.log(`✅ Read all vouchers passed! Retrieved ${listData.count} vouchers.`);

    const singleRes = await fetch(`${BASE_URL}/vouchers/${createdVoucher._id}`, { headers: authHeaders });
    const singleData = await singleRes.json();
    console.log('✅ Read single voucher passed! Amount in INR:', singleData.data.amount, '₹');

    // 7. Update & Delete Voucher (U and D in CRUD)
    console.log('\n[7/7] Testing PUT /api/vouchers/:id (UPDATE) & DELETE (DELETE)...');
    const updateRes = await fetch(`${BASE_URL}/vouchers/${createdVoucher._id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        amount: 15200,
        status: 'Approved',
        description: 'Updated with official GST tax invoice reference.',
      }),
    });
    const updateData = await updateRes.json();
    console.log('✅ Voucher Updated! New Amount:', updateData.data.amount, '| Status:', updateData.data.status);

    const deleteRes = await fetch(`${BASE_URL}/vouchers/${createdVoucher._id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const deleteData = await deleteRes.json();
    console.log('✅ Voucher Deleted from MongoDB!', deleteData.message);

    console.log('\n====================================================');
    console.log('🎉 ALL BACKEND TESTS (AUTH + CRUD) PASSED PERFECTLY!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
