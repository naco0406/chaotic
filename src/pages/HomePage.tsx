import { motion } from 'framer-motion';
import { Edit, Palette, Settings2 } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { BackgroundCanvas } from '../components/background/BackgroundCanvas';
import { Button } from '../components/common/Button';
import { PostGrid } from '../components/posts/PostGrid';
import { useBackground } from '../hooks/useBackground';
import { usePosts } from '../hooks/usePosts';
import { useSiteSettings } from '../hooks/useSiteSettings';

export const HomePage: FC = () => {
  const { config } = useBackground();
  const { posts } = usePosts();
  const { settings } = useSiteSettings();

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <BackgroundCanvas
          config={config}
          editable={false}
          showGuides={false}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 min-h-screen p-6 md:p-12 space-y-12"
      >
        <section className="max-w-5xl mx-auto text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-500">
            💌 Letter Garden
          </p>
          <motion.h1
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="text-4xl md:text-6xl font-black text-slate-900"
          >
            {settings.heroTitle}
          </motion.h1>
          <p className="text-lg md:text-xl text-slate-600">
            {settings.heroDescription}
          </p>
          <p className="text-xl font-semibold text-emerald-600">
            {settings.heroHighlight}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/background-editor">
              <Button icon={Palette} className="bg-gradient-to-r from-lime-400 via-emerald-300 to-sky-300">
                배경 꾸미기
              </Button>
            </Link>
            <Link to="/write">
              <Button icon={Edit} variant="secondary">
                편지 쓰기
              </Button>
            </Link>
            <Link to="/admin">
              <Button icon={Settings2} variant="ghost">
                소개 문구 편집
              </Button>
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto">
          <PostGrid posts={posts} />
        </section>

        <p className="text-center text-sm text-slate-500">
          {settings.footerNote}
        </p>
      </motion.div>
    </div>
  );
};
