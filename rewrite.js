const fs = require('fs');

const path = 'Dineos-portals/src/restaurant-pages/reviews/ReviewsDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Imports
content = content.replace(
  /import { Star, Filter, MessageSquareText, StarHalf } from 'lucide-react';[\s\S]*?import { useAuth } from '\.\.\/\.\.\/hooks\/useAuth';/,
  `import { Star, Filter, MessageSquareText, ThumbsUp, ThumbsDown, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

import Select from '../../components/common/Select';

import ReviewDrawer, { ReviewData } from './components/ReviewDrawer';
import { OrderData } from '../../hooks/useRestaurantOrders';
import { useAuth } from '../../hooks/useAuth';`
);

// Replace state variables (sortOrder -> searchInput, etc.)
content = content.replace(
  /const \[selectedRating, setSelectedRating\] = useState<number \| 'All'>\('All'\);\s*const \[sortOrder, setSortOrder\] = useState<'Newest' \| 'Oldest'>\('Newest'\);\s*const \[currentPage, setCurrentPage\] = useState\(1\);\s*const itemsPerPage = 8;/,
  `const [searchInput, setSearchInput] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);`
);

// Replace everything from `// --- Analytics Calculations ---` to the end of the file.
const analyticsIndex = content.indexOf('// --- Analytics Calculations ---');
if (analyticsIndex === -1) throw new Error("Could not find Analytics Calculations");

