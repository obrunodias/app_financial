import { createClient } from "@/lib/supabase/server";
import { Transaction } from "@/types";
import { TransactionsClient } from "@/components/transactions-client";

export default async function TransacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.ano || String(now.getFullYear()));
  const month = parseInt(params.mes || String(now.getMonth() + 1));

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0);
  const endDateStr = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

  const supabase = await createClient();
  const { data: transactions = [] } = await supabase
    .from("transactions")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDateStr)
    .order("date", { ascending: false })
    .returns<Transaction[]>();

  return (
    <TransactionsClient
      transactions={transactions || []}
      mes={month}
      ano={year}
    />
  );
}
