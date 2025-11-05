import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCcw, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import {
  MarkdownEditor,
  type MarkdownEditorHandle,
} from '../components/editor/MarkdownEditor';
import { MarkdownToolbar } from '../components/editor/MarkdownToolbar';
import { PostViewer } from '../components/posts/PostViewer';
import { useDraftAutosave } from '../hooks/useDraftAutosave';
import { useDraft, usePosts } from '../hooks/usePosts';
import type { Post } from '../types/post';

interface FormData {
  author: string;
  content: string;
}

const animals = [
  '사자',
  '고양이',
  '토끼',
  '수달',
  '여우',
  '펭귄',
  '돌고래',
  '판다',
  '부엉이',
  '고래',
];

const deriveTitle = (content: string): string => {
  const fallback = '마음 한 조각';
  const trimmed = content.trim();
  if (!trimmed) return fallback;
  const firstLine = trimmed.split(/\r?\n/).find((line) => line.trim());
  if (!firstLine) return fallback;
  const sanitized = firstLine.replace(/[#*>`]/g, '').trim();
  return sanitized.length > 40 ? `${sanitized.slice(0, 40)}…` : sanitized || fallback;
};

export const WritePage: FC = () => {
  const navigate = useNavigate();
  const { createPost } = usePosts();
  const { draft, saveDraft, clearDraft } = useDraft();
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonName, setAnonName] = useState('익명의 고양이');
  const manualAuthorRef = useRef(draft?.author || '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      author: draft?.author || '',
      content: draft?.content || '',
    },
  });

  const author = watch('author');
  const content = watch('content');

  useEffect(() => {
    if (!isAnonymous) {
      manualAuthorRef.current = author;
    }
  }, [author, isAnonymous]);

  const computedTitle = useMemo(() => deriveTitle(content), [content]);

  useDraftAutosave(
    { title: computedTitle, author, content },
    saveDraft
  );

  const previewPost: Post = useMemo(
    () => ({
      id: 'preview',
      title: computedTitle,
      author: author || '이름 없는 친구',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [author, content, computedTitle]
  );

  const handleAnonymousToggle = (checked: boolean) => {
    setIsAnonymous(checked);
    if (checked) {
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
      const name = `익명의 ${randomAnimal}`;
      setAnonName(name);
      setValue('author', name, { shouldDirty: true });
    } else {
      setValue('author', manualAuthorRef.current || '', { shouldDirty: true });
    }
  };

  const rerollAnonymous = () => {
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const name = `익명의 ${randomAnimal}`;
    setAnonName(name);
    setValue('author', name, { shouldDirty: true });
  };

  const onSubmit = (data: FormData) => {
    createPost({
      title: computedTitle,
      author: data.author || '이름 없는 친구',
      content: data.content,
    });
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
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-rose-50 p-4 md:p-10"
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
            <div className="bg-white rounded-full px-4 py-1 text-sm text-emerald-600 cute-shadow">
              {lastSavedLabel}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-3">
              <div className="bg-white rounded-2xl px-4 py-2 text-center">
                <p className="text-xs text-slate-400">글자 수</p>
                <p className="text-lg font-semibold text-teal-700">
                  {content.length}
                </p>
              </div>
              <div className="bg-white rounded-2xl px-4 py-2 text-center">
                <p className="text-xs text-slate-400">단어 수</p>
                <p className="text-lg font-semibold text-amber-600">
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
          className="bg-white/80 backdrop-blur rounded-3xl p-6 cute-shadow space-y-4"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                작성자
              </label>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <input
                  {...register('author', { required: '누가 보낸 편지인지 알려주세요' })}
                  placeholder="당신의 이름이나 닉네임"
                  className="flex-1 text-lg bg-white border-2 border-cyan-200 focus:border-cyan-400 rounded-2xl px-4 py-3 outline-none text-slate-800 placeholder-slate-300 disabled:bg-slate-50"
                  disabled={isAnonymous}
                />
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => handleAnonymousToggle(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  익명으로 작성하기
                </label>
                {isAnonymous && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    icon={RefreshCcw}
                    onClick={rerollAnonymous}
                  >
                    다른 이름
                  </Button>
                )}
              </div>
              {errors.author && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.author.message}
                </p>
              )}
              {isAnonymous && (
                <p className="text-xs text-emerald-500">
                  현재 이름: {anonName}
                </p>
              )}
            </div>

            <MarkdownToolbar onInsert={handleToolbarInsert} />

            <section className="bg-white rounded-3xl border border-slate-100 p-4 h-[55vh] flex flex-col">
              <h3 className="text-sm font-semibold text-emerald-500 mb-2">
                마음을 적어보세요
              </h3>
              <div className="flex-1">
                <MarkdownEditor
                  ref={editorRef}
                  value={content}
                  onChange={(value) =>
                    setValue('content', value, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }
                  placeholder="마크다운으로 여러분의 이야기를 들려주세요..."
                />
              </div>
            </section>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur rounded-3xl p-6 cute-shadow"
        >
          <h3 className="text-sm font-semibold text-sky-500 mb-3">
            메인 페이지 미리보기
          </h3>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <PostViewer post={previewPost} />
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
};
