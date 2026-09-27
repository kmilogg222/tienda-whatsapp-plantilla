import type {
  Announcement,
  CatalogImage,
  StoreSettings,
  TrustBadge,
} from '@/types/catalog';
import {
  optionValues,
  normalizeIconName,
  type BackgroundTone,
  type CatalogFilter,
  type IconName,
  type PaletteId,
} from './contentOptions';
import { DEFAULT_LABELS, LABEL_DEFINITIONS, type StoreLabels } from './labels';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from './format';
import { toLinkTarget, type RawLinkTarget } from './sanity/mappers';
import { getPalette } from './theme/palettes';
import { normalizeGoogleAnalyticsId, normalizeMetaPixelId, normalizeSiteVerification } from './tracking';

/* ---------- Temas de la versión anterior (solo para leer datos v1) ---------- */

type LegacyThemePreset =
  | 'dark-luxury'
  | 'dark-emerald'
  | 'dark-gold'
  | 'light-minimal'
  | 'light-nature'
  | 'dark-cyber'
  | 'light-rose'
  | 'dark-velvet'
  | 'light-lavender';

/** Paleta nueva equivalente a cada tema de la versión anterior. */
const PALETTE_FROM_LEGACY: Record<LegacyThemePreset, PaletteId> = {
  'dark-luxury': 'obsidiana-indigo',
  'dark-emerald': 'esmeralda-noche',
  'dark-gold': 'negro-oro',
  'dark-cyber': 'obsidiana-indigo',
  'dark-velvet': 'ciruela-noche',
  'light-minimal': 'blanco-minimal',
  'light-nature': 'spa-menta',
  'light-rose': 'rosa-chic',
  'light-lavender': 'lavanda',
};
const LEGACY_THEMES = Object.keys(PALETTE_FROM_LEGACY) as LegacyThemePreset[];

/* ---------- Valores por defecto ---------- */

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Mi tienda',
  tagline: '',
  locale: DEFAULT_LOCALE,
  currencyCode: DEFAULT_CURRENCY,

  palette: 'blush-nude',
  backgroundTone: 'light',
  fontPairing: 'elegante',
  cornerStyle: 'soft',
  buttonStyle: 'pill',
  imageRatio: '4:5',
  mobileColumns: 2,
  cardOptions: { showBrand: true, showCategory: false, showQuickOrder: true },

  labels: DEFAULT_LABELS,

  whatsappNumber: '',
  defaultMessage: '¡Hola! Me interesa solicitar este producto desde su catálogo web:',
  messageClosing: '¿Tienen disponibilidad y cómo coordinamos el pago/envío?',
  cartEnabled: true,
  askCustomerName: true,
  askCustomerCity: true,
  askNotes: true,
  outOfStockBehavior: 'show',

  enabledFilters: ['brand', 'price', 'offers', 'tags', 'availability'],
  defaultSort: 'featured',
  pageSize: 24,

  trustBadges: [],

  announcement: {
    enabled: false,
    text: '',
    icon: 'truck',
  },
};

/* ---------- Datos crudos (tal como llegan de Sanity, incluidos campos v1) ---------- */

type Maybe<T> = T | null | undefined;

export interface RawStoreSettings {
  storeName?: Maybe<string>;
  tagline?: Maybe<string>;
  locale?: Maybe<string>;
  currencyCode?: Maybe<string>;
  currencySymbol?: Maybe<string>;
  showDecimals?: Maybe<boolean>;
  logo?: Maybe<string>;
  favicon?: Maybe<string>;
  /** Ya convertida a CatalogImage por la capa de datos */
  ogImage?: Maybe<CatalogImage>;
  palette?: Maybe<string>;
  customColorHex?: Maybe<string>;
  backgroundTone?: Maybe<string>;
  fontPairing?: Maybe<string>;
  cornerStyle?: Maybe<string>;
  buttonStyle?: Maybe<string>;
  imageRatio?: Maybe<string>;
  mobileColumns?: Maybe<string | number>;
  cardOptions?: Maybe<Partial<Record<'showBrand' | 'showCategory' | 'showQuickOrder', Maybe<boolean>>>>;
  labels?: Maybe<Partial<Record<string, Maybe<string>>>>;
  whatsappNumber?: Maybe<string>;
  defaultMessage?: Maybe<string>;
  messageClosing?: Maybe<string>;
  cartEnabled?: Maybe<boolean>;
  askCustomerName?: Maybe<boolean>;
  askCustomerCity?: Maybe<boolean>;
  askNotes?: Maybe<boolean>;
  freeShippingThreshold?: Maybe<number>;
  outOfStockBehavior?: Maybe<string>;
  enabledFilters?: Maybe<Maybe<string>[]>;
  defaultSort?: Maybe<string>;
  pageSize?: Maybe<number>;
  trustBadges?: Maybe<Maybe<{ icon?: Maybe<string>; text?: Maybe<string> }>[]>;
  instagram?: Maybe<string>;
  tiktok?: Maybe<string>;
  facebook?: Maybe<string>;
  youtube?: Maybe<string>;
  contactEmail?: Maybe<string>;
  address?: Maybe<string>;
  openingHours?: Maybe<string>;
  announcementEnabled?: Maybe<boolean>;
  shippingNotice?: Maybe<string>;
  announcementIcon?: Maybe<string>;
  announcementLink?: Maybe<RawLinkTarget>;
  googleAnalyticsId?: Maybe<string>;
  metaPixelId?: Maybe<string>;
  googleSiteVerification?: Maybe<string>;

