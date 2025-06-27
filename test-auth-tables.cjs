"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_js_1 = require("./app/actions/auth.js");
async function testAuthTables() {
    try {
        await (0, auth_js_1.ensureAuthTables)();
        console.log('Database tables verified successfully');
    }
    catch (error) {
        console.error('Error verifying tables:', error);
    }
}
testAuthTables();
