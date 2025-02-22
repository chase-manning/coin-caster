import { Action, ActionPanel, Detail, List } from "@raycast/api";
import { useEffect, useState } from "react";
import fetch from "node-fetch";

const apiBaseUrl = "https://coin-caster-api.daniel-191.workers.dev";

interface PriceResponse {
  price: string;
}

const getPrice = async (symbol: string): Promise<PriceResponse> => {
  const response = await fetch(`${apiBaseUrl}/price/${symbol}/usd`);
  const data = await response.json();
  return data as PriceResponse;
};

const getSymbols = async (): Promise<string[]> => {
  const response = await fetch(`${apiBaseUrl}/symbols/usd`);
  return response.json() as Promise<string[]>;
};

export default function Command() {
  const [search, setSearch] = useState<string | null>(null);
  const [symbols, setSymbols] = useState<string[] | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getPrice(token)
      .then((data) => {
        setPrice(Number(data.price));
      })
      .catch(() => {
        throw new Error("Failed to fetch price");
      });
  }, [token]);

  useEffect(() => {
    getSymbols()
      .then(setSymbols)
      .catch(() => {
        throw new Error("Failed to fetch symbols");
      });
  }, []);

  return (
    <>
      {token && <Detail isLoading={price === null} markdown={`# ${price ? `$${price}` : "Loading Price.."}`} />}
      {!token && (
        <List
          isLoading={symbols === null}
          filtering={false}
          onSearchTextChange={setSearch}
          navigationTitle="Token"
          searchBarPlaceholder="Search for a token..."
        >
          {symbols === null ? (
            <List.Item title="loading..." />
          ) : (
            symbols
              .filter((symbol) => search === null || symbol.toLowerCase().includes(search.toLowerCase()))
              .sort((a, b) => {
                if (!search) return 0;
                return a.length - b.length;
              })
              .map((symbol) => (
                <List.Item
                  key={symbol}
                  title={symbol}
                  actions={
                    <ActionPanel>
                      <Action title="Select" onAction={() => setToken(symbol)} />
                    </ActionPanel>
                  }
                />
              ))
          )}
        </List>
      )}
    </>
  );
}
