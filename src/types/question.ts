export interface ImageCropPercent {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedOption {
  type: "text" | "image";
  text: string;
  imageCrop?: ImageCropPercent | string | null;
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

export interface QuestionDraft extends Omit<ExtractedQuestion, "questionImageCrop"> {
  id: string;
  questionImageCrop: ImageCropPercent | string | null;
  questionCroppedUrl: string | null;
  optionCroppedUrls: (string | null)[];
  cropEditorOpen: false | "question" | number;
}

export interface AnswerKeyMeta {
  source: "opencv" | "gemini";
  pageIndex?: number;
  confidence?: number;
  answers?: number[];
}

export interface ExtractApiResponse {
  success: boolean;
  data?: {
    questions: ExtractedQuestion[];
    answerKey?: AnswerKeyMeta;
  };
  error?: string;
}
