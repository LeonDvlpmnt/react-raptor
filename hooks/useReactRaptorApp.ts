import { useQuery } from "@tanstack/react-query";
import { ReactRaptorApp } from "./useReactRaptorAppList";

export const useReactRaptorApp = (packageName: string) => {
  const query = useQuery({
    queryKey: ["packages"],
    select: (data: ReactRaptorApp[]) => data.find((app) => app.packageName === packageName),
  });

  return query;
};
