import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import type { Draft, Post } from '../types/post';
import { db } from '../lib/firebase';
import { STORAGE_KEYS } from '../utils/storage';
import { useLocalStorage } from './useLocalStorage';

const postsCollection = collection(db, 'posts');
const orderedPostsQuery = query(postsCollection, orderBy('createdAt', 'desc'));

const normalizeTimestamp = (value: unknown, fallback: string): string => {
  if (typeof value === 'string') return value;
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return fallback;
};

const mapDocsToPosts = (docs: Awaited<ReturnType<typeof getDocs>>['docs']): Post[] => {
  return docs.map((snapshot) => {
    const data = snapshot.data();
    const createdAt = normalizeTimestamp(data.createdAt, new Date().toISOString());
    return {
      id: snapshot.id,
      title: typeof data.title === 'string' && data.title.trim() ? data.title : '마음 한 조각',
      author:
        typeof data.author === 'string' && data.author.trim()
          ? data.author
          : '이름 없는 친구',
      content: typeof data.content === 'string' ? data.content : '',
      createdAt,
      updatedAt: normalizeTimestamp(data.updatedAt, createdAt),
    } satisfies Post;
  });
};

const fetchPosts = async (): Promise<Post[]> => {
  try {
    const snapshot = await getDocs(orderedPostsQuery);
    return mapDocsToPosts(snapshot.docs);
  } catch (error) {
    console.error('Failed to load posts', error);
    return [];
  }
};

export const usePosts = () => {
  const queryClient = useQueryClient();

  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    placeholderData: [],
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const unsubscribe = onSnapshot(orderedPostsQuery, (snapshot) => {
      queryClient.setQueryData(['posts'], mapDocsToPosts(snapshot.docs));
    });

    return unsubscribe;
  }, [queryClient]);

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; author: string; content: string }) => {
      const timestamp = new Date().toISOString();
      const payload = {
        title: data.title,
        author: data.author,
        content: data.content,
        createdAt: timestamp,
        updatedAt: timestamp,
      } as const;
      const docRef = await addDoc(postsCollection, payload);
      return { id: docRef.id, ...payload } satisfies Post;
    },
    onSuccess: (post) => {
      queryClient.setQueryData<Post[]>(['posts'], (prev = []) => {
        const filtered = prev.filter((existing) => existing.id !== post.id);
        return [post, ...filtered];
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; author: string; content: string }) => {
      const updatedAt = new Date().toISOString();
      const docRef = doc(db, 'posts', data.id);
      await updateDoc(docRef, {
        title: data.title,
        author: data.author,
        content: data.content,
        updatedAt,
      });
      return { ...data, updatedAt };
    },
    onSuccess: (post) => {
      queryClient.setQueryData<Post[]>(['posts'], (prev = []) =>
        prev.map((existing) => (existing.id === post.id ? { ...existing, ...post } : existing))
      );
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'posts', id));
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Post[]>(['posts'], (prev = []) =>
        prev.filter((post) => post.id !== id)
      );
    },
  });

  return {
    posts: (postsQuery.data || []).map((post) => ({
      ...post,
      author: post.author || '이름 없는 친구',
    })),
    isLoading: postsQuery.status === 'pending',
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

  const saveDraft = (payload: { title: string; author: string; content: string }) => {
    setDraft({
      ...payload,
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
