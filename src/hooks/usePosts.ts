import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import type { Draft, Post } from '../types/post';
import { STORAGE_KEYS } from '../utils/storage';
import { useLocalStorage } from './useLocalStorage';

export const usePosts = () => {
  const queryClient = useQueryClient();
  const [posts, setPosts] = useLocalStorage<Post[]>(STORAGE_KEYS.POSTS, []);

  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: () => posts,
    initialData: posts,
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const newPost: Post = {
        id: nanoid(),
        title: data.title,
        content: data.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      return newPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title: string;
      content: string;
    }) => {
      const updatedPosts = posts.map((post) =>
        post.id === id
          ? { ...post, ...data, updatedAt: new Date().toISOString() }
          : post
      );
      setPosts(updatedPosts);
      return updatedPosts.find((p) => p.id === id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const updatedPosts = posts.filter((post) => post.id !== id);
      setPosts(updatedPosts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    posts: postsQuery.data || [],
    isLoading: postsQuery.isLoading,
    createPost: createPostMutation.mutate,
    updatePost: updatePostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  };
};

export const useDraft = () => {
  const [draft, setDraft] = useLocalStorage<Draft | null>(
    STORAGE_KEYS.DRAFT,
    null
  );

  const saveDraft = (title: string, content: string) => {
    setDraft({
      title,
      content,
      savedAt: new Date().toISOString(),
    });
  };

  const clearDraft = () => {
    setDraft(null);
  };

  return {
    draft,
    saveDraft,
    clearDraft,
  };
};
