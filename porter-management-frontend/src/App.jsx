import React from "react";
import MainRoute from "./Routes/MainRoute.jsx";
import ReactQueryProvider from "../providers/react-query-provider.jsx";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <ReactQueryProvider>
      <MainRoute />
      <Toaster />
    </ReactQueryProvider>
  );
};

export default App;
