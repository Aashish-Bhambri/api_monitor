import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('====================================================');
    console.log('🚀 STARTING COMPREHENSIVE API TEST SUITE');
    console.log('====================================================\n');

    let passedTests = 0;
    let totalTests = 0;

    function assert(condition, message) {
        totalTests++;
        if (condition) {
            console.log(`✅ [PASS] ${message}`);
            passedTests++;
        } else {
            console.error(`❌ [FAIL] ${message}`);
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    const timestamp = Date.now();
    const user1Email = `user1_${timestamp}@example.com`;
    const user2Email = `user2_${timestamp}@example.com`;
    const password = 'Password123!';

    // ─── AUTHENTICATION ─────────────────────────────────────────────
    console.log('--- Phase 1: Authentication ---');
    
    // Register User 1
    const reg1 = await axios.post(`${BASE_URL}/auth/signup`, { email: user1Email, password });
    assert(reg1.status === 201, 'User 1 registered');

    // Login User 1
    const log1 = await axios.post(`${BASE_URL}/auth/login`, { email: user1Email, password });
    assert(log1.data.token, 'User 1 logged in & received JWT');
    const token1 = log1.data.token;
    const authHeader1 = { headers: { Authorization: `Bearer ${token1}` } };

    // Register User 2
    const reg2 = await axios.post(`${BASE_URL}/auth/signup`, { email: user2Email, password });
    assert(reg2.status === 201, 'User 2 registered');

    // Login User 2
    const log2 = await axios.post(`${BASE_URL}/auth/login`, { email: user2Email, password });
    assert(log2.data.token, 'User 2 logged in & received JWT');
    const token2 = log2.data.token;
    const authHeader2 = { headers: { Authorization: `Bearer ${token2}` } };

    console.log('');

    // ─── PROJECT APIS ───────────────────────────────────────────────
    console.log('--- Phase 2: Project APIs & Cross-User Security ---');

    // 1. Create a project (User 1)
    const createProjRes = await axios.post(
        `${BASE_URL}/projects`,
        { name: 'Core API Service', description: 'Main backend production APIs' },
        authHeader1
    );
    assert(createProjRes.status === 201, 'POST /api/projects: Project created successfully');
    const projectId = createProjRes.data.project.id;
    assert(projectId, `Project created with ID: ${projectId}`);

    // 2. Fetch all projects (User 1)
    const getProjectsRes = await axios.get(`${BASE_URL}/projects`, authHeader1);
    assert(getProjectsRes.status === 200, 'GET /api/projects: Fetched projects');
    const foundInList = getProjectsRes.data.projects.some(p => p.id === projectId);
    assert(foundInList, 'Created project is present in User 1 project list');

    // 3. Fetch project by ID (User 1)
    const getSingleProjRes = await axios.get(`${BASE_URL}/projects/${projectId}`, authHeader1);
    assert(getSingleProjRes.status === 200, 'GET /api/projects/:id: Fetched project by ID');
    assert(getSingleProjRes.data.project.name === 'Core API Service', 'Project name matches');

    // 4. Update a project (User 1)
    const updateProjRes = await axios.patch(
        `${BASE_URL}/projects/${projectId}`,
        { name: 'Updated Core API Service', description: 'Updated description' },
        authHeader1
    );
    assert(updateProjRes.status === 200, 'PATCH /api/projects/:id: Updated project successfully');
    assert(updateProjRes.data.project.name === 'Updated Core API Service', 'Updated project name reflected');

    // 5. Cross-User Security Check: User 2 CANNOT access User 1's project
    console.log('\n--- Verifying Cross-User Access Isolation ---');
    
    // User 2 tries to GET User 1's project by ID -> 404
    try {
        await axios.get(`${BASE_URL}/projects/${projectId}`, authHeader2);
        assert(false, 'User 2 should NOT be able to fetch User 1 project');
    } catch (err) {
        assert(err.response?.status === 404, 'User 2 GET User 1 project returns 404 Not Found');
    }

    // User 2 tries to UPDATE User 1's project -> 404
    try {
        await axios.patch(`${BASE_URL}/projects/${projectId}`, { name: 'Hacked by User 2' }, authHeader2);
        assert(false, 'User 2 should NOT be able to update User 1 project');
    } catch (err) {
        assert(err.response?.status === 404, 'User 2 PATCH User 1 project returns 404 Not Found');
    }

    // User 2 tries to DELETE User 1's project -> 404
    try {
        await axios.delete(`${BASE_URL}/projects/${projectId}`, authHeader2);
        assert(false, 'User 2 should NOT be able to delete User 1 project');
    } catch (err) {
        assert(err.response?.status === 404, 'User 2 DELETE User 1 project returns 404 Not Found');
    }

    // User 2 fetches all projects -> must NOT contain User 1's project
    const user2ProjectsRes = await axios.get(`${BASE_URL}/projects`, authHeader2);
    const leaked = user2ProjectsRes.data.projects.some(p => p.id === projectId);
    assert(!leaked, 'User 2 project list does NOT leak User 1 project');

    // 6. Delete a project (User 1)
    const deleteProjRes = await axios.delete(`${BASE_URL}/projects/${projectId}`, authHeader1);
    assert(deleteProjRes.status === 200, 'DELETE /api/projects/:id: Deleted project successfully');

    // Confirm it is gone
    try {
        await axios.get(`${BASE_URL}/projects/${projectId}`, authHeader1);
        assert(false, 'Project should not exist after deletion');
    } catch (err) {
        assert(err.response?.status === 404, 'GET deleted project returns 404 Not Found');
    }

    console.log('\n--- Phase 3: Complete Monitor CRUD APIs ---');

    // Create a new project for monitor testing
    const mProjectRes = await axios.post(
        `${BASE_URL}/projects`,
        { name: 'Monitoring Test Project', description: 'For API health checks' },
        authHeader1
    );
    const mProjectId = mProjectRes.data.project.id;
    assert(mProjectId, 'Created project for Monitor CRUD testing');

    // 1. User 2 tries to create a monitor on User 1's project -> 404
    try {
        await axios.post(
            `${BASE_URL}/monitors`,
            { projectId: mProjectId, url: 'https://httpbin.org/status/200', method: 'GET' },
            authHeader2
        );
        assert(false, 'User 2 should NOT be allowed to add monitor to User 1 project');
    } catch (err) {
        assert(err.response?.status === 404, 'POST /api/monitors on foreign project returns 404');
    }

    // 2. POST /api/monitors (Create Monitor by User 1)
    const createMonRes = await axios.post(
        `${BASE_URL}/monitors`,
        {
            projectId: mProjectId,
            url: 'https://httpbin.org/status/200',
            method: 'GET',
            interval: 30
        },
        authHeader1
    );
    assert(createMonRes.status === 201, 'POST /api/monitors: Monitor created successfully');
    const monitorId = createMonRes.data.monitor.id;
    assert(monitorId, `Created monitor with ID: ${monitorId}`);
    assert(createMonRes.data.monitor.url === 'https://httpbin.org/status/200', 'Monitor URL stored accurately');

    // 3. GET /api/monitors (User 1)
    const getMonitorsRes = await axios.get(`${BASE_URL}/monitors`, authHeader1);
    assert(getMonitorsRes.status === 200, 'GET /api/monitors: Fetched user monitors');
    assert(getMonitorsRes.data.count >= 1, 'Monitor count >= 1 for User 1');
    const monitorInList = getMonitorsRes.data.monitors.some(m => m.id === monitorId);
    assert(monitorInList, 'Created monitor present in User 1 list');

    // GET /api/monitors (User 2) -> must be empty
    const user2MonitorsRes = await axios.get(`${BASE_URL}/monitors`, authHeader2);
    const user2Leaked = user2MonitorsRes.data.monitors.some(m => m.id === monitorId);
    assert(!user2Leaked, 'User 2 monitors list does NOT leak User 1 monitor');

    // 4. GET /api/monitors/:id (User 1)
    const getSingleMonRes = await axios.get(`${BASE_URL}/monitors/${monitorId}`, authHeader1);
    assert(getSingleMonRes.status === 200, 'GET /api/monitors/:id: Fetched monitor by ID');
    assert(getSingleMonRes.data.monitor.id === monitorId, 'Monitor ID matches');

    // User 2 tries to GET monitor by ID -> 404
    try {
        await axios.get(`${BASE_URL}/monitors/${monitorId}`, authHeader2);
        assert(false, 'User 2 should NOT be able to fetch User 1 monitor');
    } catch (err) {
        assert(err.response?.status === 404, 'User 2 GET User 1 monitor returns 404 Not Found');
    }

    // 5. PATCH /api/monitors/:id (User 1)
    const updateMonRes = await axios.patch(
        `${BASE_URL}/monitors/${monitorId}`,
        {
            url: 'https://httpbin.org/get',
            interval: 120,
            status: 'UP'
        },
        authHeader1
    );
    assert(updateMonRes.status === 200, 'PATCH /api/monitors/:id: Updated monitor');
    assert(updateMonRes.data.monitor.url === 'https://httpbin.org/get', 'Updated URL reflected');
    assert(updateMonRes.data.monitor.interval === 120, 'Updated interval reflected');

    // User 2 tries to PATCH User 1 monitor -> 404
    try {
        await axios.patch(`${BASE_URL}/monitors/${monitorId}`, { interval: 999 }, authHeader2);
        assert(false, 'User 2 should NOT be able to update User 1 monitor');
    } catch (err) {
        assert(err.response?.status === 404, 'User 2 PATCH User 1 monitor returns 404 Not Found');
    }

    // 6. POST /api/monitors/:id/test (Run Live Test)
    const testMonRes = await axios.post(`${BASE_URL}/monitors/${monitorId}/test`, {}, authHeader1);
    assert(testMonRes.status === 200, 'POST /api/monitors/:id/test: Executed live monitor ping');
    assert(testMonRes.data.testResult.statusCode === 200, 'Live test response was 200 OK');
    assert(testMonRes.data.testResult.responseTime > 0, `Recorded response time: ${testMonRes.data.testResult.responseTime}ms`);

    // 7. DELETE /api/monitors/:id
    // User 2 tries to delete -> 404
    try {
        await axios.delete(`${BASE_URL}/monitors/${monitorId}`, authHeader2);
        assert(false, 'User 2 should NOT be able to delete User 1 monitor');
    } catch (err) {
        assert(err.response?.status === 404, 'User 2 DELETE User 1 monitor returns 404 Not Found');
    }

    // User 1 deletes
    const deleteMonRes = await axios.delete(`${BASE_URL}/monitors/${monitorId}`, authHeader1);
    assert(deleteMonRes.status === 200, 'DELETE /api/monitors/:id: Monitor deleted successfully');

    // Confirm monitor is deleted
    try {
        await axios.get(`${BASE_URL}/monitors/${monitorId}`, authHeader1);
        assert(false, 'Monitor should not exist after deletion');
    } catch (err) {
        assert(err.response?.status === 404, 'GET deleted monitor returns 404 Not Found');
    }

    // Clean up project
    await axios.delete(`${BASE_URL}/projects/${mProjectId}`, authHeader1);

    console.log('\n====================================================');
    console.log(`🎉 ALL TESTS PASSED: ${passedTests}/${totalTests} tests successful!`);
    console.log('====================================================');
}

runTests().catch((err) => {
    console.error('Test execution failed:', err.message);
    if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
    }
    process.exit(1);
});
