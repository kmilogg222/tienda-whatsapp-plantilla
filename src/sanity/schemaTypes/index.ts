import { productType } from './productType';
import { categoryType } from './categoryType';
import { brandType } from './brandType';
import { storeSettingsType } from './storeSettingsType';
import { homePageType } from './homePageType';
import { productVariantType } from './objects/productVariant';
import { infoSectionType } from './objects/infoSection';
import { trustBadgeType } from './objects/trustBadge';
import { linkTargetType } from './objects/linkTarget';
import { storeLabelsType } from './objects/storeLabels';
import { homeSectionTypes } from './objects/homeSections';

export const schemaTypes = [
  // Documentos
  storeSettingsType,
  homePageType,
  productType,
  categoryType,
  brandType,
  // Objetos reutilizables
  productVariantType,
  infoSectionType,
  trustBadgeType,
  linkTargetType,
  storeLabelsType,
  ...homeSectionTypes,
];
