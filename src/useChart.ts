import { useQuery } from "@tanstack/react-query";
import { apiBaseUrl } from "./constants";
import fetch from "node-fetch";

export type ChartData = {
  price: number;
  timestamp: number;
}[];

const getChart = async (id: string): Promise<ChartData> => {
  const response = await fetch(`${apiBaseUrl}/chart/${id}`);
  return response.json() as Promise<ChartData>;
};

export default function useChart(id: string, query: boolean) {
  const { data, isLoading } = useQuery({
    queryKey: [`${id}-chart`],
    queryFn: () => getChart(id),
    staleTime: 60_000, // 1 minute
    enabled: query,
  });

  return { chart: data, isLoading };
}
