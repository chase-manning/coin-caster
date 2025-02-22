import { Detail, List } from "@raycast/api";
import CommandWrapper from "./CommandWrapper";
import useWatchlist from "./useWatchlist";
import useTokenPrices from "./useTokenPrices";
import { formatPrice } from "./utilities";

const emptyWatchlistDetail = `You do not have any tokens in your watchlist.

Add some tokens to your watchlist by searching for a token in the Token Price command and selecting "Add to Watchlist".`;

function WatchlistPricesContent() {
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const { isLoading, priceMap } = useTokenPrices(watchlist ?? []);

  const getPrice = (symbol: string) => {
    if (isLoading) return "Loading...";
    const price = priceMap.get(symbol);
    return price ? `$${formatPrice(price)}` : "-";
  };

  return isWatchlistLoading ? (
    <Detail markdown="Loading..." />
  ) : !watchlist?.length ? (
    <Detail markdown={emptyWatchlistDetail} />
  ) : (
    <List>
      {watchlist?.map((symbol) => <List.Item key={symbol} title={symbol} accessories={[{ text: getPrice(symbol) }]} />)}
    </List>
  );
}

export default function Command() {
  return (
    <CommandWrapper>
      <WatchlistPricesContent />
    </CommandWrapper>
  );
}
