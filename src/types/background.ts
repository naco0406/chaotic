export interface ImageElement {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export interface BackgroundSettings {
  backgroundColor: string;
  showGrid: boolean;
  gridSize: number;
}

export interface BackgroundConfig extends BackgroundSettings {
  images: ImageElement[];
  uploadedImages: string[];
}
