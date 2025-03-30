/**
 * Core application types for Steam Deck DUB Edition
 */

// User profile types
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  accessibility: AccessibilitySettings;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  reduceAnimations: boolean;
}

// Game library types
export interface Game {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  backgroundImage?: string;
  installSize: number; // in MB
  installLocation?: string;
  isInstalled: boolean;
  lastPlayed?: Date;
  totalPlaytime: number; // in minutes
  compatibility: CompatibilityRating;
  genres: string[];
  tags: string[];
  releaseDate: Date;
  developer: string;
  publisher: string;
}

export type CompatibilityRating = 'verified' | 'playable' | 'unsupported' | 'unknown';

// Performance monitoring types
export interface PerformanceMetrics {
  fps: number;
  cpuUsage: number; // percentage
  gpuUsage: number; // percentage
  memoryUsage: number; // in MB
  temperatureCPU: number; // in Celsius
  temperatureGPU: number; // in Celsius
  batteryLevel: number; // percentage
  batteryTimeRemaining: number; // in minutes
  timestamp: Date;
}

// Application state types
export interface AppState {
  currentUser?: UserProfile;
  gameLibrary: Game[];
  installedGames: Game[];
  performanceHistory: PerformanceMetrics[];
  isOnline: boolean;
  currentView: ViewType;
  settings: ApplicationSettings;
  errors: AppError[];
}

export type ViewType = 'library' | 'store' | 'downloads' | 'friends' | 'settings' | 'details';

export interface ApplicationSettings {
  userPreferences: UserPreferences;
  systemSettings: SystemSettings;
  networkSettings: NetworkSettings;
}

export interface SystemSettings {
  powerMode: 'performance' | 'balanced' | 'battery';
  storageLocations: string[];
  autoUpdateGames: boolean;
  enableBackgroundDownloads: boolean;
}

export interface NetworkSettings {
  downloadLimit?: number; // in KB/s
  enableBackgroundDownloads: boolean;
  proxySettings?: ProxySettings;
}

export interface ProxySettings {
  enabled: boolean;
  host: string;
  port: number;
  requiresAuth: boolean;
  username?: string;
  password?: string;
}

export interface AppError {
  id: string;
  message: string;
  stackTrace?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
} 