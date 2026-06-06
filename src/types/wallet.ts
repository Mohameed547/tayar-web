export interface Transaction {
  id: string;
  type: "payment" | "topup" | "cashback" | "withdraw";
  amount: number;
  description: string;
  date: string;
}

export interface Wallet {
  id: string;
  balance: number;
  cashbackEarned: number;
  transactions: Transaction[];
}
