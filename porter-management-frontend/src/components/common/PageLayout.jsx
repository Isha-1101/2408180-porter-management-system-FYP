import React from "react";
import PageHeader from "./PageHeader";

const PageLayout = ({ children, ...props }) => {
  return (
    <div className={`${props.className}`}>
      <PageHeader title={props.title} description={props.description}>
        {props.headerExtraChildren}
      </PageHeader>

      <div className="mt-2">{children}</div>
    </div>
  );
};

export default PageLayout;
