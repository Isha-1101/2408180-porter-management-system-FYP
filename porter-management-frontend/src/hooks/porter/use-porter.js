import { useEffect } from "react";
import { useGetPorterByUser } from "../../apis/hooks/portersHooks";
import { usePorterStore } from "../../store/porter.store";
import {porterRetgistrationHooks} from "../../apis/hooks/porterRegistratioHooks";
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

  const {
    data: porterRegistrationData,
    isLoading: isRegistrationLoading,
    isFetching: isRegistrationFetching,
    isError: isRegistrationError,
    error: registrationError,
  } = porterRetgistrationHooks.usegetPorterRegistrationByUser();;
    console.log("🚀 ~ usePorter ~ porterRegistrationData:", porterRegistrationData)

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
    porterRegistrationData: porterRegistrationData?.data?.registration?? null,
    isRegistrationLoading,
    isRegistrationFetching,
    isRegistrationError,
    registrationError,
  };
};
