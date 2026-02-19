"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
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
  const hasInitialData = !!(initialSections?.length || initialWebsites?.length);
  const [sections, setSections] = useState<Section[]>(initialSections ?? []);
  const [websites, setWebsites] = useState<Website[]>(initialWebsites ?? []);
  // 有服务端数据就不转圈，没有就需要客户端加载
  const [loading, setLoading] = useState(!hasInitialData);
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

  // 如果服务端没拿到数据，回退到客户端获取
  useEffect(() => {
    if (!hasInitialData) {
      loadData();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [hasInitialData, loadData]);

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
