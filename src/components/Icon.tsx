import React from 'react';
import {
  Baby,
  BadgeCheck,
  Banknote,
  Bath,
  Brush,
  Clock,
  CreditCard,
  Droplet,
  Flame,
  Flower2,
  Gem,
  Gift,
  Heart,
  Leaf,
  type LucideIcon,
  MapPin,
  MessageCircle,
  Moon,
  Package,
  Palette,
  Phone,
  RotateCcw,
  Scissors,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Smile,
  Sparkles,
  SprayCan,
  Star,
  Sun,
  Tag,
  Truck,
} from 'lucide-react';
import type { IconName } from '@/lib/contentOptions';

/** Íconos de la lista cerrada del panel (CATEGORY_ICONS + SERVICE_ICONS). */
export const ICONS: Record<IconName, LucideIcon> = {
  truck: Truck,
  package: Package,
  'credit-card': CreditCard,
  banknote: Banknote,
  'shield-check': ShieldCheck,
  'badge-check': BadgeCheck,
  'rotate-ccw': RotateCcw,
  clock: Clock,
  'map-pin': MapPin,
  phone: Phone,
  'message-circle': MessageCircle,
  flame: Flame,
  sparkles: Sparkles,
  heart: Heart,
  droplet: Droplet,
  palette: Palette,
  scissors: Scissors,
  'flower-2': Flower2,
  sun: Sun,
  moon: Moon,
  gem: Gem,
  brush: Brush,
  'spray-can': SprayCan,
  bath: Bath,
  baby: Baby,
  shirt: Shirt,
  gift: Gift,
  star: Star,
  leaf: Leaf,
  smile: Smile,
  'shopping-bag': ShoppingBag,
  tag: Tag,
};

interface IconProps {
  name: string | undefined;
  size?: number;
  /** Ícono si `name` no está en la lista */
  fallback?: LucideIcon;
}

/** Ícono decorativo (aria-hidden) a partir de su nombre del panel. */
export const Icon: React.FC<IconProps> = ({ name, size = 16, fallback }) => {
  const Component = (name && ICONS[name as IconName]) || fallback;
  return Component ? <Component size={size} aria-hidden="true" /> : null;
};
