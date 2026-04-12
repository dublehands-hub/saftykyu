import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface SafetyItem {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  imageUri?: string;
  createdAt: number;
}

export interface AppSettings {
  emergencyPhone: string;
  isAdmin: boolean;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

export interface CategoryCustomization {
  id: string;
  title: string;
  description: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "electrical",
    title: "전기 안전",
    icon: "zap",
    color: "#f59e0b",
    description: "전기 관련 안전 수칙 및 주의사항",
  },
  {
    id: "machinery",
    title: "기계 안전",
    icon: "settings",
    color: "#3b82f6",
    description: "기계 및 장비 안전 관리 지침",
  },
  {
    id: "chemical",
    title: "화학 물질",
    icon: "droplet",
    color: "#10b981",
    description: "화학 물질 취급 및 보관 안전",
  },
  {
    id: "announcements",
    title: "공지 사항",
    icon: "bell",
    color: "#8b5cf6",
    description: "안전 관련 공지 및 알림",
  },
];

const ITEMS_KEY = "@safety_items";
const SETTINGS_KEY = "@app_settings";
const CATEGORIES_KEY = "@category_customizations";

const DEFAULT_SETTINGS: AppSettings = {
  emergencyPhone: "",
  isAdmin: false,
};

interface DataContextType {
  items: SafetyItem[];
  settings: AppSettings;
  categories: Category[];
  loading: boolean;
  addItem: (item: Omit<SafetyItem, "id" | "createdAt">) => Promise<void>;
  updateItem: (id: string, updates: Partial<SafetyItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateCategory: (id: string, title: string, description: string) => Promise<void>;
  getItemsByCategory: (categoryId: string) => SafetyItem[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SafetyItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [categoryCustomizations, setCategoryCustomizations] = useState<CategoryCustomization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [storedItems, storedSettings, storedCats] = await Promise.all([
        AsyncStorage.getItem(ITEMS_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
        AsyncStorage.getItem(CATEGORIES_KEY),
      ]);
      if (storedItems) setItems(JSON.parse(storedItems));
      if (storedSettings) setSettings(JSON.parse(storedSettings));
      if (storedCats) setCategoryCustomizations(JSON.parse(storedCats));
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const categories: Category[] = DEFAULT_CATEGORIES.map((cat) => {
    const custom = categoryCustomizations.find((c) => c.id === cat.id);
    if (custom) {
      return { ...cat, title: custom.title, description: custom.description };
    }
    return cat;
  });

  const addItem = useCallback(async (item: Omit<SafetyItem, "id" | "createdAt">) => {
    const newItem: SafetyItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    const updated = [newItem, ...items];
    setItems(updated);
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(updated));
  }, [items]);

  const updateItem = useCallback(async (id: string, updates: Partial<SafetyItem>) => {
    const updated = items.map((i) => (i.id === id ? { ...i, ...updates } : i));
    setItems(updated);
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(updated));
  }, [items]);

  const deleteItem = useCallback(async (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(updated));
  }, [items]);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }, [settings]);

  const updateCategory = useCallback(async (id: string, title: string, description: string) => {
    const existing = categoryCustomizations.filter((c) => c.id !== id);
    const updated = [...existing, { id, title, description }];
    setCategoryCustomizations(updated);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
  }, [categoryCustomizations]);

  const getItemsByCategory = useCallback(
    (categoryId: string) =>
      items
        .filter((i) => i.categoryId === categoryId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [items]
  );

  return (
    <DataContext.Provider
      value={{
        items,
        settings,
        categories,
        loading,
        addItem,
        updateItem,
        deleteItem,
        updateSettings,
        updateCategory,
        getItemsByCategory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
