import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/mockDb';

export const actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        console.log(`Login attempt: ${username}`);
        const user = db.users.find(u => u.username === username && u.password === password);

        if (!user) {
            console.log('Login failed: User not found or password mismatch');
            return fail(400, { error: 'Username atau password salah.' });
        }

        console.log(`Login success: ${user.name} (${user.role})`);
        // Set session in mock DB
        db.currentSession = user;
        
        // Simulating a cookie session
        cookies.set('session', user.role, { path: '/', httpOnly: true });

        if (user.role === 'LECTURER') {
            throw redirect(303, '/lecturer');
        } else {
            throw redirect(303, '/');
        }
    },

    logout: async ({ cookies }) => {
        cookies.delete('session', { path: '/' });
        db.currentSession = null;
        throw redirect(303, '/login');
    }
};
