import { Action, ActionPanel, List } from "@raycast/api";
import { useState } from "react";
import useFavorites from "./useFavorites";
import { distance } from "fastest-levenshtein";
import useTokenPrice from "./useTokenPrice";
import useSymbols from "./useSymbols";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function TickerListItem({
  symbol,
  onSelect,
  isSelected,
}: {
  symbol: string;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { data: price } = useTokenPrice(isSelected ? symbol : null);

  return (
    <List.Item
      id={symbol}
      title={symbol}
      detail={<List.Item.Detail markdown={price ? `$${price}` : "Loading Price.."} />}
      actions={
        <ActionPanel>
          <Action title="Select" onAction={onSelect} />
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
                <TickerListItem
                  key={symbol}
                  symbol={symbol}
                  onSelect={() => setToken(symbol)}
                  isSelected={token === symbol}
                />
              ))}
            </List.Section>
            <List.Section title="All Tokens">
              {filteredAllTokens
                .filter((symbol) => !isFavorite(symbol))
                .map((symbol) => (
                  <TickerListItem
                    key={symbol}
                    symbol={symbol}
                    onSelect={() => setToken(symbol)}
                    isSelected={token === symbol}
                  />
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
    <QueryClientProvider client={queryClient}>
      <TokenPriceContent />
    </QueryClientProvider>
  );
}
