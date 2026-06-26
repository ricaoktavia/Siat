import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, mahasiswa } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ url, cookies }) {
    const sessionId = cookies.get('session');
    
    // Redirect to login if not logged in and not already on login page
    if (!sessionId && url.pathname !== '/login') {
        throw redirect(307, '/login');
    }

    let user = null;
    let studentInfo = null;

    if (sessionId) {
        const result = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
        if (result.length > 0) {
            user = result[0];
            
            // If student, fetch student details
            if (user.role === 'STUDENT') {
                const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, user.id)).limit(1);
                if (mhsResult.length > 0) {
                    studentInfo = mhsResult[0];
                }
            }
        } else if (url.pathname !== '/login') {
            // Invalid session
            cookies.delete('session', { path: '/' });
            cookies.delete('role', { path: '/' });
            throw redirect(307, '/login');
        }
    }

    return {
        user: user,
        studentInfo: studentInfo,
        role: cookies.get('role')
    };
}
