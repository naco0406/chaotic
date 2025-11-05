import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import type { Draft, Post } from '../types/post';
import { db } from '../lib/firebase';

const postsCollection = collection(db, 'posts');
const orderedPostsQuery = query(postsCollection, orderBy('createdAt', 'desc'));
const draftDocRef = doc(db, 'drafts', 'default');

const normalizeTimestamp = (value: unknown, fallback: string): string => {
  if (typeof value === 'string') return value;
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return fallback;
};

const normalizeDraft = (data?: Partial<Draft>): Draft => ({
  title: typeof data?.title === 'string' ? data.title : '',
  author: typeof data?.author === 'string' ? data.author : '',
  content: typeof data?.content === 'string' ? data.content : '',
  savedAt:
    typeof data?.savedAt === 'string'
      ? data.savedAt
      : new Date().toISOString(),
});

type FirestorePostData = {
  title?: unknown;
  author?: unknown;
  content?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isString = (value: unknown): value is string => typeof value === 'string';

const mapDocsToPosts = (docs: Awaited<ReturnType<typeof getDocs>>['docs']): Post[] => {
  return docs.map((snapshot) => {
    const data = snapshot.data() as FirestorePostData;
    const createdAt = normalizeTimestamp(data.createdAt, new Date().toISOString());
    return {
      id: snapshot.id,
      title: isNonEmptyString(data.title) ? data.title : '마음 한 조각',
      author: isNonEmptyString(data.author) ? data.author : '이름 없는 친구',
      content: isString(data.content) ? data.content : '',
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

const fetchDraft = async (): Promise<Draft | null> => {
  try {
    const snapshot = await getDoc(draftDocRef);
    if (!snapshot.exists()) {
      return null;
    }
    return normalizeDraft(snapshot.data() as Partial<Draft>);
  } catch (error) {
    console.error('Failed to load draft', error);
    return null;
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
  const queryClient = useQueryClient();

  const draftQuery = useQuery({
    queryKey: ['draft'],
    queryFn: fetchDraft,
    placeholderData: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const unsubscribe = onSnapshot(
      draftDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          queryClient.setQueryData(
            ['draft'],
            normalizeDraft(snapshot.data() as Partial<Draft>)
          );
        } else {
          queryClient.setQueryData(['draft'], null);
        }
      },
      (error) => {
        console.error('Draft subscription failed', error);
      }
    );

    return unsubscribe;
  }, [queryClient]);

  const saveDraft = useCallback(
    async (payload: { title: string; author: string; content: string }) => {
      const nextDraft: Draft = {
        ...payload,
        savedAt: new Date().toISOString(),
      };
      try {
        await setDoc(draftDocRef, nextDraft);
        queryClient.setQueryData(['draft'], nextDraft);
      } catch (error) {
        console.error('Failed to save draft', error);
      }
    },
    [queryClient]
  );

  const clearDraft = useCallback(async () => {
    try {
      await deleteDoc(draftDocRef);
    } catch (error) {
      console.error('Failed to clear draft', error);
    } finally {
      queryClient.setQueryData(['draft'], null);
    }
  }, [queryClient]);

  return {
    draft: draftQuery.data ?? null,
    saveDraft,
    clearDraft,
  };
};
