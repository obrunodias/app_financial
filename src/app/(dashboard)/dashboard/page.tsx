import { createClient } from "@/lib/supabase/server";
import { Transaction } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpenseChart } from "@/components/expense-chart";
import { TrendingUp, TrendingDown, Wallet, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export default async function DashboardPage({
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

  const list = transactions || [];
  const totalIncome = list.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = list.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const monthName = new Date(year, month - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm capitalize">{monthName}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link href={`/dashboard?mes=${prevMonth}&ano=${prevYear}`}>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          {!isCurrentMonth && (
            <Link href={`/dashboard?mes=${now.getMonth() + 1}&ano=${now.getFullYear()}`}>
              <Button variant="outline" size="sm" className="text-xs">Hoje</Button>
            </Link>
          )}
          <Link href={`/dashboard?mes=${nextMonth}&ano=${nextYear}`}>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Receitas
            </CardTitle>
            <div className="p-2 bg-emerald-500/15 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-500 mt-1">
              {list.filter((t) => t.type === "income").length} transações
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-400">
              Despesas
            </CardTitle>
            <div className="p-2 bg-rose-500/15 rounded-lg">
              <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-rose-600/70 dark:text-rose-500 mt-1">
              {list.filter((t) => t.type === "expense").length} transações
            </p>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-sm bg-gradient-to-br ${balance >= 0
          ? "from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20"
          : "from-orange-50 to-orange-100/50 dark:from-orange-950/40 dark:to-orange-900/20"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${balance >= 0
              ? "text-indigo-700 dark:text-indigo-400"
              : "text-orange-700 dark:text-orange-400"}`}>
              Saldo
            </CardTitle>
            <div className={`p-2 rounded-lg ${balance >= 0
              ? "bg-indigo-500/15"
              : "bg-orange-500/15"}`}>
              <Wallet className={`h-4 w-4 ${balance >= 0
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-orange-600 dark:text-orange-400"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0
              ? "text-indigo-700 dark:text-indigo-300"
              : "text-orange-700 dark:text-orange-300"}`}>
              {formatCurrency(balance)}
            </div>
            <p className={`text-xs mt-1 ${balance >= 0
              ? "text-indigo-600/70 dark:text-indigo-500"
              : "text-orange-600/70 dark:text-orange-500"}`}>
              {balance >= 0 ? "Mês positivo" : "Mês no negativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Despesas por categoria</CardTitle>
            <CardDescription>Distribuição das despesas do mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseChart transactions={list} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Últimas transações</CardTitle>
              <CardDescription>Movimentações recentes</CardDescription>
            </div>
            <Link href="/transacoes">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground text-xs h-8">
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {list.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-sm">Nenhuma transação neste mês.</p>
                <Link href="/transacoes">
                  <Button variant="outline" size="sm" className="mt-3">
                    Adicionar transação
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {list.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        t.type === "income"
                          ? "bg-emerald-100 dark:bg-emerald-900/40"
                          : "bg-rose-100 dark:bg-rose-900/40"
                      }`}>
                        {t.type === "income"
                          ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          : <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate leading-tight">{t.description}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                            {t.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold shrink-0 ${
                      t.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
