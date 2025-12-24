import React from "react";
import MainRoute from "./Routes/MainRoute.jsx";
import { Toaster } from "react-hot-toast";
import ReactQueryProvider from "./providers/react-query-provider.jsx";

const App = () => {
  return (
    <ReactQueryProvider>
      <MainRoute />
      <Toaster />
    </ReactQueryProvider>
  );
};

export default App;
