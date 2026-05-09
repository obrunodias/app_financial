"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/types";
import { TransactionForm } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Pencil, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";

interface TransactionsClientProps {
  transactions: Transaction[];
  mes: number;
  ano: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const ALL_CATEGORIES = ["Todos", ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES.filter(
  (c) => !EXPENSE_CATEGORIES.includes(c as never)
)];

export function TransactionsClient({ transactions, mes, ano }: TransactionsClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const router = useRouter();
  const supabase = createClient();

  const prevMonth = mes === 1 ? 12 : mes - 1;
  const prevYear = mes === 1 ? ano - 1 : ano;
  const nextMonth = mes === 12 ? 1 : mes + 1;
  const nextYear = mes === 12 ? ano + 1 : ano;

  const monthName = new Date(ano, mes - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const filtered = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    return true;
  });

  async function handleDelete(id: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir transação.");
    } else {
      toast.success("Transação excluída.");
      router.refresh();
    }
  }

  function handleEdit(t: Transaction) {
    setEditing(t);
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
    setEditing(undefined);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground text-sm capitalize">{monthName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Nova transação
          </Button>
        </div>
      </div>

      {/* Period navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/transacoes?mes=${prevMonth}&ano=${prevYear}`)}
        >
          ‹ Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            router.push(`/transacoes?mes=${now.getMonth() + 1}&ano=${now.getFullYear()}`);
          }}
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/transacoes?mes=${nextMonth}&ano=${nextYear}`)}
        >
          Próximo ›
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterType} onValueChange={(v) => setFilterType(v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {ALL_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat === "Todos" ? "all" : cat}>
                {cat === "Todos" ? "Todas as categorias" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filterType !== "all" || filterCategory !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterType("all");
              setFilterCategory("all");
            }}
            className="text-muted-foreground"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhuma transação encontrada.</p>
          <p className="text-sm mt-1">
            {transactions.length === 0
              ? "Adicione sua primeira transação do mês."
              : "Tente ajustar os filtros."}
          </p>
          {transactions.length === 0 && (
            <Button
              className="mt-4"
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Adicionar transação
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-1 self-stretch rounded-full shrink-0 ${
                    t.type === "income" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{t.description}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {t.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(t.date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`font-semibold text-sm ${
                    t.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(t)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(t.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <TransactionForm
        open={formOpen}
        onClose={handleCloseForm}
        transaction={editing}
      />
    </div>
  );
}
