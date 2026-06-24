import { db } from '$lib/server/mockDb';

export function load() {
    return {
        status: db.uktStatus,
        billing: db.uktBilling
    };
}

export const actions = {
    pay: async () => {
        db.uktStatus = 'LUNAS';
        return { success: true, message: 'Pembayaran UKT Berhasil! Akses KRS telah dibuka.' };
    },
    resetStatus: async () => {
        db.uktStatus = 'BELUM_BAYAR';
        return { success: true, message: 'Status pembayaran direset ke BELUM BAYAR.' };
    }
};
