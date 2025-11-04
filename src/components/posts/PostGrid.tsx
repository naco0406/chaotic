import { motion } from 'framer-motion';
import type { FC } from 'react';
import type { Post } from '../../types/post';
import { PostCard } from './PostCard';

interface PostGridProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

export const PostGrid: FC<PostGridProps> = ({ posts, onPostClick }) => {
  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <p className="text-xl text-purple-600 font-semibold">
          아직 작성된 글이 없어요 💭
        </p>
        <p className="text-gray-500 mt-2">첫 번째 글을 작성해보세요!</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PostCard post={post} onClick={onPostClick} />
        </motion.div>
      ))}
    </div>
  );
};
