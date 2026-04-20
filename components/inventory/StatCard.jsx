const StatCard = ({ label, value, icon, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 flex items-center justify-between ${className}`}>
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="flex-shrink-0">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;