export default function Logo({ className = "", text = false }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative inset-0 bg-cover bg-center w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
        <div className="absolute inset-0 bg-cover bg-center bg-white rounded-full h-5/6 w-5/6 bg-[url('/images/doko_namlo.png')]" />
      </div>

      {text && (
        <span className="text-3xl font-bold tracking-wide text-primary">
          DOKO Namlo
        </span>
      )}
    </div>
  );
}
