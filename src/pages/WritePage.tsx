import { motion } from 'framer-motion';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { ArrowLeft, RefreshCcw, Save } from 'lucide-react';
import { nanoid } from 'nanoid';
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
import { useUnsavedChangesPrompt } from '../hooks/useUnsavedChangesPrompt';
import { usePosts } from '../hooks/usePosts';
import { storage } from '../lib/firebase';
import type { Post } from '../types/post';
import { createUploadPlaceholder } from '../utils/uploadPlaceholder';

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

const createEditorImagePath = (fileName: string) => {
  const extension = fileName.split('.').pop();
  const cleanedExt = extension?.replace(/[^a-zA-Z0-9]/g, '') ?? '';
  const safeExt = cleanedExt ? `.${cleanedExt}` : '';
  return `background-images/post-${nanoid()}-${Date.now()}${safeExt}`;
};

const uploadPostImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있어요.');
  }
  const storageRef = ref(storage, createEditorImagePath(file.name));
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

const getUploadErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return '이미지 업로드에 실패했어요. 다시 시도해주세요.';
};

export const WritePage: FC = () => {
  const navigate = useNavigate();
  const { createPost } = usePosts();
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonName, setAnonName] = useState('익명의 고양이');
  const manualAuthorRef = useRef('');
  const uploadAltText = (file: File) =>
    file.name.replace(/\.[^/.]+$/, '') || '이미지 설명';

  const handleEditorImageUpload = async (file: File) => uploadPostImage(file);

  const handleToolbarImageUpload = async (file: File) => {
    const editor = editorRef.current;
    if (!editor) return;

    const placeholder = createUploadPlaceholder(file.name);
    editor.insertText('', '', placeholder.markdown);

    try {
      const downloadUrl = await uploadPostImage(file);
      editor.replaceText(
        placeholder.markdown,
        `![${uploadAltText(file)}](${downloadUrl})`
      );
    } catch (error) {
      console.error(error);
      const message = getUploadErrorMessage(error);
      editor.replaceText(placeholder.markdown, `> ⚠️ ${message}`);
      alert(message);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      author: '',
      content: '',
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

  useUnsavedChangesPrompt(
    isDirty && !isSubmitting,
    '작성 중인 글이 저장되지 않았어요. 페이지를 떠나시겠어요?'
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
    manualAuthorRef.current = '';
    reset({
      author: '',
      content: '',
    });
    navigate('/');
  };

  const handleToolbarInsert = (
    before: string,
    after?: string,
    placeholder?: string
  ) => {
    editorRef.current?.insertText(before, after, placeholder);
  };

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
        <div className="flex flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate('/')}
            >
              목록으로
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" icon={Save}>
              저장하기
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur rounded-3xl p-6 cute-shadow flex flex-col min-h-[65vh] lg:h-[70vh]"
          >
            <div className="flex flex-col gap-4 flex-1 min-h-0">
              <div className="flex flex-col gap-2">
                {/* <label className="text-xs uppercase tracking-wide text-slate-400">
                  작성자
                </label> */}
                <div className="flex flex-col gap-3">
                  <input
                    {...register('author', { required: '누가 작성한 글인지 알려주세요' })}
                    placeholder="작성자"
                    className="flex-1 text-lg bg-white border-2 border-cyan-200 focus:border-cyan-400 rounded-2xl px-4 py-3 outline-none text-slate-800 placeholder-slate-300 disabled:bg-slate-50"
                    disabled={isAnonymous}
                  />
                </div>
                <div className="flex flex-row gap-2">
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

              <MarkdownToolbar
                onInsert={handleToolbarInsert}
                onImageUpload={handleToolbarImageUpload}
              />

              <section className="flex flex-col flex-1 min-h-0">
                {/* <h3 className="text-sm font-semibold text-emerald-500 mb-2">
                  마음을 적어보세요
                </h3> */}
                <div className="flex-1 min-h-0">
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
                    onImageUpload={handleEditorImageUpload}
                  />
                </div>
              </section>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur rounded-3xl p-6 cute-shadow flex flex-col min-h-[45vh] lg:h-[70vh]"
          >
            {/* <h3 className="text-sm font-semibold text-sky-500 mb-3">
              메인 페이지 미리보기
            </h3> */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 ">
              <PostViewer post={previewPost} />
            </div>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};
