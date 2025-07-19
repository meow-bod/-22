'use client';

import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ErrorMessage } from '@/components/ErrorMessage';
import { FullPageLoading } from '@/components/LoadingSpinner';
import { AlreadySitter } from '@/components/sitter-application/AlreadySitter';
import { ApplicationForm } from '@/components/sitter-application/ApplicationForm';
import { ApplicationInstructions } from '@/components/sitter-application/ApplicationInstructions';
import { PageHeader } from '@/components/sitter-application/PageHeader';
import { SubmissionNotes } from '@/components/sitter-application/SubmissionNotes';
import { createClient } from '@/lib/supabase/client';
import { SitterFormData, ValidationErrors } from '@/types';
import { sitterApi as sitterAPI } from '@/utils/api';
import { validateSitterForm as validateSitterApplication, hasValidationErrors as hasErrors } from '@/utils/validation';

export default function SitterApplication() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSitter, setIsSitter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<SitterFormData>({
    service_area: '',
    introduction: '',
    price_per_hour: 0,
    experience: '',
    availability: '',
    emergency_contact: '',
    has_insurance: false,
    has_first_aid: false,
    qualifications: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        setUser(user);

        const sitterData = await sitterAPI.getSitterById(user.id);
        if (sitterData) {
          setIsSitter(true);
        }
      } catch (error) {
        console.error('檢查使用者狀態失敗:', error);
        setError('載入頁面時發生錯誤');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const errors = validateSitterApplication(formData);
    if (hasErrors(errors)) {
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await sitterAPI.applySitter(user.id, formData);
      router.push('/?success=sitter-application');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交申請時發生錯誤');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FullPageLoading text='載入申請頁面...' />;
  }

  if (isSitter) {
    return <AlreadySitter />;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-2xl mx-auto px-4'>
        <PageHeader />
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} className='mb-6' />}
        <ApplicationInstructions />
        <ApplicationForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          submitting={submitting}
          validationErrors={validationErrors}
        />
        <SubmissionNotes />
      </div>
    </div>
  );
}
