import { db } from '$lib/server/mockDb';

export function load() {
    return {
        transcript: db.transcript,
        currentStudent: db.currentStudent
    };
}
