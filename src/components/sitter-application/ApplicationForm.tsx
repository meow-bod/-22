import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SitterFormData, ValidationErrors } from '@/types';

interface ApplicationFormProps {
  formData: SitterFormData;
  setFormData: (formData: SitterFormData) => void;
  handleSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  validationErrors: ValidationErrors;
}

export const ApplicationForm = ({
  formData,
  setFormData,
  handleSubmit,
  submitting,
  validationErrors,
}: ApplicationFormProps) => {
  const router = useRouter();

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>基本資訊</h3>
          <div className='space-y-4'>
            <div>
              <label htmlFor='service_area' className='block text-sm font-medium text-gray-700 mb-1'>服務地區 *</label>
              <input
                id='service_area'
                type='text'
                required
                value={formData.service_area}
                onChange={e => setFormData({ ...formData, service_area: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.service_area ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='例如：台北市大安區、新北市板橋區'
              />
              {validationErrors.service_area && (
                <p className='mt-1 text-sm text-red-600'>{validationErrors.service_area}</p>
              )}
            </div>
            <div>
              <label htmlFor='price_per_hour' className='block text-sm font-medium text-gray-700 mb-1'>每小時收費 (NT$) *</label>
              <input
                id='price_per_hour'
                type='number'
                required
                min='100'
                max='2000'
                value={formData.price_per_hour}
                onChange={e => setFormData({ ...formData, price_per_hour: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.price_per_hour ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='建議範圍：200-800'
              />
              {validationErrors.price_per_hour && (
                <p className='mt-1 text-sm text-red-600'>{validationErrors.price_per_hour}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>自我介紹</h3>
          <div>
            <label htmlFor='introduction' className='block text-sm font-medium text-gray-700 mb-1'>請介紹您的背景和照顧寵物的經驗 *</label>
            <textarea
              id='introduction'
              required
              rows={5}
              value={formData.introduction}
              onChange={e => setFormData({ ...formData, introduction: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.introduction ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='請詳細描述您的寵物照顧經驗、專長、個人特質等...'
            />
            {validationErrors.introduction && (
              <p className='mt-1 text-sm text-red-600'>{validationErrors.introduction}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>專業資格</h3>
          <div className='space-y-3'>
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='insurance'
                checked={formData.has_insurance}
                onChange={e => setFormData({ ...formData, has_insurance: e.target.checked })}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
              <label htmlFor='insurance' className='ml-2 text-sm text-gray-700'>
                我有寵物照顧相關保險
              </label>
            </div>
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='first-aid'
                checked={formData.has_first_aid}
                onChange={e => setFormData({ ...formData, has_first_aid: e.target.checked })}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
              <label htmlFor='first-aid' className='ml-2 text-sm text-gray-700'>
                我有寵物急救相關證照或訓練
              </label>
            </div>
          </div>
        </div>

        <div className='flex space-x-4'>
          <button
            type='submit'
            disabled={submitting}
            className='flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
          >
            {submitting && <LoadingSpinner size='sm' className='mr-2' />}
            {submitting ? '提交中...' : '提交申請'}
          </button>
          <button
            type='button'
            onClick={() => router.push('/')}
            disabled={submitting}
            className='px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50'
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
};