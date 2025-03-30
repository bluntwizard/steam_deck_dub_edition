/**
 * Type definitions for API requests and responses
 */
import { Game, UserProfile, PerformanceMetrics } from './app';

// API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: MetaData;
}

export interface ApiError {
  code: number;
  message: string;
  details?: unknown;
}

export interface MetaData {
  page?: number;
  perPage?: number;
  totalPages?: number;
  totalItems?: number;
  timestamp: number;
}

// Authentication
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Game Library
export interface GetGamesRequest {
  page?: number;
  perPage?: number;
  sortBy?: 'title' | 'releaseDate' | 'lastPlayed' | 'playTime';
  sortDirection?: 'asc' | 'desc';
  filter?: {
    installed?: boolean;
    compatibility?: string[];
    genres?: string[];
    search?: string;
  };
}

export interface GetGameDetailsRequest {
  gameId: string;
}

export interface InstallGameRequest {
  gameId: string;
  installLocation?: string;
}

export interface InstallGameResponse {
  game: Game;
  installId: string;
  estimatedSize: number;
  estimatedTime: number;
}

export interface UninstallGameRequest {
  gameId: string;
}

export interface GameInstallProgress {
  gameId: string;
  installId: string;
  progress: number; // 0-100
  bytesDownloaded: number;
  totalBytes: number;
  currentSpeed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
  status: 'pending' | 'downloading' | 'installing' | 'paused' | 'failed' | 'completed';
  errorMessage?: string;
}

// User Profile
export interface UpdateUserProfileRequest {
  username?: string;
  email?: string;
  avatar?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
    language?: string;
    accessibility?: {
      highContrast?: boolean;
      fontSize?: string;
      reduceAnimations?: boolean;
    };
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Performance Monitoring
export interface SubmitPerformanceMetricsRequest {
  metrics: PerformanceMetrics[];
}

export interface GetPerformanceHistoryRequest {
  gameId?: string;
  startDate?: string;
  endDate?: string;
  resolution?: 'minute' | 'hour' | 'day';
}

export interface GetPerformanceHistoryResponse {
  metrics: PerformanceMetrics[];
  summary: {
    averageFps: number;
    averageCpuUsage: number;
    averageGpuUsage: number;
    averageMemoryUsage: number;
    timeRange: {
      start: string;
      end: string;
    };
  };
}

// Friends & Social
export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy' | 'playing';
  currentGame?: {
    id: string;
    title: string;
  };
  lastSeen?: string;
}

export interface GetFriendsRequest {
  status?: 'online' | 'offline' | 'all';
}

export interface GetFriendsResponse {
  friends: Friend[];
}

export interface SendFriendRequestRequest {
  username: string;
}

export interface FriendRequest {
  id: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  recipient: {
    id: string;
    username: string;
    avatar?: string;
  };
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface GetFriendRequestsResponse {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}

// Store
export interface GetStoreGamesRequest {
  page?: number;
  perPage?: number;
  sortBy?: 'title' | 'releaseDate' | 'price' | 'popularity';
  sortDirection?: 'asc' | 'desc';
  filter?: {
    price?: {
      min?: number;
      max?: number;
    };
    onSale?: boolean;
    genres?: string[];
    tags?: string[];
    compatibility?: string[];
    search?: string;
  };
}

export interface StoreGame extends Game {
  price: number;
  originalPrice?: number;
  discount?: number;
  isFree?: boolean;
  inLibrary: boolean;
}

export interface GetStoreGamesResponse {
  games: StoreGame[];
  featuredGames?: StoreGame[];
  meta: MetaData;
}

export interface PurchaseGameRequest {
  gameId: string;
  paymentMethodId: string;
}

export interface PurchaseGameResponse {
  game: Game;
  transaction: {
    id: string;
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed';
    date: string;
  };
} 