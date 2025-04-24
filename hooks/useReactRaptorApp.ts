import { useQuery } from "@tanstack/react-query";
import {
  ReactRaptorApp,
  reactRaptorAppListQueryFn,
} from "./useReactRaptorAppList";

export const useReactRaptorApp = (packageName: string) => {
  const query = useQuery({
    queryKey: ["packages"],
    staleTime: 1000 * 60 * 5,
    queryFn: reactRaptorAppListQueryFn,
    select: (data: ReactRaptorApp[]) => {
      return data.find((app) => app.packageName === packageName);
    },
  });

  return query;
};
