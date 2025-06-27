"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const pg_1 = require("pg");
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
async function checkTables() {
    const client = new pg_1.Client({
        connectionString: process.env.DATABASE_URL
    });
    try {
        await client.connect();
        const res = await client.query('SELECT * FROM users LIMIT 1');
        console.log('Users table exists with', res.rowCount, 'rows');
    }
    catch (error) {
        console.error('Error checking tables:', error.message);
    }
    finally {
        await client.end();
    }
}
checkTables();
