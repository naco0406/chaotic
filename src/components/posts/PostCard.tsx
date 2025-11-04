import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import type { FC } from 'react';
import type { Post } from '../../types/post';
import { getMarkdownPreview } from '../../utils/markdown';

interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
}

export const PostCard: FC<PostCardProps> = ({ post, onClick }) => {
  const preview = getMarkdownPreview(post.content);
  const date = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 cute-shadow hover:cute-shadow-hover transition-all cursor-pointer"
      onClick={() => onClick(post)}
    >
      <h3 className="text-xl font-bold text-purple-800 mb-2 line-clamp-2">
        {post.title}
      </h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{preview}</p>
      <div className="flex items-center text-sm text-gray-500">
        <Calendar size={16} className="mr-2" />
        <span>{date}</span>
      </div>
    </motion.div>
  );
};
