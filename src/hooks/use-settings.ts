import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NavigationType = 'sidebar' | 'bottom';
type ViewMode = 'grid' | 'list' | 'list-no-image';
type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';
type DashboardLayout = 'metrics' | 'cards';
type InventoryViewMode = 'grid' | 'list';
type ApprovalDetailView = 'expanded' | 'collapsed';

type ProductCardField = {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
};

type DashboardVisibility = {
  [key: string]: boolean;
};

type ApprovalSettings = {
  sales: boolean;
  payments: boolean;
  expenses: boolean;
  returns: boolean;
  products: boolean;
  inventory: boolean;
};

interface SettingsState {
  navigationType: NavigationType;
  defaultViewMode: ViewMode;
  defaultItemsPerPage: number;
  defaultSortOption: SortOption;
  dashboardLayout: DashboardLayout;
  dashboardOrder: string[];
  dashboardCards: DashboardVisibility;
  dashboardMetrics: DashboardVisibility;
  approvalSettings: ApprovalSettings;
  inventoryViewMode: InventoryViewMode;
  approvalDetailView: ApprovalDetailView;
  productCardFields: ProductCardField[];
  setNavigationType: (type: NavigationType) => void;
  setDefaultViewMode: (mode: ViewMode) => void;
  setDefaultItemsPerPage: (count: number) => void;
  setDefaultSortOption: (option: SortOption) => void;
  setDashboardLayout: (layout: DashboardLayout) => void;
  setDashboardOrder: (order: string[]) => void;
  setDashboardCards: (cards: DashboardVisibility) => void;
  setDashboardMetrics: (metrics: DashboardVisibility) => void;
  setApprovalSettings: (settings: Partial<ApprovalSettings>) => void;
  setInventoryViewMode: (mode: InventoryViewMode) => void;
  setApprovalDetailView: (view: ApprovalDetailView) => void;
  updateProductCardField: (id: string, updates: Partial<ProductCardField>) => void;
  reorderProductCardFields: (fields: ProductCardField[]) => void;
}

const defaultProductCardFields: ProductCardField[] = [
  { id: 'name', label: 'Ürün Adı', enabled: true, order: 0 },
  { id: 'code', label: 'Ürün Kodu', enabled: true, order: 1 },
  { id: 'barcode', label: 'Barkod', enabled: true, order: 2 },
  { id: 'brand', label: 'Marka', enabled: true, order: 3 },
  { id: 'packaging', label: 'Ambalaj', enabled: true, order: 4 },
  { id: 'stock', label: 'Stok', enabled: true, order: 5 },
];

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      navigationType: 'sidebar',
      defaultViewMode: 'grid',
      defaultItemsPerPage: 25,
      defaultSortOption: 'name-asc',
      dashboardLayout: 'metrics',
      dashboardOrder: [
        'dashboard',
        'customers',
        'sales',
        'products',
        'payments',
        'returns',
        'daily-report',
        'approvals',
        'settings'
      ],
      dashboardCards: {},
      dashboardMetrics: {},
      approvalSettings: {
        sales: true,
        payments: true,
        expenses: true,
        returns: true,
        products: true,
        inventory: true,
      },
      inventoryViewMode: 'grid',
      productCardFields: defaultProductCardFields,
      setNavigationType: (type) => set({ navigationType: type }),
      setDefaultViewMode: (mode) => set({ defaultViewMode: mode }),
      setDefaultItemsPerPage: (count) => set({ defaultItemsPerPage: count }),
      setDefaultSortOption: (option) => set({ defaultSortOption: option }),
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      setDashboardOrder: (order) => set({ dashboardOrder: order }),
      setDashboardCards: (cards) => set({ dashboardCards: cards }),
      setDashboardMetrics: (metrics) => set({ dashboardMetrics: metrics }),
      setApprovalSettings: (settings) => set((state) => ({
        approvalSettings: { ...state.approvalSettings, ...settings }
      })),
      setInventoryViewMode: (mode) => set({ inventoryViewMode: mode }),
      updateProductCardField: (id, updates) => set((state) => ({
        productCardFields: state.productCardFields.map(field =>
          field.id === id ? { ...field, ...updates } : field
        ),
      })),
      reorderProductCardFields: (fields) => set({ productCardFields: fields }),
    }),
    {
      name: 'settings-storage',
    }
  )
);