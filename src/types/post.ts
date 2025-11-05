export interface Post {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Draft {
  title: string;
  author: string;
  content: string;
  savedAt: string;
}
