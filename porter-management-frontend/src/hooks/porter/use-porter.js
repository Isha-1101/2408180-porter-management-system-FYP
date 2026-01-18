import { useEffect } from "react";
import { useGetPorterByUser } from "../../apis/hooks/portersHooks";
import { usePorterStore } from "../../store/porter.store";

export const usePorter = () => {
  const setPorter = usePorterStore((state) => state.setPorter);
  const porter = usePorterStore((state) => state.porter);

  const {
    data: porterData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetPorterByUser();

  useEffect(() => {
    if (porterData?.data?.porter !== undefined) {
      setPorter(porterData?.data?.porter ?? null);
    }
  }, [porterData, setPorter]);

  return {
    porter,
    porterData,
    isLoading,
    isFetching,
    isError,
    error,
  };
};
