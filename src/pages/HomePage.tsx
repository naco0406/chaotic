import { motion } from 'framer-motion';
import { Edit, Palette } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { BackgroundCanvas } from '../components/background/BackgroundCanvas';
import { PostGrid } from '../components/posts/PostGrid';
import { useBackground } from '../hooks/useBackground';
import { usePosts } from '../hooks/usePosts';

const MotionLink = motion(Link);
const fabVariants = {
  rest: {
    width: 56,
    boxShadow: '0 18px 35px -18px rgba(15,23,42,0.7)',
  },
  hover: (expandedWidth: number) => ({
    width: expandedWidth ?? 196,
    boxShadow: '0 25px 60px -20px rgba(15,23,42,0.65)',
  }),
};
const labelVariants = {
  rest: {
    opacity: 0,
    x: 12,
    paddingLeft: 0,
    paddingRight: 0,
  },
  hover: {
    opacity: 1,
    x: 0,
    paddingLeft: 14,
    paddingRight: 16,
  },
};
const iconVariants = {
  rest: { rotate: 0, scale: 1 },
  hover: { rotate: -8, scale: 1.05 },
};

export const HomePage: FC = () => {
  const { config } = useBackground();
  const { posts, isLoading: isPostsLoading } = usePosts();
  const actions = [
    {
      to: '/background-editor',
      label: '배경 꾸미기',
      icon: Palette,
      bg: 'from-lime-300 via-emerald-300 to-sky-300',
      expandedWidth: 184,
      hideOnMobile: true,
    },
    {
      to: '/write',
      label: '글 쓰기',
      icon: Edit,
      bg: 'from-pink-200 via-rose-200 to-orange-200',
      expandedWidth: 176,
      hideOnMobile: false,
    },
  ] as const;

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
        <section className="max-w-5xl mx-auto text-center space-y-2">
          <motion.h1
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="text-2xl md:text-4xl font-black text-slate-900"
          >
            Goodbye, Felix
          </motion.h1>
          <p className="text-md md:text-lg text-slate-600">
            최 준 희 님께
          </p>
        </section>

        <section className="max-w-6xl mx-auto">
          {isPostsLoading ? (
            <div className="rounded-[32px] bg-white/70 backdrop-blur p-10 text-center text-emerald-600 cute-shadow animate-pulse">
            글을 불러오는 중이에요...
            </div>
          ) : (
            <PostGrid posts={posts} />
          )}
        </section>
      </motion.div>

      <div className="fixed bottom-8 right-8 z-20 flex flex-col items-end gap-4">
        {actions.map(({ to, label, icon: Icon, bg, expandedWidth, hideOnMobile }) => (
          <MotionLink
            key={label}
            to={to}
            aria-label={label}
            className={`group ${hideOnMobile ? 'hidden md:grid' : 'grid'} h-14 items-stretch overflow-hidden rounded-full border border-white/60 bg-gradient-to-r ${bg} backdrop-blur-[18px]`}
            style={{
              transformOrigin: 'right center',
              gridTemplateColumns: 'minmax(0, 1fr) 56px',
            }}
            variants={fabVariants}
            custom={expandedWidth}
            initial="rest"
            animate="rest"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <motion.span
              variants={labelVariants}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="flex h-full items-center justify-end text-sm font-semibold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(15,23,42,0.35)] whitespace-nowrap"
            >
              {label}
            </motion.span>
            <motion.span
              variants={iconVariants}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="flex h-14 w-14 items-center justify-center text-lg text-white"
            >
              <Icon size={22} />
            </motion.span>
          </MotionLink>
        ))}
      </div>
    </div>
  );
};
