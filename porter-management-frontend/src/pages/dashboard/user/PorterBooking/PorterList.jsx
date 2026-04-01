import { Search, SearchIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AvailablePorter from "@/pages/dashboard/components/AvailablePorter";

const PorterList = ({ porters, hasSearched, isLoading, onBook }) => (
  <Card className="h-full shadow-sm">
    <CardHeader className="pb-3 border-b">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">
          Available Porters{" "}
          <span className="text-sm font-normal text-gray-500 ml-1">
            ({hasSearched ? porters.length : 0})
          </span>
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent className="p-3 h-[400px] overflow-y-auto custom-scrollbar">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 max-w-sm mx-auto">
          <div className="relative">
            <SearchIcon className="w-10 h-10 text-primary animate-pulse" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-12 h-12 rounded-full border-2 border-primary/30 animate-ping absolute" />
            </span>
          </div>
          <h3 className="mt-5 text-lg font-semibold text-gray-700 tracking-wide">
            Searching <span className="text-primary font-bold">Porter</span>
            <span className="inline-flex ml-1">
              <span className="animate-bounce delay-0">.</span>
              <span className="animate-bounce delay-150">.</span>
              <span className="animate-bounce delay-300">.</span>
            </span>
          </h3>
          <p className="mt-1 text-sm text-gray-500 font-medium">Please wait a moment</p>
        </div>
      ) : hasSearched ? (
        <AvailablePorter availablePorters={porters} onBook={onBook} isLoadingPorter={isLoading} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <Search className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">Enter details to find porters</p>
          <p className="text-xs mt-1 opacity-70">Fill in pickup and dropoff locations</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default PorterList;
