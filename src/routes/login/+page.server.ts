import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        console.log(`Login attempt: ${username}`);
        
        const result = await db.select().from(users).where(and(eq(users.username, username), eq(users.password, password))).limit(1);
        const user = result[0];

        if (!user) {
            console.log('Login failed: User not found or password mismatch');
            return fail(400, { error: 'Username atau password salah.' });
        }

        console.log(`Login success: ${user.name} (${user.role})`);
        
        // Simulating a cookie session
        cookies.set('session', user.id, { path: '/', httpOnly: true });
        cookies.set('role', user.role, { path: '/', httpOnly: true });

        if (user.role === 'LECTURER') {
            throw redirect(303, '/lecturer');
        } else {
            throw redirect(303, '/');
        }
    },

    logout: async ({ cookies }) => {
        cookies.delete('session', { path: '/' });
        cookies.delete('role', { path: '/' });
        throw redirect(303, '/login');
    }
};
