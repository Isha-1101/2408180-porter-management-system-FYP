
const PageHeader = ({ title, description, className, children }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">{title}</h1>
        <p className="text-sm md:text-base text-secondary mt-1">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
};

export default PageHeader;
