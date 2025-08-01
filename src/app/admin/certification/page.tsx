'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

// Define the type for a sitter based on the database query result
type Sitter = {
  id: string;
  is_certified: boolean;
  users: {
    full_name: string;
  }[] | null;
  // Add other sitter properties as needed
};

export default function AdminCertificationPage() {
  const supabase = createClient();
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error: _error } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
        if (data?.is_admin) {
          setIsAdmin(true);
          fetchSitters();
        } else {
          // Redirect non-admin users
          window.location.href = '/';
        }
      } else {
        // Redirect non-logged-in users
        window.location.href = '/login';
      }
    };

    const fetchSitters = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('sitters').select(`
          id,
          is_certified,
          users ( full_name )
        `);

      if (error) {
        console.error('Error fetching sitters:', error);
        setSitters([]);
      } else if (data) {
        // The data from the query now matches the Sitter type
        setSitters(data);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [supabase]);

  const handleCertificationChange = async (sitter_id: string, newStatus: boolean) => {
    const { data: _data, error } = await supabase.functions.invoke('update-sitter-certification', {
      body: { sitter_id, is_certified: newStatus }
    });

    if (error) {
      alert('Error updating certification: ' + error.message);
    } else {
      alert('Certification updated successfully!');
      // Refresh the list
      setSitters(sitters.map(s => (s.id === sitter_id ? { ...s, is_certified: newStatus } : s)));
    }
  };

  if (!isAdmin) {
    return <p>Redirecting...</p>;
  }

  if (loading) {
    return <p>Loading sitters...</p>;
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Sitter Certification Management</h1>
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border'>
          <thead>
            <tr>
              <th className='py-2 px-4 border-b'>Sitter Name</th>
              <th className='py-2 px-4 border-b'>Certification Status</th>
              <th className='py-2 px-4 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sitters.map(sitter => (
              <tr key={sitter.id}>
                <td className='py-2 px-4 border-b text-center'>{sitter.users?.[0]?.full_name || 'N/A'}</td>
                <td className='py-2 px-4 border-b text-center'>
                  {sitter.is_certified ? 'Certified' : 'Not Certified'}
                </td>
                <td className='py-2 px-4 border-b text-center'>
                  <button
                    onClick={() => handleCertificationChange(sitter.id, !sitter.is_certified)}
                    className={`px-4 py-2 rounded text-white ${
                      sitter.is_certified ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {sitter.is_certified ? 'Revoke' : 'Certify'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
