import { LocalStorage } from "@raycast/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useFavorites() {
  const getFavorites = async (): Promise<string[]> => {
    const rawFavorites = await LocalStorage.getItem<string>("favorites");
    return rawFavorites ? JSON.parse(rawFavorites) : [];
  };

  const queryClient = useQueryClient();

  const { data: favorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });

  const isFavorite = (symbol: string) => {
    return favorites?.includes(symbol);
  };

  const refreshFavorites = async () => {
    await queryClient.invalidateQueries({ queryKey: ["favorites"] });
  };

  const addToFavorites = async (symbol: string) => {
    const favorites = await getFavorites();
    await LocalStorage.setItem("favorites", JSON.stringify([...favorites, symbol]));
    await refreshFavorites();
  };

  const removeFromFavorites = async (symbol: string) => {
    const favorites = await getFavorites();
    await LocalStorage.setItem("favorites", JSON.stringify(favorites.filter((s: string) => s !== symbol)));
    await refreshFavorites();
  };


  return { favorites, addToFavorites, removeFromFavorites, isFavorite };
}
