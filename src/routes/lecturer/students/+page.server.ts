import { db } from '$lib/server/mockDb';

export function load() {
    return {
        students: db.mentoredStudents
    };
}
