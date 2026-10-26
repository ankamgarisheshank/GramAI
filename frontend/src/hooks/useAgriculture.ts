import { useQuery } from '@tanstack/react-query';
import { AgricultureAPI } from '../lib/api';

export const useMarketPrices = () => {
  return useQuery({
    queryKey: ['marketPrices'],
    queryFn: async () => {
      const { data } = await AgricultureAPI.getMarketPrices();
      return data.data;
    },
  });
};

export const useWeather = (locationId: string) => {
  return useQuery({
    queryKey: ['weather', locationId],
    queryFn: async () => {
      if (!locationId) return null;
      const { data } = await AgricultureAPI.getWeather(locationId);
      return data.data;
    },
    enabled: !!locationId,
  });
};