  // Campos v1 (ocultos en el panel)
  themePreset?: Maybe<string>;
  primaryColor?: Maybe<string>;
  themeMode?: Maybe<string>;
  searchPlaceholder?: Maybe<string>;
  whatsappCtaText?: Maybe<string>;
  floatingWhatsAppTooltip?: Maybe<string>;
  emptyStateText?: Maybe<string>;
  footerText?: Maybe<string>;
}

/* ---------- Ayudantes ---------- */

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

const bool = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback);

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

const HEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const hexColor = (value: unknown): string | undefined => {
  const color = text(value);
  return color && HEX.test(color) ? color : undefined;
};

const positiveNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;

/** Campos v1 que pasaron a ser textos editables. */
const LEGACY_LABELS: Partial<Record<keyof StoreLabels, keyof RawStoreSettings>> = {
  searchPlaceholder: 'searchPlaceholder',
  orderButton: 'whatsappCtaText',
  floatingButtonTooltip: 'floatingWhatsAppTooltip',
  noResultsText: 'emptyStateText',
  footerText: 'footerText',
};

function normalizeLabels(raw: RawStoreSettings): StoreLabels {
  const labels = { ...DEFAULT_LABELS };
  for (const key of Object.keys(LABEL_DEFINITIONS) as (keyof StoreLabels)[]) {
    const legacyKey = LEGACY_LABELS[key];
    const value = text(raw.labels?.[key]) ?? (legacyKey ? text(raw[legacyKey]) : undefined);
    if (value !== undefined) labels[key] = value;
  }
  return labels;
}

function normalizePalette(raw: RawStoreSettings): PaletteId {
  const palette = oneOf<PaletteId | ''>(raw.palette, optionValues.palettes, '');
  if (palette) return palette;

  let legacy = oneOf<LegacyThemePreset | ''>(raw.themePreset, LEGACY_THEMES, '');
  if (!legacy && raw.themeMode === 'light') legacy = 'light-minimal';
  return legacy ? PALETTE_FROM_LEGACY[legacy] : DEFAULT_SETTINGS.palette;
}

/**
 * Tono de fondo para el color de marca. Si no se ha elegido (documentos
 * antiguos), se respeta si la paleta o el tema anterior eran oscuros.
 */
function normalizeBackgroundTone(raw: RawStoreSettings, palette: PaletteId): BackgroundTone {
  const fallback = getPalette(palette).mode === 'dark' ? 'dark' : DEFAULT_SETTINGS.backgroundTone;
  return oneOf(raw.backgroundTone, optionValues.backgroundTones, fallback);
}

function normalizeAnnouncement(raw: RawStoreSettings): Announcement {
  const announcementText = text(raw.shippingNotice) ?? '';
  // v1 no tenía interruptor: la franja se mostraba si había texto
  const enabled = bool(raw.announcementEnabled, announcementText !== '') && announcementText !== '';
  const link = toLinkTarget(raw.announcementLink);
  return {
    enabled,
    text: announcementText,
    icon: normalizeIconName<IconName>(raw.announcementIcon, optionValues.allIcons, DEFAULT_SETTINGS.announcement.icon),
    ...(link ? { link } : {}),
  };
}

