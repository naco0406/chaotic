import { memo } from 'react';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import type { Post } from '../../types/post';
import { PostViewer } from './PostViewer';

interface PostGridProps {
  posts: Post[];
}

const PostGridComponent: FC<PostGridProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <p className="text-xl text-emerald-600 font-semibold">
          아직 작성된 글이 없습니다
        </p>
      </motion.div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 gap-8 space-y-8">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="break-inside-avoid rounded-[28px] bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-white/30 p-6"
        >
          <PostViewer post={post} />
        </motion.div>
      ))}
    </div>
  );
};

export const PostGrid = memo(PostGridComponent);
