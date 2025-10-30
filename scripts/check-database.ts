/**
 * Database Health Check Script
 * Run: npx tsx scripts/check-database.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 ROOMAH DATABASE HEALTH CHECK\n');
  console.log('='.repeat(60));

  try {
    // 1. Check Users
    const { data: profileStats, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, is_admin, is_verified, koin_balance');

    if (profileError) throw profileError;

    console.log('\n👥 USER STATISTICS:');
    console.log(`   Total Users: ${profileStats?.length || 0}`);
    console.log(`   Admins: ${profileStats?.filter(p => p.is_admin).length || 0}`);
    console.log(`   Verified: ${profileStats?.filter(p => p.is_verified).length || 0}`);
    console.log(`   Total Koin: ${profileStats?.reduce((sum, p) => sum + p.koin_balance, 0) || 0}`);

    // 2. Check CVs
    const { data: cvStats, error: cvError } = await supabase
      .from('cv_data')
      .select('status, candidate_code, gender');

    if (cvError) throw cvError;

    console.log('\n📋 CV STATISTICS:');
    console.log(`   Total CVs: ${cvStats?.length || 0}`);
    console.log(`   DRAFT: ${cvStats?.filter(cv => cv.status === 'DRAFT').length || 0}`);
    console.log(`   REVIEW: ${cvStats?.filter(cv => cv.status === 'REVIEW').length || 0}`);
    console.log(`   APPROVED: ${cvStats?.filter(cv => cv.status === 'APPROVED').length || 0}`);
    console.log(`   REVISI: ${cvStats?.filter(cv => cv.status === 'REVISI').length || 0}`);
    console.log(`   Candidate Codes Generated: ${cvStats?.filter(cv => cv.candidate_code !== null).length || 0}`);

    // 3. Check Taaruf Requests
    const { data: requestStats, error: requestError } = await supabase
      .from('taaruf_requests')
      .select('status');

    if (requestError) throw requestError;

    console.log('\n💌 TAARUF REQUEST STATISTICS:');
    console.log(`   Total Requests: ${requestStats?.length || 0}`);
    console.log(`   PENDING: ${requestStats?.filter(r => r.status === 'PENDING').length || 0}`);
    console.log(`   ACCEPTED: ${requestStats?.filter(r => r.status === 'ACCEPTED').length || 0}`);
    console.log(`   REJECTED: ${requestStats?.filter(r => r.status === 'REJECTED').length || 0}`);

    // 4. Check Taaruf Sessions
    const { data: sessionStats, error: sessionError } = await supabase
      .from('taaruf_sessions')
      .select('status, taaruf_code');

    if (sessionError) throw sessionError;

    console.log('\n💬 TAARUF SESSION STATISTICS:');
    console.log(`   Total Sessions: ${sessionStats?.length || 0}`);
    console.log(`   ACTIVE: ${sessionStats?.filter(s => s.status === 'ACTIVE').length || 0}`);
    console.log(`   COMPLETED: ${sessionStats?.filter(s => s.status === 'COMPLETED').length || 0}`);
    console.log(`   Taaruf Codes Generated: ${new Set(sessionStats?.map(s => s.taaruf_code)).size || 0}`);

    // 5. Check Wallet Transactions
    const { data: txnStats, error: txnError } = await supabase
      .from('wallet_transactions')
      .select('type, amount_cents');

    if (txnError) throw txnError;

    const credits = txnStats?.filter(t => t.type === 'CREDIT') || [];
    const debits = txnStats?.filter(t => t.type === 'DEBIT') || [];

    console.log('\n💰 WALLET TRANSACTION STATISTICS:');
    console.log(`   Total Transactions: ${txnStats?.length || 0}`);
    console.log(`   CREDIT: ${credits.length} (${credits.reduce((sum, t) => sum + t.amount_cents, 0) / 100} koin)`);
    console.log(`   DEBIT: ${debits.length} (${debits.reduce((sum, t) => sum + t.amount_cents, 0) / 100} koin)`);

    // 6. Check Payment Transactions
    const { data: paymentStats, error: paymentError } = await supabase
      .from('payment_transactions')
      .select('status, amount_cents');

    if (paymentError) throw paymentError;

    const settlements = paymentStats?.filter(p => p.status === 'SETTLEMENT') || [];

    console.log('\n💳 PAYMENT STATISTICS:');
    console.log(`   Total Payments: ${paymentStats?.length || 0}`);
    console.log(`   SETTLEMENT: ${settlements.length}`);
    console.log(`   Total Revenue: Rp ${settlements.reduce((sum, p) => sum + p.amount_cents, 0) / 100}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database health check completed!\n');

  } catch (error) {
    console.error('\n❌ Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
