async function verifyGroupsAndUsers() {
    console.log('Verifying Groups and Users Management...');

    try {
        // 1. Login
        console.log('\n1. Logging in...');
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login: 'mbndiaye',
                password: 'SesameOubi+1959'
            })
        });

        if (!loginRes.ok) {
            console.error('❌ Login failed:', loginRes.status);
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✓ Login successful');

        // 2. Create a group
        console.log('\n2. Creating a group...');
        const groupRes = await fetch('http://localhost:3001/api/groupes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                LibelleGroupe: 'Test Groupe ' + Date.now(),
                Observations: 'Groupe de test'
            })
        });

        if (!groupRes.ok) {
            console.error('❌ Group creation failed:', groupRes.status, await groupRes.text());
            return;
        }

        const groupData = await groupRes.json();
        const groupId = groupData.id;
        console.log('✓ Group created with ID:', groupId);

        // 3. List groups
        console.log('\n3. Listing groups...');
        const listGroupsRes = await fetch('http://localhost:3001/api/groupes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!listGroupsRes.ok) {
            console.error('❌ List groups failed:', listGroupsRes.status);
            return;
        }

        const groups = await listGroupsRes.json();
        console.log('✓ Found', groups.length, 'group(s)');

        // 4. Create a user
        console.log('\n4. Creating a user...');
        const userRes = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                NomAgent: 'Test User',
                Email: 'test' + Date.now() + '@example.com',
                Login: 'testuser' + Date.now(),
                password: 'Password123',
                role: 'USER',
                IDGroupes: groupId,
                FonctionAgent: 'Testeur'
            })
        });

        if (!userRes.ok) {
            console.error('❌ User creation failed:', userRes.status, await userRes.text());
            return;
        }

        const userData = await userRes.json();
        console.log('✓ User created with ID:', userData.id);

        // 5. List users
        console.log('\n5. Listing users...');
        const listUsersRes = await fetch('http://localhost:3001/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!listUsersRes.ok) {
            console.error('❌ List users failed:', listUsersRes.status);
            return;
        }

        const users = await listUsersRes.json();
        console.log('✓ Found', users.length, 'user(s)');

        // 6. Verify user is in group
        const createdUser = users.find(u => u.id === userData.id);
        if (createdUser && createdUser.IDGroupes === groupId) {
            console.log('✓ User correctly assigned to group');
        } else {
            console.error('❌ User not correctly assigned to group');
        }

        console.log('\n✅ All verifications passed!');

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifyGroupsAndUsers();
