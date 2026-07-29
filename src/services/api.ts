const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const buildAiAssetUrl = (value: unknown): string | null => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const match = raw.match(/\/assets\/([^/?#]+)/);
  const fileId = match?.[1] || raw;
  if (!/^[0-9a-f-]{32,36}$/i.test(fileId)) return null;
  return `${API_BASE_URL}/api/ai-assets/${encodeURIComponent(fileId)}`;
};

export interface ApiUser {
  id: number;
  fullName: string;
  phone: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: ApiUser;
  error?: string;
}

export interface ExtractionSessionListItem {
  id: number;
  title: string | null;
  originalFilename: string | null;
  fileMime: string | null;
  moniazJobId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractionSessionDetail extends ExtractionSessionListItem {
  aiOutputJson: unknown;
  aiOutputText: string;
  currentOutputJson: unknown;
  currentOutputText: string;
  errorJson: unknown;
}

export interface ExtractionListResponse {
  success: boolean;
  sessions: ExtractionSessionListItem[];
  error?: string;
}

export interface ExtractionDetailResponse {
  success: boolean;
  session: ExtractionSessionDetail;
  changed?: boolean;
  error?: string;
}

export interface CreateExtractionResponse {
  success: boolean;
  sessionId: number;
  jobId: string;
  status: string;
  createdAt?: string;
  error?: string;
}

const parseJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> => {
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const body = await parseJson<T & { error?: string }>(response);

  if (!response.ok) {
    throw new Error(body.error || `HTTP ${response.status}`);
  }

  return body;
};

export const postJson = <T>(
  path: string,
  payload: unknown,
  token?: string | null,
) =>
  apiRequest<T>(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    token,
  );
