
const PageHeader = ({ title, description, className, children }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0C4C40' }}>{title}</h1>
        {description && (
          <p className="text-sm md:text-base text-secondary mt-1">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
};

export default PageHeader;
