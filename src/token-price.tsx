import { Action, ActionPanel, Detail, List } from "@raycast/api";
import { useEffect, useState } from "react";
import fetch from "node-fetch";

const API_KEY = "9ceNnUHS3OPXFYoRmf5PJA==k39cMr6LvHSVeObq";
const ENDPOINT = "https://api.api-ninjas.com/v1/cryptoprice?symbol=";
const SYMBOLS = "https://api.api-ninjas.com/v1/cryptosymbols";

interface PriceResponse {
  symbol: string;
  price: string;
  timestamp: number;
}

const getPrice = async (symbol: string): Promise<PriceResponse> => {
  const response = await fetch(`${ENDPOINT}${symbol}USD`, {
    headers: {
      "X-API-KEY": API_KEY,
    },
  });
  const data = await response.json();
  return data as PriceResponse;
};

const getSymbols = async (): Promise<string[]> => {
  const response = await fetch(SYMBOLS, {
    headers: {
      "X-API-KEY": API_KEY,
    },
  });
  const data = await response.json();
  const symbols = data as { symbols: string[] };
  return symbols.symbols.filter((symbol) => symbol.endsWith("USD")).map((symbol) => symbol.slice(0, -3));
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
      .then((data) => {
        setSymbols(data);
      })
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
          {symbols === null
            ? "loading..."
            : symbols
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
                ))}
        </List>
      )}
    </>
  );
}
