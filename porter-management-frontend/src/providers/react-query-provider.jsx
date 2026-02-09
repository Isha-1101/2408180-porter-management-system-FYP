import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
const ReactQueryProvider = ({ children }) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: false,
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      </QueryClientProvider>
  );
};

export default ReactQueryProvider;
