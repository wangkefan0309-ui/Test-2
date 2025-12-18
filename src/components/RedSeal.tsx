import React from 'react';

interface RedSealProps {
  dormNumber: string;
  className?: string;
}

const RedSeal: React.FC<RedSealProps> = ({ dormNumber, className = '' }) => {
  return (
    <div 
      className={`w-[160px] h-[160px] rounded-full border-4 border-[#d90000] relative flex items-center justify-center opacity-90 transform -rotate-5 ${className}`}
    >
      {/* 内圈细边框 */}
      <div className="absolute inset-2 rounded-full border-2 border-[#d90000]"></div>
      
      {/* 印章内容 */}
      <div className="text-center text-[#d90000]">
        <p className="text-sm">{dormNumber}</p>
        <p className="text-xl font-bold font-simsun">睡觉委员会印</p>
      </div>
    </div>
  );
};

export default RedSeal;