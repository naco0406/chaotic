/// <reference types="vite/client" />

declare module 'firebase/storage' {
  export interface Storage {}
  export interface StorageReference {}
  export interface UploadResult {
    metadata: any;
    ref: StorageReference;
  }

  export function getStorage(app?: any): Storage;
  export function ref(storage: Storage, path: string): StorageReference;
  export function ref(storageOrPath: StorageReference, path: string): StorageReference;
  export function uploadBytes(
    ref: StorageReference,
    data: Blob | Uint8Array | ArrayBuffer,
    metadata?: any
  ): Promise<UploadResult>;
  export function getDownloadURL(ref: StorageReference): Promise<string>;
}

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_FIREBASE_API_KEY: string;
  readonly NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  readonly NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  readonly NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  readonly NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly NEXT_PUBLIC_FIREBASE_APP_ID: string;
  readonly NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
