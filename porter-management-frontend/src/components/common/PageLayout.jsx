import React from "react";
import PageHeader from "./PageHeader";

const PageLayout = ({ children, ...props }) => {
  return (
    <div className={`${props.className} max-w-full mt-0 mx-2 p-4`}>
      <PageHeader title={props.title} description={props.description}>
        {props.headerExtraChildren}
      </PageHeader>

      <div className="">{children}</div>
    </div>
  );
};

export default PageLayout;
