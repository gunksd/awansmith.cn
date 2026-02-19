"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { Section, Website } from "@/lib/types";

interface DataContextType {
  sections: Section[];
  websites: Website[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const DataContext = createContext<DataContextType>({
  sections: [],
  websites: [],
  loading: false,
  error: null,
  refresh: () => {},
});

export const useNavigationData = () => useContext(DataContext);

interface DataProviderProps {
  children: ReactNode;
  initialSections?: Section[];
  initialWebsites?: Website[];
}

export function DataProvider({
  children,
  initialSections,
  initialWebsites,
}: DataProviderProps) {
  const [sections, setSections] = useState<Section[]>(initialSections ?? []);
  const [websites, setWebsites] = useState<Website[]>(initialWebsites ?? []);
  // 如果有服务端传入的初始数据，就不需要 loading 状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/data", { signal: abortRef.current.signal });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "获取数据失败");
      }
      const data = await res.json();
      if (!Array.isArray(data.sections) || !Array.isArray(data.websites)) {
        throw new Error("数据格式错误");
      }
      setSections(data.sections);
      setWebsites(data.websites);
      setError(null);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "未知错误";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return (
    <DataContext.Provider
      value={{ sections, websites, loading, error, refresh }}
    >
      {children}
    </DataContext.Provider>
  );
}
