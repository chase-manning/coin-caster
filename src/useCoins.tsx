import { useQuery } from "@tanstack/react-query";
import { apiBaseUrl } from "./constants";
import fetch from "node-fetch";

export type CoinData = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  price_change_percentage_24h_in_currency: number;
};

const getCoins = async (): Promise<CoinData[]> => {
  const response = await fetch(`${apiBaseUrl}/coins`);
  return response.json() as Promise<CoinData[]>;
};

export default function useSymbols() {
  return useQuery({
    queryKey: ["coins"],
    queryFn: () => getCoins(),
    staleTime: 60_000, // 1 minute
  });
}
