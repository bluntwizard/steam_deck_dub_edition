/**
 * Type definitions for state management
 */
import { Game, UserProfile, PerformanceMetrics, AppError } from './app';
import { Friend, FriendRequest, GameInstallProgress } from './api';

// Root state
export interface RootState {
  auth: AuthState;
  games: GamesState;
  ui: UIState;
  performance: PerformanceState;
  social: SocialState;
  settings: SettingsState;
  errors: ErrorsState;
}

// Auth state
export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
export enum AuthActionTypes {
  LOGIN_REQUEST = 'auth/loginRequest',
  LOGIN_SUCCESS = 'auth/loginSuccess',
  LOGIN_FAILURE = 'auth/loginFailure',
  LOGOUT = 'auth/logout',
  REFRESH_TOKEN_REQUEST = 'auth/refreshTokenRequest',
  REFRESH_TOKEN_SUCCESS = 'auth/refreshTokenSuccess',
  REFRESH_TOKEN_FAILURE = 'auth/refreshTokenFailure',
  UPDATE_PROFILE_REQUEST = 'auth/updateProfileRequest',
  UPDATE_PROFILE_SUCCESS = 'auth/updateProfileSuccess',
  UPDATE_PROFILE_FAILURE = 'auth/updateProfileFailure',
}

// Games state
export interface GamesState {
  library: Game[];
  installedGames: Game[];
  currentGame: Game | null;
  installProgress: Record<string, GameInstallProgress>;
  isLoading: boolean;
  error: string | null;
}

// Games actions
export enum GamesActionTypes {
  FETCH_GAMES_REQUEST = 'games/fetchGamesRequest',
  FETCH_GAMES_SUCCESS = 'games/fetchGamesSuccess',
  FETCH_GAMES_FAILURE = 'games/fetchGamesFailure',
  FETCH_GAME_DETAILS_REQUEST = 'games/fetchGameDetailsRequest',
  FETCH_GAME_DETAILS_SUCCESS = 'games/fetchGameDetailsSuccess',
  FETCH_GAME_DETAILS_FAILURE = 'games/fetchGameDetailsFailure',
  INSTALL_GAME_REQUEST = 'games/installGameRequest',
  INSTALL_GAME_SUCCESS = 'games/installGameSuccess',
  INSTALL_GAME_FAILURE = 'games/installGameFailure',
  UNINSTALL_GAME_REQUEST = 'games/uninstallGameRequest',
  UNINSTALL_GAME_SUCCESS = 'games/uninstallGameSuccess',
  UNINSTALL_GAME_FAILURE = 'games/uninstallGameFailure',
  UPDATE_INSTALL_PROGRESS = 'games/updateInstallProgress',
  LAUNCH_GAME = 'games/launchGame',
  EXIT_GAME = 'games/exitGame',
}

// UI state
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  currentView: string;
  modals: {
    [key: string]: boolean;
  };
  toasts: Toast[];
  searchQuery: string;
  isLoading: boolean;
}

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  duration?: number;
  isClosable?: boolean;
}

// UI actions
export enum UIActionTypes {
  SET_THEME = 'ui/setTheme',
  TOGGLE_SIDEBAR = 'ui/toggleSidebar',
  SET_CURRENT_VIEW = 'ui/setCurrentView',
  OPEN_MODAL = 'ui/openModal',
  CLOSE_MODAL = 'ui/closeModal',
  ADD_TOAST = 'ui/addToast',
  REMOVE_TOAST = 'ui/removeToast',
  SET_SEARCH_QUERY = 'ui/setSearchQuery',
  SET_LOADING = 'ui/setLoading',
}

// Performance state
export interface PerformanceState {
  currentMetrics: PerformanceMetrics | null;
  history: PerformanceMetrics[];
  isMonitoring: boolean;
  showDetailedView: boolean;
}

// Performance actions
export enum PerformanceActionTypes {
  UPDATE_METRICS = 'performance/updateMetrics',
  ADD_METRICS_TO_HISTORY = 'performance/addMetricsToHistory',
  CLEAR_HISTORY = 'performance/clearHistory',
  START_MONITORING = 'performance/startMonitoring',
  STOP_MONITORING = 'performance/stopMonitoring',
  TOGGLE_DETAILED_VIEW = 'performance/toggleDetailedView',
}

// Social state
export interface SocialState {
  friends: Friend[];
  onlineFriends: Friend[];
  friendRequests: {
    incoming: FriendRequest[];
    outgoing: FriendRequest[];
  };
  isLoading: boolean;
  error: string | null;
}

