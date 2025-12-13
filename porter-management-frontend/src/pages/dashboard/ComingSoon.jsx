import { Construction } from "lucide-react";

const ComingSoon = ({ title }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
          <Construction className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            This section is mock UI and ready to integrate later.
          </p>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        Add your real page here and keep the route as-is.
      </div>
    </div>
  );
};

export default ComingSoon;
