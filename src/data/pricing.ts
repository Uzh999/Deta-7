/**
 * Prices for every individual service, and the packages built from them.
 * A package's price is never written by hand: it is the sum of its services
 * minus its discount, so changing a service price updates every package.
 */

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

type PackageIncludedItem = {
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
        price: 700,
      },
      twoStepCorrection: {
        priceType: "from",
        price: 1200,
      },
    },
  },

  paintProtection: {
    items: {
      hardWax: {
        priceType: "addon",
        price: 300,
      },
      carbonCoating: {
        priceType: "from",
        price: 400,
      },
      ceramicCoating: {
        priceType: "from",
        price: 500,
      },
      grapheneCoating: {
        priceType: "from",
        price: 700,
      },
    },
  },

  interiorDetailing: {
    items: {
      interiorDetailing: {
        priceType: "from",
        price: 500,
      },
      heavySoilingExtra: {
        priceType: "addon",
        price: 200,
      },
      upholsteryCleaning: {
        priceType: "from",
        price: 600,
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
        minPrice: 350,
        maxPrice: 400,
      },
      headlightPpfExtra: {
        priceType: "addon",
        price: 250,
      },
      headlightWrapping: {
        priceType: "custom",
      },
      doorHandleProtection: {
        priceType: "custom",
      },
      rainRepellent: {
        priceType: "from",
        price: 200,
      },
    },
  },

  mechanics: {
    items: {
      oilAndFilters: {
        priceType: "from",
        price: 200,
      },
      suspensionDiagnostics: {
        priceType: "range",
        minPrice: 150,
        maxPrice: 200,
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
    category: "paintCorrection",
    item: "oneStepCorrection",
  },
  {
    category: "paintProtection",
    item: "hardWax",
  },
];

const salePrepPackageItems: PackageIncludedItem[] = [
  ...basicPackageItems,
  {
    category: "interiorDetailing",
    item: "interiorDetailing",
  },
];

const premiumPackageItems: PackageIncludedItem[] = [
  ...salePrepPackageItems,
  {
    category: "detailsProtection",
    item: "headlightRestoration",
  },
  {
    category: "detailsProtection",
    item: "rainRepellent",
  },
];

const premium2StepPackageItems: PackageIncludedItem[] = [
  {
    category: "paintCorrection",
    item: "twoStepCorrection",
  },
  {
    category: "paintProtection",
    item: "hardWax",
  },
  {
    category: "interiorDetailing",
    item: "interiorDetailing",
  },
  {
    category: "detailsProtection",
    item: "headlightRestoration",
  },
  {
    category: "detailsProtection",
    item: "rainRepellent",
  },
];

export const pricingConfig: Record<PricingKey, PricingItemConfig> = {
  basic: {
    includes: basicPackageItems,
    discount: {
      type: "amount",
      value: 200,
    },
  },

  salePrep: {
    includes: salePrepPackageItems,
    discount: {
      type: "amount",
      value: 400,
    },
  },

  premium: {
    includes: premiumPackageItems,
    discount: {
      type: "amount",
      value: 550,
    },
    featured: true,
  },

  premium2Step: {
    includes: premium2StepPackageItems,
    discount: {
      type: "amount",
      value: 550,
    },
  },
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
    const itemPrice = getIndividualServicePrice(item.category, item.item);

    if (itemPrice === null) {
      unresolvedItems.push(`${item.category}.${item.item}`);
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
