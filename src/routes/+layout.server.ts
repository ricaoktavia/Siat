import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/mockDb';

export function load({ url, cookies }) {
    const session = cookies.get('session');
    
    // Redirect to login if not logged in and not already on login page
    if (!session && url.pathname !== '/login') {
        throw redirect(307, '/login');
    }

    // If logged in as lecturer, ensure they are on lecturer routes (optional enforcement)
    // For now, just pass the session role and current user name
    return {
        user: db.currentSession,
        role: session
    };
}
