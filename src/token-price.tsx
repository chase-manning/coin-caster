import { Action, ActionPanel, List, open } from "@raycast/api";
import { useState } from "react";
import useWatchlist from "./useWatchlist";
import { distance } from "fastest-levenshtein";
import useSymbols from "./useSymbols";
import CommandWrapper from "./CommandWrapper";
import { formatPrice } from "./utilities";
import useCoins, { CoinData } from "./useCoins";
import useChart from "./useChart";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function TickerListItem({ coin }: { coin: CoinData }) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { chart, isLoading } = useChart(coin.id);

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
              <List.Item.Detail.Metadata.Label
                title="Chart"
                text={isLoading ? "Loading..." : (chart?.length.toString() ?? "Error Loading Chart")}
              />
              <List.Item.Detail.Metadata.Separator />
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

  const data = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <Doughnut data={data} />
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
