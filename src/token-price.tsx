import { Action, ActionPanel, List } from "@raycast/api";
import { useState } from "react";
import useWatchlist from "./useWatchlist";
import { distance } from "fastest-levenshtein";
import useTokenPrice from "./useTokenPrice";
import useSymbols from "./useSymbols";
import CommandWrapper from "./CommandWrapper";
import { formatPrice } from "./utilities";

function TickerListItem({ symbol, isSelected }: { symbol: string; isSelected: boolean }) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { data: price, refetch: refreshPrice } = useTokenPrice(isSelected ? symbol : null);

  return (
    <List.Item
      id={symbol}
      title={symbol}
      detail={<List.Item.Detail markdown={price ? `$${formatPrice(price)}` : "Loading Price.."} />}
      actions={
        <ActionPanel>
          <Action title="Refresh Price" onAction={refreshPrice} />
          {isInWatchlist(symbol) ? (
            <Action title="Remove from Watchlist" onAction={() => removeFromWatchlist(symbol)} />
          ) : (
            <Action title="Add to Watchlist" onAction={() => addToWatchlist(symbol)} />
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
  const { watchlist, isInWatchlist } = useWatchlist();

  const filterTokens = (tokens: string[]) => {
    return tokens
      .filter((symbol) => symbol.toLowerCase().includes(search?.toLowerCase() ?? ""))
      .sort((a, b) => {
        if (!search) return a < b ? -1 : a === b ? 0 : 1;
        return distance(a, search) - distance(b, search);
      });
  };

  const filteredWatchlist = filterTokens(watchlist ?? []);
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
            <List.Section title="Watchlist">
              {filteredWatchlist?.map((symbol) => (
                <TickerListItem key={symbol} symbol={symbol} isSelected={token === symbol} />
              ))}
            </List.Section>
            <List.Section title="All Tokens">
              {filteredAllTokens
                .filter((symbol) => !isInWatchlist(symbol))
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
    <CommandWrapper>
      <TokenPriceContent />
    </CommandWrapper>
  );
}
