import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@lotofacil_favorites';

export const FavoritesService = {
  async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      return [];
    }
  },

  async saveFavorites(favorites) {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
      return false;
    }
  },

  async addFavorite(combinacao) {
    try {
      const favorites = await this.getFavorites();
      const exists = favorites.some(fav => 
        JSON.stringify(fav.dezenas) === JSON.stringify(combinacao.dezenas)
      );
      
      if (!exists) {
        favorites.push({
          ...combinacao,
          favoritedAt: new Date().toISOString()
        });
        await this.saveFavorites(favorites);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return false;
    }
  },

  async removeFavorite(dezenas) {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(fav => 
        JSON.stringify(fav.dezenas) !== JSON.stringify(dezenas)
      );
      await this.saveFavorites(filtered);
      return true;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return false;
    }
  },

  async isFavorite(dezenas) {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => 
        JSON.stringify(fav.dezenas) === JSON.stringify(dezenas)
      );
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  },

  async clearFavorites() {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
      return false;
    }
  }
};
