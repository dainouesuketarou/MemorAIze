import React from 'react';
import { Award, Check } from 'lucide-react';

interface PlanProps {
  plan: {
    name: string;
    features: string[];
    isActive: boolean;
  };
}

export const UserPlan: React.FC<PlanProps> = ({ plan }) => {
  const getPlanColor = () => {
    switch (plan.name.toLowerCase()) {
      case '無料':
        return 'text-gray-600 bg-gray-100';
      case 'プレミアム':
        return 'text-purple-600 bg-purple-100';
      case 'プロ':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-teal-600 bg-teal-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">現在のプラン</h2>
        <div
          className={`py-1 px-3 rounded-full text-sm font-medium ${getPlanColor()}`}
        >
          {plan.name}
        </div>
      </div>
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
          <Award size={20} />
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-800">{plan.name}プラン</p>
          <p className="text-sm text-gray-500">
            {plan.isActive ? '有効' : '無効'}
          </p>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <div className="text-green-500 mt-0.5 mr-2">
              <Check size={16} />
            </div>
            <span className="text-gray-600 text-sm">{feature}</span>
          </div>
        ))}
      </div>
      <div className="pt-4 mt-4 border-t border-gray-100">
        <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-0.5">
          プランをアップグレード
        </button>
      </div>
    </div>
  );
};
