import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '../../lib/supabase/server';

import AdminDashboardClient from './AdminDashboardClient';

// 這是伺服器元件，負責獲取資料和權限檢查
const AdminDashboardPage = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/login');
  }

  // 檢查使用者是否為管理員
  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');

  if (adminError || !isAdmin) {
    return (
      <div className='container mx-auto p-8 text-center'>
        <h1 className='text-2xl font-bold text-red-600'>存取被拒</h1>
        <p className='text-text-subtle mt-2'>您沒有權限存取此頁面。</p>
      </div>
    );
  }

  // 獲取所有使用者及其寵物資料
  const { data: usersWithPets, error: usersError } = await supabase
    .from('users')
    .select(
      `
      id,
      full_name,
      email,
      pets (*)
    `
    )
    .order('created_at', { ascending: false });

  if (usersError) {
    return <p>讀取使用者資料時發生錯誤: {usersError.message}</p>;
  }

  // 獲取所有保姆的資料 (因為是管理員，所以可以讀取所有資料)
  const { data: applicants, error: sittersError } = await supabase
    .from('sitters')
    .select(
      `
      id,
      is_approved,
      created_at,
      users ( id, full_name )
    `
    )
    .order('created_at', { ascending: false });

  if (sittersError) {
    return <p>讀取保姆資料時發生錯誤: {sittersError.message}</p>;
  }

  return <AdminDashboardClient applicants={applicants || []} usersWithPets={usersWithPets || []} />;
};

export default AdminDashboardPage;
