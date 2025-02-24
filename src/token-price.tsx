import { Action, ActionPanel, List, open } from "@raycast/api";
import { useState } from "react";
import useWatchlist from "./useWatchlist";
import { distance } from "fastest-levenshtein";
import useSymbols from "./useSymbols";
import CommandWrapper from "./CommandWrapper";
import { formatPrice } from "./utilities";
import useCoins, { CoinData } from "./useCoins";

function TickerListItem({ coin }: { coin: CoinData }) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const currentPrice = coin.current_price;
  const priceChange =
    coin.price_change_percentage_24h !== undefined &&
    (coin.price_change_percentage_24h >= 0
      ? `+${coin.price_change_percentage_24h?.toFixed(2)}%`
      : `${coin.price_change_percentage_24h?.toFixed(2)}%`);

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
              {priceChange && <List.Item.Detail.Metadata.Label title="Price Change (24h)" text={priceChange} />}
              <List.Item.Detail.Metadata.Label title="Market Cap" text={`$${formatPrice(coin.market_cap)}`} />
              <List.Item.Detail.Metadata.Label title="Volume" text={`$${formatPrice(coin.total_volume)}`} />
            </List.Item.Detail.Metadata>
          }
        />
      }
      actions={
        <ActionPanel>
          <Action title="View on Coingecko" onAction={() => open(`https://www.coingecko.com/en/coins/${coin.id}`)} />
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

  const { coins, isLoading } = useCoins();

  const { data: symbols } = useSymbols();
  const { isInWatchlist } = useWatchlist();
  const watchlistCoins = coins?.filter((coin) => isInWatchlist(coin.id));
  const otherCoins = coins?.filter((coin) => !isInWatchlist(coin.id));

  const filterTokens = (coins: CoinData[]) => {
    return coins
      .filter((coin) => coin.symbol.toLowerCase().includes(search?.toLowerCase() ?? ""))
      .sort((a, b) => {
        if (!search) return b.market_cap - a.market_cap;
        const d = distance(a.symbol, search) - distance(b.symbol, search);
        return d === 0 ? b.market_cap - a.market_cap : d;
      });
  };

  const filteredWatchlist = filterTokens(watchlistCoins ?? []);
  const filteredAllTokens = filterTokens(otherCoins ?? []);

  return (
    <>
      <List
        isLoading={isLoading}
        isShowingDetail
        filtering={false}
        onSearchTextChange={setSearch}
        navigationTitle="Token"
        searchBarPlaceholder="Search for a token..."
      >
        {symbols && (
          <>
            <List.Section title="Watchlist">
              {filteredWatchlist?.map((coin) => <TickerListItem key={coin.id} coin={coin} />)}
            </List.Section>
            <List.Section title="All Tokens">
              {filteredAllTokens
                .filter((coin) => !isInWatchlist(coin.id))
                .map((coin) => (
                  <TickerListItem key={coin.id} coin={coin} />
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
