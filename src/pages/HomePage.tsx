import { motion } from 'framer-motion';
import { Edit, Palette } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { BackgroundCanvas } from '../components/background/BackgroundCanvas';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { PostGrid } from '../components/posts/PostGrid';
import { PostViewer } from '../components/posts/PostViewer';
import { useBackground } from '../hooks/useBackground';
import { usePosts } from '../hooks/usePosts';
import type { Post } from '../types/post';

export const HomePage: FC = () => {
  const { config } = useBackground();
  const { posts } = usePosts();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <>
      <div className="absolute inset-0 -z-10">
        <BackgroundCanvas config={config} editable={false} showGuides={false} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 min-h-screen p-6 md:p-10"
      >
        <header className="text-center mb-12">
          <motion.h1
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-5xl md:text-7xl font-bold text-purple-800 mb-4"
          >
            My Cute Space ✨
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600"
          >
            나만의 귀여운 공간에서 마음껏 표현해보세요
          </motion.p>
        </header>

        <div className="flex justify-center gap-4 mb-12">
          <Link to="/background-editor">
            <Button icon={Palette} className="animate-float">
              배경 꾸미기
            </Button>
          </Link>
          <Link to="/write">
            <Button
              icon={Edit}
              variant="secondary"
              className="animate-float"
              style={{ animationDelay: '0.5s' }}
            >
              글 작성하기
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
          {[
            { label: '작성한 글', value: posts.length, sub: '소중한 기록들' },
            {
              label: '배경 요소',
              value: config.images.length,
              sub: '캔버스 위의 오브젝트',
            },
            {
              label: '라이브러리',
              value: config.uploadedImages.length,
              sub: '업로드한 이미지',
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur rounded-2xl p-4 cute-shadow text-center"
            >
              <p className="text-sm text-purple-400">{item.label}</p>
              <p className="text-3xl font-bold text-purple-800 mt-1">
                {item.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto">
          <PostGrid posts={posts} onPostClick={setSelectedPost} />
        </div>
      </motion.div>

      <Modal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        title=""
        maxWidth="xl"
      >
        {selectedPost && <PostViewer post={selectedPost} />}
      </Modal>
    </>
  );
};
