import { createContext, useContext, useState, ReactNode } from "react";
import type { SoilAnalysisResult } from "@workspace/api-client-react";

interface ResultContextType {
  result: SoilAnalysisResult | null;
  setResult: (result: SoilAnalysisResult | null) => void;
}

const ResultContext = createContext<ResultContextType | undefined>(undefined);

export function ResultProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<SoilAnalysisResult | null>(null);

  return (
    <ResultContext.Provider value={{ result, setResult }}>
      {children}
    </ResultContext.Provider>
  );
}

export function useResultStore() {
  const context = useContext(ResultContext);
  if (context === undefined) {
    throw new Error("useResultStore must be used within a ResultProvider");
  }
  return context;
}
