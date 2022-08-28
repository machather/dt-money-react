import { createContext, useEffect, useState, ReactNode, useContext } from "react";
import { api } from "../services/api";

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: string;
  category: string;
  createAt: string;
}

type TransactionInput = Omit<Transaction, 'id' | 'createAt'>

interface TransactionsProviderProps {
  children: React.ReactNode;
}

interface TransactionsContextData {
  transactions: Transaction[];
  createTransaction: (transaction: TransactionInput) => Promise<void>;
}

const TransactionContext = createContext<TransactionsContextData>(
  {} as TransactionsContextData
);

export function TransactionsProvider({children} : TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => { 
    api.get('transactions')
    .then(response => (setTransactions(response.data.transactions)))
  }, []);

  async function createTransaction(TransactionInput: TransactionInput) {
    const response  = await api.post('transactions', 
    {
      ...TransactionInput, 
      createAt: new Date() 
    });
    const { transaction } = response.data;

    setTransactions([...transactions, transaction]);
  }

  return (
    <TransactionContext.Provider value={{transactions, createTransaction}}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }

  return context;
}