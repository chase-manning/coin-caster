import { Action, ActionPanel, List, LocalStorage } from "@raycast/api";
import { useState } from "react";
import useFavorites from "./useFavorites";
import { distance } from "fastest-levenshtein";
import useTokenPrice from "./useTokenPrice";
import useSymbols from "./useSymbols";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const queryClient = new QueryClient();
const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: LocalStorage.getItem<string>,
    setItem: LocalStorage.setItem,
    removeItem: LocalStorage.removeItem,
  },
});

function TickerListItem({ symbol, isSelected }: { symbol: string; isSelected: boolean }) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { data: price, refetch: refreshPrice } = useTokenPrice(isSelected ? symbol : null);

  return (
    <List.Item
      id={symbol}
      title={symbol}
      detail={<List.Item.Detail markdown={price ? `$${price}` : "Loading Price.."} />}
      actions={
        <ActionPanel>
          <Action title="Refresh Price" onAction={refreshPrice} />
          {isFavorite(symbol) ? (
            <Action title="Remove from Favorites" onAction={() => removeFromFavorites(symbol)} />
          ) : (
            <Action title="Add to Favorites" onAction={() => addToFavorites(symbol)} />
          )}
        </ActionPanel>
      }
    />
  );
}

function TokenPriceContent() {
  const [search, setSearch] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const { data: symbols } = useSymbols();
  const { favorites, isFavorite } = useFavorites();

  const filterTokens = (tokens: string[]) => {
    return tokens
      .filter((symbol) => symbol.toLowerCase().includes(search?.toLowerCase() ?? ""))
      .sort((a, b) => {
        if (!search) return a < b ? -1 : a === b ? 0 : 1;
        return distance(a, search) - distance(b, search);
      });
  };

  const filteredFavorites = filterTokens(favorites ?? []);
  const filteredAllTokens = filterTokens(symbols ?? []);

  return (
    <>
      <List
        isLoading={symbols === undefined}
        isShowingDetail
        filtering={false}
        onSearchTextChange={setSearch}
        onSelectionChange={(token) => setToken(token)}
        navigationTitle="Token"
        searchBarPlaceholder="Search for a token..."
      >
        {symbols && (
          <>
            <List.Section title="Favorites">
              {filteredFavorites?.map((symbol) => (
                <TickerListItem key={symbol} symbol={symbol} isSelected={token === symbol} />
              ))}
            </List.Section>
            <List.Section title="All Tokens">
              {filteredAllTokens
                .filter((symbol) => !isFavorite(symbol))
                .map((symbol) => (
                  <TickerListItem key={symbol} symbol={symbol} isSelected={token === symbol} />
                ))}
            </List.Section>
          </>
        )}
      </List>
    </>
  );
}

export default function Command() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
      <TokenPriceContent />
    </PersistQueryClientProvider>
  );
}
