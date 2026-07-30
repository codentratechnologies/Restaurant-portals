import { Star } from 'lucide-react';

interface CustomerRatingProps {
  averageRating: number;
  totalReviews: number;
  distribution: number[];
}

export default function CustomerRating({ averageRating, totalReviews, distribution }: CustomerRatingProps) {
  // distribution is [1-star, 2-star, 3-star, 4-star, 5-star] counts
  const ratingData = [
    { stars: 5, count: distribution[4] || 0, percent: totalReviews ? ((distribution[4] || 0) / totalReviews) * 100 : 0 },
    { stars: 4, count: distribution[3] || 0, percent: totalReviews ? ((distribution[3] || 0) / totalReviews) * 100 : 0 },
    { stars: 3, count: distribution[2] || 0, percent: totalReviews ? ((distribution[2] || 0) / totalReviews) * 100 : 0 },
    { stars: 2, count: distribution[1] || 0, percent: totalReviews ? ((distribution[1] || 0) / totalReviews) * 100 : 0 },
    { stars: 1, count: distribution[0] || 0, percent: totalReviews ? ((distribution[0] || 0) / totalReviews) * 100 : 0 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF4] h-full flex flex-col p-6">
      <h3 className="text-[17px] font-black text-[#1a1f36] mb-6">Customer Rating</h3>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-6 sm:gap-4">
        {/* Left Side: Rating Overview */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="text-[48px] font-black text-[#1a1f36] leading-none mb-2">{averageRating.toFixed(1)}</span>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-[#F59E0B]/50 text-[#F59E0B]/50'}`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-[#8896AB]">Based on {totalReviews} reviews</span>
        </div>

        {/* Right Side: Rating Bars */}
        <div className="flex-1 w-full sm:max-w-[200px] flex flex-col gap-2.5">
          {ratingData.map((data) => (
            <div key={data.stars} className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#1a1f36] w-2">{data.stars}</span>
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <div className="flex-1 h-1.5 bg-[#F4F6FA] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FF6B00] rounded-full" 
                  style={{ width: `${data.percent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#1a1f36] w-6 text-right">{data.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
