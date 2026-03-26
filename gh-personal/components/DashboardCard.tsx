interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({ children, className = '' }: DashboardCardProps) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl shadow-lg hover:border-gray-700 transition-all ${className}`}>
      {children}
    </div>
  );
}
