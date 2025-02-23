import { Action, ActionPanel, List } from "@raycast/api";
import { useState } from "react";
import useWatchlist from "./useWatchlist";
import { distance } from "fastest-levenshtein";
import useTokenPrice from "./useTokenPrice";
import useSymbols from "./useSymbols";
import CommandWrapper from "./CommandWrapper";
import { formatPrice } from "./utilities";
import useCoins, { CoinData } from "./useCoins";

function TickerListItem({ coin, isSelected }: { coin: CoinData; isSelected: boolean }) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { data: price, refetch: refreshPrice } = useTokenPrice(isSelected ? coin.symbol : null);

  const currentPrice = price ? price : coin.current_price;
  const priceChange =
    coin.price_change_percentage_24h >= 0
      ? `+${coin.price_change_percentage_24h.toFixed(2)}%`
      : `${coin.price_change_percentage_24h.toFixed(2)}%`;

  return (
    <List.Item
      id={coin.id}
      title={coin.symbol.toUpperCase()}
      accessories={[{ text: `$${formatPrice(currentPrice)}` }]}
      detail={
        <List.Item.Detail
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title={coin.name} icon={coin.image} />
              <List.Item.Detail.Metadata.Label title="Price" text={`$${formatPrice(currentPrice)}`} />
              <List.Item.Detail.Metadata.Label title="Price Change (24h)" text={priceChange} />
              <List.Item.Detail.Metadata.Label title="Market Cap" text={`$${formatPrice(coin.market_cap)}`} />
              <List.Item.Detail.Metadata.Label title="Volume" text={`$${formatPrice(coin.total_volume)}`} />
              <List.Item.Detail.Metadata.Separator />

              <List.Item.Detail.Metadata.Link
                title="View more"
                target={`https://www.coingecko.com/en/coins/${coin.id}`}
                text="CoinGecko"
              />
            </List.Item.Detail.Metadata>
          }
        />
      }
      actions={
        <ActionPanel>
          <Action title="Refresh Price" onAction={refreshPrice} />
          {isInWatchlist(coin.id) ? (
            <Action title="Remove from Watchlist" onAction={() => removeFromWatchlist(coin.id)} />
          ) : (
            <Action title="Add to Watchlist" onAction={() => addToWatchlist(coin.id)} />
          )}
        </ActionPanel>
      }
    />
  );
}

function TokenPriceContent() {
  const [search, setSearch] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const { data: coins } = useCoins();

  const { data: symbols } = useSymbols();
  const { isInWatchlist } = useWatchlist();
  const watchlistCoins = coins?.filter((coin) => isInWatchlist(coin.id));
  const otherCoins = coins?.filter((coin) => !isInWatchlist(coin.id));

  const filterTokens = (coins: CoinData[]) => {
    return coins
      .filter((coin) => coin.symbol.toLowerCase().includes(search?.toLowerCase() ?? ""))
      .sort((a, b) => {
        if (!search) return a.symbol < b.symbol ? -1 : a.symbol === b.symbol ? 0 : 1;
        return distance(a.symbol, search) - distance(b.symbol, search);
      });
  };

  const filteredWatchlist = filterTokens(watchlistCoins ?? []);
  const filteredAllTokens = filterTokens(otherCoins ?? []);

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
              {filteredWatchlist?.map((coin) => (
                <TickerListItem key={coin.id} coin={coin} isSelected={token === coin.id} />
              ))}
            </List.Section>
            <List.Section title="All Tokens">
              {filteredAllTokens
                .filter((coin) => !isInWatchlist(coin.id))
                .map((coin) => (
                  <TickerListItem key={coin.id} coin={coin} isSelected={token === coin.id} />
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
