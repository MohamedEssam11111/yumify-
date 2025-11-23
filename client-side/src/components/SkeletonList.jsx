const SkeletonList = ({ rows = 6, className = "" }) => {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="animate-pulse bg-gray-100 h-16 rounded" />
      ))}
    </div>
  );
};

export default SkeletonList;
