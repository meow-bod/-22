'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Form';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// 定義傳入的 applicant 物件的型別
interface Applicant {
  id: string;
  is_approved: boolean;
  created_at: string;
  users: {
    id: string;
    full_name: string | null;
  } | null;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
}

interface UserWithPets {
  id: string;
  full_name: string | null;
  email: string | null;
  pets: Pet[];
}

interface AdminDashboardClientProps {
  applicants: Applicant[];
  usersWithPets: UserWithPets[];
}

const AdminDashboardClient = ({ initialApplicants, usersWithPets }: { applicants: Applicant[], usersWithPets: UserWithPets[] }) => {
  const router = useRouter();
  const supabase = createClient();
  const [applicants, setApplicants] = useState(initialApplicants);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApproval = async (applicantId: string, newStatus: boolean) => {
    setError(null);
    startTransition(async () => {
      const { error } = await supabase
        .from('sitters')
        .update({ is_approved: newStatus })
        .eq('id', applicantId);

      if (error) {
        setError(`更新失敗: ${error.message}`);
      } else {
        // 更新成功後，刷新頁面以顯示最新狀態
        // 另一種做法是只更新本地 state，以提供更流暢的體驗
        setApplicants(applicants.map(app => 
          app.id === applicantId ? { ...app, is_approved: newStatus } : app
        ));
        router.refresh();
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-text-main mb-6">後台管理</h1>
      
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-text-main mb-4">保姆申請審核</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">申請者姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">申請日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applicants.map((applicant) => (
                <tr key={applicant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {applicant.users?.full_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(applicant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${applicant.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {applicant.is_approved ? '已批准' : '待審核'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {!applicant.is_approved ? (
                      <Button onClick={() => handleApproval(applicant.id, true)} disabled={isPending} className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2">
                        {isPending ? '處理中...' : '批准'}
                      </Button>
                    ) : (
                      <Button onClick={() => handleApproval(applicant.id, false)} disabled={isPending} className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2">
                        {isPending ? '處理中...' : '撤銷批准'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-text-main mb-4">所有使用者與寵物</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">使用者名稱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">寵物</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersWithPets.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.full_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.pets.length > 0 ? user.pets.map(p => p.name).join(', ') : '無'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardClient;