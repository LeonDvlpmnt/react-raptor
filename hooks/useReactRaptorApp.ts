import { useQuery } from "@tanstack/react-query";
import {
  ReactRaptorApp,
  reactRaptorAppListQueryFn,
} from "./useReactRaptorAppList";

export const useReactRaptorApp = (packageName: string) => {
  const query = useQuery({
    queryKey: ["packages"],
    queryFn: reactRaptorAppListQueryFn,
    select: (data: ReactRaptorApp[]) => {
      return data.find((app) => app.packageName === packageName);
    },
  });

  return query;
};
