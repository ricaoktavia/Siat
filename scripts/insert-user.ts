import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import 'dotenv/config';
import * as schema from "../src/lib/server/db/schema";
import { v4 as uuidv4 } from 'uuid';

async function main() {
    const poolConnection = mysql.createPool({
        uri: process.env.DATABASE_URL
    });

    const db = drizzle(poolConnection, { schema, mode: "default" });

    try {
        const userId = uuidv4();
        await db.insert(schema.users).values({
            id: userId,
            username: '2023520036',
            password: 'password123',
            role: 'STUDENT',
            name: 'mustafida'
        });

        await db.insert(schema.mahasiswa).values({
            userId: userId,
            nim: '2023520036',
            prodi: 'Teknik Informatika',
            ipk: '3.50',
            semester: 5,
        });

        console.log("Successfully inserted student Mustafida!");
    } catch (e) {
        console.error("Error inserting data:", e);
    } finally {
        await poolConnection.end();
    }
}

main();
