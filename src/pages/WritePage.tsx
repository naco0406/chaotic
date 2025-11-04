import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useRef, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import {
  MarkdownEditor,
  type MarkdownEditorHandle,
} from '../components/editor/MarkdownEditor';
import { MarkdownPreview } from '../components/editor/MarkdownPreview';
import { MarkdownToolbar } from '../components/editor/MarkdownToolbar';
import { useDraftAutosave } from '../hooks/useDraftAutosave';
import { useDraft, usePosts } from '../hooks/usePosts';

interface FormData {
  title: string;
  content: string;
}

export const WritePage: FC = () => {
  const navigate = useNavigate();
  const { createPost } = usePosts();
  const { draft, saveDraft, clearDraft } = useDraft();
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: draft?.title || '',
      content: draft?.content || '',
    },
  });

  const title = watch('title');
  const content = watch('content');

  useDraftAutosave(title, content, saveDraft);

  const onSubmit = (data: FormData) => {
    createPost(data);
    clearDraft();
    navigate('/');
  };

  const handleToolbarInsert = (
    before: string,
    after?: string,
    placeholder?: string
  ) => {
    editorRef.current?.insertText(before, after, placeholder);
  };

  const wordCount = content
    ? content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const lastSavedLabel = draft?.savedAt
    ? `자동 저장 ${new Date(draft.savedAt).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : '자동 저장 대기 중';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 md:p-10"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-6xl mx-auto space-y-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate('/')}
            >
              목록으로
            </Button>
            <div className="bg-white rounded-full px-4 py-1 text-sm text-purple-600 cute-shadow">
              {lastSavedLabel}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-3">
              <div className="bg-white rounded-2xl px-4 py-2 text-center">
                <p className="text-xs text-gray-400">글자 수</p>
                <p className="text-lg font-semibold text-purple-700">
                  {content.length}
                </p>
              </div>
              <div className="bg-white rounded-2xl px-4 py-2 text-center">
                <p className="text-xs text-gray-400">단어 수</p>
                <p className="text-lg font-semibold text-purple-700">
                  {wordCount}
                </p>
              </div>
            </div>
            <Button type="submit" icon={Save}>
              저장하기
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur rounded-3xl p-6 cute-shadow space-y-2"
        >
          <input
            {...register('title', { required: '제목을 입력해주세요' })}
            placeholder="제목을 입력하세요"
            className="w-full text-4xl font-bold bg-transparent border-b-2 border-purple-100 focus:border-purple-400 outline-none pb-2 text-purple-900 placeholder-purple-200"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </motion.div>

        <MarkdownToolbar onInsert={handleToolbarInsert} />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <section className="bg-white/80 backdrop-blur rounded-3xl p-4 cute-shadow h-[65vh] flex flex-col">
            <h3 className="text-sm font-semibold text-purple-500 mb-2">
              마크다운 에디터
            </h3>
            <div className="flex-1">
              <MarkdownEditor
                ref={editorRef}
                value={content}
                onChange={(value) =>
                  setValue('content', value, { shouldDirty: true })
                }
                placeholder="마크다운으로 여러분의 이야기를 들려주세요..."
              />
            </div>
          </section>

          <section className="bg-white/90 backdrop-blur rounded-3xl p-4 cute-shadow h-[65vh] flex flex-col">
            <h3 className="text-sm font-semibold text-purple-500 mb-2">
              실시간 미리보기
            </h3>
            <div className="flex-1 overflow-hidden">
              <MarkdownPreview content={content} />
            </div>
          </section>
        </motion.div>
      </form>
    </motion.div>
  );
};
