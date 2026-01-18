import { Loader2, Dot } from "lucide-react";

const UiLoader = ({ text = "Loading", showLoader, showText }) => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
      {showLoader ? (
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      ) : (
        <div className="flex items-center text-sm text-muted-foreground">
          {showText && (
            <span className="text-3xl font-bold text-primary"> {text}</span>
          )}
          <Dot className="h-15 w-15 animate-bounce [animation-delay:0ms] text-primary" />
          <Dot className="h-15 w-15 animate-bounce [animation-delay:150ms] text-primary" />
          <Dot className="h-15 w-15 animate-bounce [animation-delay:300ms] text-primary" />
        </div>
      )}
    </div>
  );
};

export default UiLoader;
