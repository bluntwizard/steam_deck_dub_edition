/**
 * Type definitions for React components
 */
import { ReactNode, CSSProperties } from 'react';
import { Game, UserProfile, PerformanceMetrics, CompatibilityRating } from './app';

// Button component props
export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isFullWidth?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// Card component props
export interface CardProps {
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  isHoverable?: boolean;
  className?: string;
  style?: CSSProperties;
}

// GameCard component props
export interface GameCardProps {
  game: Game;
  onClick?: (game: Game) => void;
  isSelected?: boolean;
  showDetails?: boolean;
  className?: string;
}

// GameDetails component props
export interface GameDetailsProps {
  game: Game;
  onBack?: () => void;
  onInstall?: (game: Game) => void;
  onUninstall?: (game: Game) => void;
  onPlay?: (game: Game) => void;
  isInstalling?: boolean;
  installProgress?: number;
  className?: string;
}

// Header component props
export interface HeaderProps {
  title?: string;
  user?: UserProfile;
  onUserMenuClick?: () => void;
  onNavigationToggle?: () => void;
  isOffline?: boolean;
  className?: string;
}

// Navigation component props
export interface NavigationProps {
  activeItem?: string;
  isCollapsed?: boolean;
  onItemClick?: (item: string) => void;
  items?: NavigationItem[];
  className?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: ReactNode;
  url?: string;
  badge?: number | string;
}

// Modal component props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

// Input component props
export interface InputProps {
  id: string;
  name: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'search';
  isDisabled?: boolean;
  isRequired?: boolean;
  isError?: boolean;
  errorMessage?: string;
  helpText?: string;
  className?: string;
  autoFocus?: boolean;
}

// Select component props
export interface SelectProps {
  id: string;
  name: string;
  label?: string;
  value?: string | string[];
  options: SelectOption[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  isMulti?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isError?: boolean;
  errorMessage?: string;
  helpText?: string;
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}

// Checkbox component props
export interface CheckboxProps {
  id: string;
  name: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  isDisabled?: boolean;
  className?: string;
}

// Toggle/Switch component props
export interface ToggleProps {
  id: string;
  name: string;
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  isDisabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// Toast/Notification component props
export interface ToastProps {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  duration?: number;
  onClose?: () => void;
  isClosable?: boolean;
  className?: string;
}

// PerformanceMonitor component props
export interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  showDetailed?: boolean;
  onToggleDetails?: () => void;
  className?: string;
}

// CompatibilityBadge component props
export interface CompatibilityBadgeProps {
  rating: CompatibilityRating;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// SearchBar component props
export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

// Pagination component props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

// Dropdown component props
export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

// Tabs component props
export interface TabsProps {
  tabs: Tab[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  isDisabled?: boolean;
}

// Progress component props
export interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  isIndeterminate?: boolean;
  className?: string;
}

// Layout component props
export interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  sidebar?: ReactNode;
  isSidebarOpen?: boolean;
  className?: string;
} 