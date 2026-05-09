export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export const INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Presente",
  "Outros",
] as const;

export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Roupas",
  "Contas",
  "Assinaturas",
  "Outros",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: "#ef4444",
  Transporte: "#f97316",
  Moradia: "#eab308",
  Saúde: "#22c55e",
  Educação: "#3b82f6",
  Lazer: "#a855f7",
  Roupas: "#ec4899",
  Contas: "#14b8a6",
  Assinaturas: "#6366f1",
  Outros: "#94a3b8",
  Salário: "#22c55e",
  Freelance: "#3b82f6",
  Investimentos: "#a855f7",
  Presente: "#ec4899",
};
