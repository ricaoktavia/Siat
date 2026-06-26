import mysql from 'mysql2/promise';

async function main() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        
        await connection.query('CREATE DATABASE IF NOT EXISTS siat;');
        console.log('Database siat created or exists');
        
        await connection.query('USE siat;');

        // Ensure tables exist before seeding (usually Drizzle push does this, but we'll run drizzle push first)
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
main();
