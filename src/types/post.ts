export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Draft {
  title: string;
  content: string;
  savedAt: string;
}
