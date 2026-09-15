// data/pricing.ts
export const exteriorBasePrice = 600;
export const interiorBasePrice = 300;
export const detailsProtectionBasePrice = 250;
export const salePreparationIsRequestBased = false;

export type PricingKey = "basic" | "salePrep" | "premium" | "premium2Step";

export type BadgeTone = "accent" | "dark";
export type BadgeMode = "custom" | "savings";
export type PricingBadgeTextKey = "top" | "mostChosen" | "bestChoice";

export type IndividualServiceCategoryKey =
  | "paintCorrection"
  | "paintProtection"
  | "interiorDetailing"
  | "detailsProtection"
  | "mechanics"
  | "tuning";

export type IndividualServiceItemKey =
  | "oneStepCorrection"
  | "twoStepCorrection"
  | "hardWax"
  | "carbonCoating"
  | "ceramicCoating"
  | "grapheneCoating"
  | "interiorDetailing"
  | "heavySoilingExtra"
  | "upholsteryCleaning"
  | "leatherCleaningProtection"
  | "acCleaning"
  | "headlightRestoration"
  | "headlightPpfExtra"
  | "headlightWrapping"
  | "doorHandleProtection"
  | "rainRepellent"
  | "oilAndFilters"
  | "suspensionDiagnostics"
  | "mechanicalRepairs"
  | "stage1"
  | "ecoOff";

export interface IndividualServiceItemConfig {
  priceType: "from" | "addon" | "range" | "custom" | "link";
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  href?: string;
  target?: "_self" | "_blank";
}

export interface IndividualServiceCategoryConfig {
  items: Partial<Record<IndividualServiceItemKey, IndividualServiceItemConfig>>;
}

export type PackageBaseKey =
  | "exteriorBase"
  | "interiorBase"
  | "detailsProtectionBase";

export type PackageIncludedItem =
  | {
      kind: "base";
      key: PackageBaseKey;
    }
  | {
      kind: "service";
      category: IndividualServiceCategoryKey;
      item: IndividualServiceItemKey;
    };

export type PackageDiscount =
  | {
      type: "amount";
      value: number;
    }
  | {
      type: "percent";
      value: number;
    };

export interface PricingBadgeConfig {
  mode: BadgeMode;
  tone: BadgeTone;
  textKey?: PricingBadgeTextKey;
}

export interface PricingItemConfig {
  featured?: boolean;
  badge?: PricingBadgeConfig;
  includes: PackageIncludedItem[];
  discount?: PackageDiscount;
}

export interface CalculatedPricing {
  rawPrice: number;
  finalPrice: number;
  savings: number;
  unresolvedItems: string[];
}

export interface PricingBadgeViewModel {
  tone: BadgeTone;
  mode: BadgeMode;
  textKey?: PricingBadgeTextKey;
  savings?: number;
}

export const individualServicesConfig: Record<
  IndividualServiceCategoryKey,
  IndividualServiceCategoryConfig
> = {
  paintCorrection: {
    items: {
      oneStepCorrection: {
        priceType: "from",
        price: 600,
      },
      twoStepCorrection: {
        priceType: "from",
        price: 1100,
      },
    },
  },

  paintProtection: {
    items: {
      hardWax: {
        priceType: "addon",
        price: 200,
      },
      carbonCoating: {
        priceType: "from",
        price: 300,
      },
      ceramicCoating: {
        priceType: "from",
        price: 400,
      },
      grapheneCoating: {
        priceType: "from",
        price: 600,
      },
    },
  },

  interiorDetailing: {
    items: {
      interiorDetailing: {
        priceType: "from",
        price: 400,
      },
      heavySoilingExtra: {
        priceType: "addon",
        price: 100,
      },
      upholsteryCleaning: {
        priceType: "from",
        price: 500,
      },
      leatherCleaningProtection: {
        priceType: "custom",
      },
      acCleaning: {
        priceType: "custom",
      },
    },
  },

  detailsProtection: {
    items: {
      headlightRestoration: {
        priceType: "range",
        minPrice: 250,
        maxPrice: 300,
      },
      headlightPpfExtra: {
        priceType: "addon",
        price: 150,
      },
      headlightWrapping: {
        priceType: "custom",
      },
      doorHandleProtection: {
        priceType: "custom",
      },
      rainRepellent: {
        priceType: "from",
        price: 100,
      },
    },
  },

  mechanics: {
    items: {
      oilAndFilters: {
        priceType: "from",
        price: 100,
      },
      suspensionDiagnostics: {
        priceType: "range",
        minPrice: 50,
        maxPrice: 100,
      },
      mechanicalRepairs: {
        priceType: "custom",
      },
    },
  },

  tuning: {
    items: {
      stage1: {
        priceType: "link",
        //href: "https://example.com",
        target: "_blank",
      },
      ecoOff: {
        priceType: "link",
        //href: "https://example.com",
        target: "_blank",
      },
    },
  },
};