function normalizeTrustBadges(raw: RawStoreSettings): TrustBadge[] {
  return (raw.trustBadges ?? [])
    .map((badge) => ({
      text: text(badge?.text),
      icon: normalizeIconName<IconName>(badge?.icon, optionValues.allIcons, 'badge-check'),
    }))
    .filter((badge): badge is TrustBadge => badge.text !== undefined);
}

/**
 * Convierte la configuración que llega de Sanity (o de la demo) en una
 * configuración completa: rellena los valores por defecto, descarta valores
 * desconocidos y traduce los campos de la versión anterior.
 */
export function normalizeSettings(raw: RawStoreSettings | null | undefined): StoreSettings {
  const r: RawStoreSettings = raw ?? {};
  const d = DEFAULT_SETTINGS;
  const palette = normalizePalette(r);

  const settings: StoreSettings = {
    storeName: text(r.storeName) ?? d.storeName,
    tagline: text(r.tagline) ?? d.tagline,
    locale: text(r.locale) ?? d.locale,
    currencyCode: text(r.currencyCode) ?? d.currencyCode,

    palette,
    backgroundTone: normalizeBackgroundTone(r, palette),
    fontPairing: oneOf(r.fontPairing, optionValues.fontPairings, d.fontPairing),
    cornerStyle: oneOf(r.cornerStyle, optionValues.cornerStyles, d.cornerStyle),
    buttonStyle: oneOf(r.buttonStyle, optionValues.buttonStyles, d.buttonStyle),
    imageRatio: oneOf(r.imageRatio, optionValues.imageRatios, d.imageRatio),
    mobileColumns: String(r.mobileColumns) === '1' ? 1 : String(r.mobileColumns) === '2' ? 2 : d.mobileColumns,
    cardOptions: {
      showBrand: bool(r.cardOptions?.showBrand, d.cardOptions.showBrand),
      showCategory: bool(r.cardOptions?.showCategory, d.cardOptions.showCategory),
      showQuickOrder: bool(r.cardOptions?.showQuickOrder, d.cardOptions.showQuickOrder),
    },

    labels: normalizeLabels(r),

    whatsappNumber: text(r.whatsappNumber) ?? d.whatsappNumber,
    defaultMessage: text(r.defaultMessage) ?? d.defaultMessage,
    messageClosing: text(r.messageClosing) ?? d.messageClosing,
    cartEnabled: bool(r.cartEnabled, d.cartEnabled),
    askCustomerName: bool(r.askCustomerName, d.askCustomerName),
    askCustomerCity: bool(r.askCustomerCity, d.askCustomerCity),
    askNotes: bool(r.askNotes, d.askNotes),
    outOfStockBehavior: oneOf(r.outOfStockBehavior, optionValues.outOfStockBehaviors, d.outOfStockBehavior),

    enabledFilters: Array.isArray(r.enabledFilters)
      ? r.enabledFilters.filter((f): f is CatalogFilter =>
          (optionValues.catalogFilters as readonly (string | null | undefined)[]).includes(f)
        )
      : d.enabledFilters,
    defaultSort: oneOf(r.defaultSort, optionValues.sortOptions, d.defaultSort),
    pageSize: positiveNumber(r.pageSize) ? Math.round(r.pageSize!) : d.pageSize,

    trustBadges: normalizeTrustBadges(r),
    announcement: normalizeAnnouncement(r),
  };

  // Opcionales: solo se incluyen si tienen valor
  const optional: Partial<StoreSettings> = {
    currencySymbol: text(r.currencySymbol),
    showDecimals: typeof r.showDecimals === 'boolean' ? r.showDecimals : undefined,
    logo: text(r.logo),
    favicon: text(r.favicon),
    ogImage: r.ogImage ?? undefined,
    brandColor: hexColor(r.customColorHex) ?? hexColor(r.primaryColor),
    freeShippingThreshold: positiveNumber(r.freeShippingThreshold),
    instagram: text(r.instagram),
    tiktok: text(r.tiktok),
    facebook: text(r.facebook),
    youtube: text(r.youtube),
    contactEmail: text(r.contactEmail),
    address: text(r.address),
    openingHours: text(r.openingHours),
    googleAnalyticsId: normalizeGoogleAnalyticsId(r.googleAnalyticsId),
    metaPixelId: normalizeMetaPixelId(r.metaPixelId),
    googleSiteVerification: normalizeSiteVerification(r.googleSiteVerification),
  };
  for (const [key, value] of Object.entries(optional)) {
    if (value !== undefined) (settings as unknown as Record<string, unknown>)[key] = value;
  }

  return settings;
}