// Social actions
export enum SocialActionTypes {
  FETCH_FRIENDS_REQUEST = 'social/fetchFriendsRequest',
  FETCH_FRIENDS_SUCCESS = 'social/fetchFriendsSuccess',
  FETCH_FRIENDS_FAILURE = 'social/fetchFriendsFailure',
  FETCH_FRIEND_REQUESTS_REQUEST = 'social/fetchFriendRequestsRequest',
  FETCH_FRIEND_REQUESTS_SUCCESS = 'social/fetchFriendRequestsSuccess',
  FETCH_FRIEND_REQUESTS_FAILURE = 'social/fetchFriendRequestsFailure',
  SEND_FRIEND_REQUEST = 'social/sendFriendRequest',
  ACCEPT_FRIEND_REQUEST = 'social/acceptFriendRequest',
  DECLINE_FRIEND_REQUEST = 'social/declineFriendRequest',
  REMOVE_FRIEND = 'social/removeFriend',
  UPDATE_FRIEND_STATUS = 'social/updateFriendStatus',
}

// Settings state
export interface SettingsState {
  general: {
    language: string;
    startMinimized: boolean;
    closeToTray: boolean;
    autoStart: boolean;
    autoUpdate: boolean;
  };
  performance: {
    powerMode: 'performance' | 'balanced' | 'battery';
    gpuPreference: 'auto' | 'integrated' | 'discrete';
    fpsLimit: number | null;
  };
  downloads: {
    downloadLocation: string;
    maxDownloadSpeed: number | null;
    downloadDuringGameplay: boolean;
    autoInstallUpdates: boolean;
  };
  notifications: {
    friendRequests: boolean;
    friendOnline: boolean;
    gameUpdates: boolean;
    sales: boolean;
  };
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'x-large';
    reduceAnimations: boolean;
    screenReader: boolean;
  };
  isLoading: boolean;
  error: string | null;
}

// Settings actions
export enum SettingsActionTypes {
  UPDATE_GENERAL_SETTINGS = 'settings/updateGeneralSettings',
  UPDATE_PERFORMANCE_SETTINGS = 'settings/updatePerformanceSettings',
  UPDATE_DOWNLOAD_SETTINGS = 'settings/updateDownloadSettings',
  UPDATE_NOTIFICATION_SETTINGS = 'settings/updateNotificationSettings',
  UPDATE_ACCESSIBILITY_SETTINGS = 'settings/updateAccessibilitySettings',
  RESET_SETTINGS = 'settings/resetSettings',
  IMPORT_SETTINGS = 'settings/importSettings',
  EXPORT_SETTINGS = 'settings/exportSettings',
  FETCH_SETTINGS_REQUEST = 'settings/fetchSettingsRequest',
  FETCH_SETTINGS_SUCCESS = 'settings/fetchSettingsSuccess',
  FETCH_SETTINGS_FAILURE = 'settings/fetchSettingsFailure',
}

// Errors state
export interface ErrorsState {
  errors: AppError[];
  hasUnreadErrors: boolean;
}

// Errors actions
export enum ErrorsActionTypes {
  ADD_ERROR = 'errors/addError',
  REMOVE_ERROR = 'errors/removeError',
  MARK_ERRORS_AS_READ = 'errors/markErrorsAsRead',
  CLEAR_ALL_ERRORS = 'errors/clearAllErrors',
}

// Action creators types
export interface Action<T, P = void> {
  type: T;
  payload: P;
}

export type AuthAction =
  | Action<AuthActionTypes.LOGIN_REQUEST, { username: string; password: string; rememberMe?: boolean }>
  | Action<AuthActionTypes.LOGIN_SUCCESS, { user: UserProfile; token: string; refreshToken: string; tokenExpiry: number }>
  | Action<AuthActionTypes.LOGIN_FAILURE, { error: string }>
  | Action<AuthActionTypes.LOGOUT>
  | Action<AuthActionTypes.REFRESH_TOKEN_REQUEST, { refreshToken: string }>
  | Action<AuthActionTypes.REFRESH_TOKEN_SUCCESS, { token: string; refreshToken: string; tokenExpiry: number }>
  | Action<AuthActionTypes.REFRESH_TOKEN_FAILURE, { error: string }>
  | Action<AuthActionTypes.UPDATE_PROFILE_REQUEST, { profile: Partial<UserProfile> }>
  | Action<AuthActionTypes.UPDATE_PROFILE_SUCCESS, { user: UserProfile }>
  | Action<AuthActionTypes.UPDATE_PROFILE_FAILURE, { error: string }>;

// Thunk return types
export type ThunkResult<R> = ThunkAction<R, RootState, undefined, any>;
export type ThunkAction<R, S, E, A> = (dispatch: Dispatch<A>, getState: () => S, extraArgument: E) => R;
export type Dispatch<A> = (action: A) => A; 