const basicPackageItems: PackageIncludedItem[] = [
  {
    kind: "service",
    category: "paintCorrection",
    item: "oneStepCorrection",
  },
  {
    kind: "service",
    category: "paintProtection",
    item: "hardWax",
  },
];

const salePrepPackageItems: PackageIncludedItem[] = [
  ...basicPackageItems,
  {
    kind: "service",
    category: "interiorDetailing",
    item: "interiorDetailing",
  },
];

const premiumPackageItems: PackageIncludedItem[] = [
  ...salePrepPackageItems,
  {
    kind: "service",
    category: "detailsProtection",
    item: "headlightRestoration",
  },
  {
    kind: "service",
    category: "detailsProtection",
    item: "rainRepellent",
  },
];

const premium2StepPackageItems: PackageIncludedItem[] = [
  {
    kind: "service",
    category: "paintCorrection",
    item: "twoStepCorrection",
  },
  {
    kind: "service",
    category: "paintProtection",
    item: "hardWax",
  },
  {
    kind: "service",
    category: "interiorDetailing",
    item: "interiorDetailing",
  },
  {
    kind: "service",
    category: "detailsProtection",
    item: "headlightRestoration",
  },
  {
    kind: "service",
    category: "detailsProtection",
    item: "rainRepellent",
  },
];

export const pricingConfig: Record<PricingKey, PricingItemConfig> = {
  basic: {
    includes: basicPackageItems,
    discount: {
      type: "amount",
      value: 100,
    },
  },

  salePrep: {
    includes: salePrepPackageItems,
    discount: {
      type: "amount",
      value: 200,
    },
  },

  premium: {
    includes: premiumPackageItems,
    discount: {
      type: "amount",
      value: 150,
    },
    featured: true,
  },

  premium2Step: {
    includes: premium2StepPackageItems,
    discount: {
      type: "amount",
      value: 150,
    },
  },
};

const packageBasePriceMap: Record<PackageBaseKey, number> = {
  exteriorBase: exteriorBasePrice,
  interiorBase: interiorBasePrice,
  detailsProtectionBase: detailsProtectionBasePrice,
};

function getIndividualServicePrice(
  category: IndividualServiceCategoryKey,
  item: IndividualServiceItemKey,
): number | null {
  const itemConfig = individualServicesConfig[category]?.items?.[item];

  if (!itemConfig) return null;

  switch (itemConfig.priceType) {
    case "from":
    case "addon":
      return typeof itemConfig.price === "number" ? itemConfig.price : null;

    case "range":
      if (typeof itemConfig.minPrice === "number") return itemConfig.minPrice;
      if (typeof itemConfig.maxPrice === "number") return itemConfig.maxPrice;
      return null;

    case "custom":
    case "link":
      return null;

    default:
      return null;
  }
}

function getIncludedItemPrice(item: PackageIncludedItem): number | null {
  if (item.kind === "base") {
    return packageBasePriceMap[item.key] ?? null;
  }

  return getIndividualServicePrice(item.category, item.item);
}

function getDiscountAmount(
  rawPrice: number,
  discount?: PackageDiscount,
): number {
  if (!discount) return 0;

  if (discount.type === "amount") {
    return Math.max(0, Math.min(rawPrice, discount.value));
  }

  const percentValue = Math.max(0, discount.value);
  return Math.min(rawPrice, Math.round((rawPrice * percentValue) / 100));
}

export function calculatePackagePricing(
  config: PricingItemConfig,
): CalculatedPricing {
  const unresolvedItems: string[] = [];

  const rawPrice = config.includes.reduce((sum, item) => {
    const itemPrice = getIncludedItemPrice(item);

    if (itemPrice === null) {
      if (item.kind === "base") {
        unresolvedItems.push(item.key);
      } else {
        unresolvedItems.push(`${item.category}.${item.item}`);
      }
      return sum;
    }

    return sum + itemPrice;
  }, 0);

  const savings = getDiscountAmount(rawPrice, config.discount);
  const finalPrice = Math.max(0, rawPrice - savings);

  return {
    rawPrice,
    finalPrice,
    savings,
    unresolvedItems,
  };
}

export function getPricingBadgeData(
  config: PricingItemConfig,
  calculated: CalculatedPricing,
): PricingBadgeViewModel | null {
  if (!config.badge) return null;

  if (config.badge.mode === "custom") {
    return {
      tone: config.badge.tone,
      mode: "custom",
      textKey: config.badge.textKey,
    };
  }

  if (config.badge.mode === "savings" && calculated.savings > 0) {
    return {
      tone: config.badge.tone,
      mode: "savings",
      savings: calculated.savings,
    };
  }

  return null;
}

export function formatPrice(value: number): string {
  return `${value} zł`;
}
