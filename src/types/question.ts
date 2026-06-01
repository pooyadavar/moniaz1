export interface ImageCropPercent {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedOption {
  type: "text" | "image";
  text: string;
  imageCrop?: ImageCropPercent | null;
}

export interface ExtractedQuestion {
  questionText: string;
  options: ExtractedOption[];
  correctOption: number | null;
  hasQuestionImage: boolean;
  questionImageCrop?: ImageCropPercent | null;
  pageIndex: number;
}

export interface PagePreview {
  index: number;
  previewUrl: string;
  file: File;
  label: string;
}

export interface QuestionDraft extends ExtractedQuestion {
  id: string;
  questionCroppedUrl: string | null;
  optionCroppedUrls: (string | null)[];
  cropEditorOpen: false | "question" | number;
}

export interface ExtractApiResponse {
  success: boolean;
  data?: {
    questions: ExtractedQuestion[];
  };
  error?: string;
}
