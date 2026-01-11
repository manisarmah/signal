const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

// Create client WITHOUT session (simulating public user)
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPublicAccess() {
    console.log('--- Verifying Public Access ---');

    // 1. Check if we can see ANY profiles
    console.log('Fetching profiles...');
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profileError) {
        console.error('❌ Error fetching profiles:', profileError.message);
    } else {
        console.log(`✅ Profiles found (Anonymous): ${profiles.length}`);
        if (profiles.length > 0) console.log('Sample:', profiles[0]);
    }

    // 2. Check if we can see ANY receipts
    console.log('\nFetching receipts...');
    const { data: receipts, error: receiptError } = await supabase
        .from('receipts')
        .select('*')
        .limit(1);

    if (receiptError) {
        console.error('❌ Error fetching receipts:', receiptError.message);
    } else {
        console.log(`✅ Receipts found (Anonymous): ${receipts.length}`);
        if (receipts.length > 0) {
            console.log('Sample:', receipts[0]);
        } else {
            console.log('⚠️ No receipts found anonymously. RLS might be blocking.');
        }
    }
}

verifyPublicAccess();