const newTail = `// --- Analytics Calculations ---
  const { averageRating, totalReviews, positiveReviews, negativeReviews } = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { averageRating: 0, totalReviews: 0, positiveReviews: 0, negativeReviews: 0 };
    
    let sum = 0;
    let pos = 0;
    let neg = 0;
    reviews.forEach(r => {
      sum += r.rating;
      if (r.rating >= 4) pos++;
      else if (r.rating <= 3) neg++;
    });

    return {
      averageRating: sum / total,
      totalReviews: total,
      positiveReviews: pos,
      negativeReviews: neg
    };
  }, [reviews]);

  // --- Filtering & Sorting ---
  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (selectedRating !== 'All') {
      result = result.filter(r => r.rating === selectedRating);
    }
    if (searchInput.trim()) {
      const lower = searchInput.toLowerCase();
      result = result.filter(r => 
        r.customerName.toLowerCase().includes(lower) || 
        r.orderId.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [reviews, searchInput, selectedRating]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, currentPage, itemsPerPage]);

  const handleOpenReview = (review: ReviewData) => {
    setSelectedReview(review);
    setReviewDrawerOpen(true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={\`w-4 h-4 \${star <= rating ? 'fill-[#FF6B00] text-[#FF6B00]' : 'fill-gray-200 text-gray-200'}\`} />
        ))}
      </div>
    );
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: dateStr, time: '' };
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date, time };
  };

  const getPageNumbers = () => {
    if (!totalPages || !currentPage) return [];
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5, '...', totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
    }
    return pages;
  };

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto min-h-screen">
      <ReviewDrawer 
        isOpen={reviewDrawerOpen} 
        onClose={() => setReviewDrawerOpen(false)} 
        review={selectedReview} 
        onOpenOrder={(id) => navigate(\`/restaurant/orders/\${id}\`)}
      />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8 text-[#1a1f36]" strokeWidth={1.5} />
          <div>
            <h1 className="text-[28px] font-black text-[#1a1f36] tracking-tight leading-none mb-1">Reviews</h1>
            <p className="text-sm font-medium text-[#8896AB]">View and manage customer reviews</p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
        
        {/* Average Rating */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8ECF4] shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF3E8] flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF6B00]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] sm:text-[13px] font-bold text-[#8896AB] mb-0.5">Average Rating</p>
            <div className="text-[20px] sm:text-[26px] font-black text-[#FF6B00] leading-none mb-1 sm:mb-2">{averageRating.toFixed(1)}</div>
            <div className="hidden sm:block">{renderStars(Math.round(averageRating))}</div>
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8ECF4] shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F0F6FF] flex items-center justify-center shrink-0">
            <MessageSquareText className="w-5 h-5 sm:w-6 sm:h-6 text-[#1A73E8]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] sm:text-[13px] font-bold text-[#8896AB] mb-0.5 sm:mb-1">Total Reviews</p>
            <div className="text-[20px] sm:text-[28px] font-black text-[#1A73E8] leading-none">{totalReviews}</div>
          </div>
        </div>

        {/* Positive Reviews */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8ECF4] shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#E5F5ED] flex items-center justify-center shrink-0">
            <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A254]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] sm:text-[13px] font-bold text-[#8896AB] mb-0.5 sm:mb-1">Positive Reviews</p>
            <div className="text-[20px] sm:text-[28px] font-black text-[#00A254] leading-none">{positiveReviews}</div>
          </div>
        </div>

        {/* Negative Reviews */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8ECF4] shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF0F2] flex items-center justify-center shrink-0">
            <ThumbsDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF3B5C]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] sm:text-[13px] font-bold text-[#8896AB] mb-0.5 sm:mb-1">Negative Reviews</p>
            <div className="text-[20px] sm:text-[28px] font-black text-[#FF3B5C] leading-none">{negativeReviews}</div>
          </div>
        </div>

      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm overflow-hidden flex flex-col">
        
        {/* Filter Bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#E8ECF4] p-4 flex flex-col xl:flex-row xl:items-center justify-between shadow-sm gap-2">
          
          {/* Top Row: Search & Mobile Filter Toggle */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 w-full xl:w-auto">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896AB] group-focus-within:text-[#FF6B00] transition-colors" />
              <input
                type="text"
                placeholder="Search by customer name or order ID..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-[#E8ECF4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all shadow-sm hover:bg-white focus:bg-white placeholder:text-[#8896AB]/60 text-[#1a1f36]"
              />
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className={\`xl:hidden p-2.5 border rounded-xl transition-all shadow-sm shrink-0 \${isMobileFilterOpen ? 'bg-[#FFF3E8] border-[#FFD0B5] text-[#FF6B00]' : 'bg-gray-50 border-[#E8ECF4] text-[#8896AB] hover:text-[#FF6B00] hover:border-[#FF6B00]'}\`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Card */}
          <div className={\`xl:flex \${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col md:flex-row items-center gap-3 w-full xl:w-auto bg-gray-50 xl:bg-transparent p-4 xl:p-0 rounded-xl border border-[#E8ECF4] xl:border-none shadow-sm xl:shadow-none mt-2 xl:mt-0\`}>
            <div className="w-full md:w-[150px]">
            <Select
              value={selectedRating.toString()}
              onChange={(e) => {
                setSelectedRating(e.target.value === 'All' ? 'All' : Number(e.target.value));
                setCurrentPage(1);
              }}
              options={[
                { value: 'All', label: 'All Ratings' },
                { value: '5', label: '5 Stars' },
                { value: '4', label: '4 Stars' },
                { value: '3', label: '3 Stars' },
                { value: '2', label: '2 Stars' },
                { value: '1', label: '1 Star' }
              ]}
              className="py-2 h-auto text-sm font-bold border-[#E8ECF4] shadow-sm bg-gray-50/50 hover:bg-white"
            />
          </div>
        </div>
      </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#E8ECF4]">
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[20%]">Customer</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[15%]">Order ID</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[15%]">Rating</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[30%]">Review</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[15%]">Date</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white text-right w-[5%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF4]">
              <AnimatePresence>
                {paginatedReviews.length > 0 ? paginatedReviews.map((review) => {
                  const { date, time } = formatDateTime(review.date);
                  return (
                    <motion.tr 
                      key={review.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-[#FAFBFC] transition-colors"
                    >
                      <td className="py-7 px-6">
                        <span className="text-[14px] font-bold text-[#1a1f36] truncate max-w-[200px] inline-block">
                          {review.isAnonymous ? 'Anonymous' : review.customerName}
                        </span>
                      </td>
                      <td className="py-7 px-6">
                        <span className="text-[14px] font-bold text-[#1a1f36]">#{review.orderId.substring(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="py-7 px-6">
                        {renderStars(review.rating)}
                      </td>
                      <td className="py-7 px-6">
                        <div className="text-[14px] leading-relaxed font-medium text-[#8896AB] line-clamp-2 max-w-[350px]">
                          {review.comment || <span className="italic">No comment provided</span>}
                        </div>
                      </td>
                      <td className="py-7 px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[14px] font-medium text-[#1a1f36]">{date}</span>
                          <span className="text-[13px] font-bold text-[#8896AB] uppercase tracking-wider">{time}</span>
                        </div>
                      </td>
                      <td className="py-7 px-6 text-right">
                        <button 
                          onClick={() => handleOpenReview(review)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E8ECF4] bg-white hover:bg-gray-50 text-[#8896AB] hover:text-[#1a1f36] transition-colors shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#8896AB] text-[14px] font-medium">
                      No reviews found.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="mt-auto px-4 sm:px-6 py-4 border-t border-[#E8ECF4] flex flex-col items-center justify-center gap-4 bg-white rounded-b-2xl">
              <div className="flex items-center justify-center w-full gap-2 sm:gap-3">
                  <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-[#E8ECF4] hover:bg-[#F4F6FA] text-[#8896AB] hover:text-[#1a1f36] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                      <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                      {getPageNumbers().map((page, idx) => (
                          <button
                              key={idx}
                              onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                              disabled={page === '...'}
                              className={\`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all \${
                                  page === currentPage
                                      ? 'border border-[#FF6B00] text-[#FF6B00] bg-white'
                                      : page === '...'
                                          ? 'text-[#8896AB] cursor-default border-none bg-transparent'
                                          : 'border border-[#E8ECF4] text-[#1a1f36] bg-white hover:bg-[#F4F6FA]'
                                  }\`}
                          >
                              {page}
                          </button>
                      ))}
                  </div>

                  <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-[#E8ECF4] hover:bg-[#F4F6FA] text-[#8896AB] hover:text-[#1a1f36] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                      <ChevronRight className="w-4 h-4" />
                  </button>
              </div>
          </div>
        )}

      </div>

    </div>
  );
}
\`;

content = content.substring(0, analyticsIndex) + newTail;
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully rewrote ReviewsDashboard.tsx');
