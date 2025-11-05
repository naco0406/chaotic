import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { useEffect, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/common/Button';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface AdminForm {
  heroTitle: string;
  heroDescription: string;
  heroHighlight: string;
  footerNote: string;
}

export const AdminPage: FC = () => {
  const { settings, updateSettings } = useSiteSettings();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<AdminForm>({
    defaultValues: settings,
  });

  useEffect(() => {
    reset(settings);
  }, [reset, settings]);

  const onSubmit = (data: AdminForm) => {
    void updateSettings(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 p-6 md:p-12"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl mx-auto bg-white/90 backdrop-blur rounded-[32px] p-8 space-y-6 shadow-2xl"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            소개 영역 편집하기
          </h1>
          <p className="text-slate-500">
            메인 페이지 상단 히어로 영역과 하단 안내 문구를 자유롭게 변경해 보세요.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-600">
            히어로 타이틀
          </span>
          <input
            {...register('heroTitle', { required: true })}
            className="w-full rounded-2xl border-2 border-sky-100 focus:border-sky-400 px-4 py-3 text-lg outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-600">
            히어로 설명
          </span>
          <textarea
            {...register('heroDescription', { required: true })}
            rows={3}
            className="w-full rounded-2xl border-2 border-emerald-100 focus:border-emerald-400 px-4 py-3 text-base outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-600">
            강조 문장
          </span>
          <input
            {...register('heroHighlight', { required: true })}
            className="w-full rounded-2xl border-2 border-lime-100 focus:border-lime-400 px-4 py-3 text-base outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-600">
            하단 안내 문구
          </span>
          <textarea
            {...register('footerNote', { required: true })}
            rows={2}
            className="w-full rounded-2xl border-2 border-amber-100 focus:border-amber-400 px-4 py-3 text-base outline-none"
          />
        </label>

        <div className="flex justify-end">
          <Button type="submit" icon={Save} disabled={!isDirty}>
            {isDirty ? '변경 내용 저장' : '모든 변경 사항 저장됨'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
