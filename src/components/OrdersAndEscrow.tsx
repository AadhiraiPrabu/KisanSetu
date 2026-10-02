import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Truck, 
  FileText, 
  Star, 
  AlertCircle, 
  ArrowRight, 
  DollarSign, 
  QrCode, 
  X,
  PhoneCall,
  RefreshCw,
  Send
} from 'lucide-react';
import { OrderTransaction, LanguageCode, ReviewItem } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { api } from '../services/api';

interface OrdersAndEscrowProps {
  currentLang: LanguageCode;
  onOpenGrievance: (orderId: string) => void;
}

export const OrdersAndEscrow: React.FC<OrdersAndEscrowProps> = ({
  currentLang,
  onOpenGrievance,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [orders, setOrders] = useState<OrderTransaction[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Digital Contract Modal
  const [selectedOrderForContract, setSelectedOrderForContract] = useState<OrderTransaction | null>(null);

  // Leave Review Modal
  const [reviewModalOrder, setReviewModalOrder] = useState<OrderTransaction | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchOrdersAndReviews = async () => {
    setIsLoading(true);
    try {
      const [orderRes, reviewRes] = await Promise.all([
        api.getOrders(),
        api.getReviews(),
      ]);
      setOrders(orderRes.data);
      setReviews(reviewRes.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndReviews();
  }, []);

  const handleAdvanceStatus = async (order: OrderTransaction) => {
    let nextStatus = order.status;
    let nextEscrow = order.escrowStatus;

    if (order.status === 'created') {
      nextStatus = 'escrow_funded';
      nextEscrow = 'Held in Escrow';
    } else if (order.status === 'escrow_funded') {
      nextStatus = 'dispatched';
    } else if (order.status === 'dispatched') {
      nextStatus = 'quality_inspected';
    } else if (order.status === 'quality_inspected') {
      nextStatus = 'completed';
      nextEscrow = 'Released to Farmer';
    }

    try {
      await api.updateOrderStatus(order.id, { status: nextStatus, escrowStatus: nextEscrow });
      fetchOrdersAndReviews();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalOrder) return;

    setIsSubmittingReview(true);
    try {
      await api.postReview({
        authorName: reviewModalOrder.farmer.name,
        authorRole: 'farmer',
        targetName: reviewModalOrder.buyer.company,
        rating: ratingVal,
        commodity: reviewModalOrder.commodity,
        comment: reviewComment,
        date: 'Today',
        verifiedTransaction: true,
      });

      setReviewModalOrder(null);
      setReviewComment('');
      fetchOrdersAndReviews();
    } catch (err) {
      console.error('Failed to post review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusStepIndex = (status: OrderTransaction['status']) => {
    switch (status) {
      case 'created': return 1;
      case 'escrow_funded': return 2;
      case 'dispatched': return 3;
      case 'quality_inspected': return 4;
      case 'completed': return 5;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RBI-Compliant T+1 Digital Escrow Settlement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.ordersEscrow} & Transparent Settlements
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Buyer payments are locked into bank escrow BEFORE dispatch and automatically paid to your account within 24 hours of delivery.
          </p>
        </div>

        <button
          onClick={fetchOrdersAndReviews}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-xs border border-emerald-500/40 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const stepIndex = getStatusStepIndex(order.status);
          const isCompleted = order.status === 'completed';

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-stone-900">
                      Order #{order.id}
                    </span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs text-stone-500">{order.createdAt}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      Grade {order.grade}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-stone-900 mt-1">
                    {order.commodity} • {order.quantityQuintals} Quintals
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-stone-500 font-medium">Total Deal Value</div>
                  <div className="text-xl font-black text-emerald-800">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-600">
                    Rate: ₹{order.agreedPricePerQuintal.toLocaleString()} / Qtl
                  </div>
                </div>
              </div>

              {/* Progress 5-Stage Stepper */}
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-1 text-center">
                  <div className={`text-[10px] sm:text-xs font-bold ${stepIndex >= 1 ? 'text-emerald-700' : 'text-stone-400'}`}>
                    1. Created
                  </div>
                  <div className={`text-[10px] sm:text-xs font-bold ${stepIndex >= 2 ? 'text-emerald-700' : 'text-stone-400'}`}>
                    2. Escrow Locked
                  </div>
                  <div className={`text-[10px] sm:text-xs font-bold ${stepIndex >= 3 ? 'text-emerald-700' : 'text-stone-400'}`}>
                    3. Dispatched
                  </div>
                  <div className={`text-[10px] sm:text-xs font-bold ${stepIndex >= 4 ? 'text-emerald-700' : 'text-stone-400'}`}>
                    4. Quality Check
                  </div>
                  <div className={`text-[10px] sm:text-xs font-bold ${stepIndex >= 5 ? 'text-emerald-700' : 'text-stone-400'}`}>
                    5. Paid (T+1)
                  </div>
                </div>

                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${(stepIndex / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Parties & Logistics Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-3.5 rounded-xl text-xs text-stone-700 border border-stone-200">
                <div>
                  <span className="text-stone-400 font-bold block text-[10px] uppercase">Farmer / Seller</span>
                  <strong className="text-stone-900 text-sm">{order.farmer.name}</strong>
                </div>

                <div>
                  <span className="text-stone-400 font-bold block text-[10px] uppercase">Buyer / Company</span>
                  <strong className="text-stone-900 text-sm">{order.buyer.company}</strong>
                </div>

                <div>
                  <span className="text-stone-400 font-bold block text-[10px] uppercase">Escrow Protection</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                    <Lock className="w-3.5 h-3.5" />
                    Status: {order.escrowStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOrderForContract(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-600" />
                    <span>View Digital Contract</span>
                  </button>

                  <button
                    onClick={() => onOpenGrievance(order.id)}
                    className="flex items-center gap-1 text-rose-700 hover:text-rose-800 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Report Dispute</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!isCompleted && (
                    <button
                      onClick={() => handleAdvanceStatus(order)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <span>Simulate Next Stage ({stepIndex + 1}/5)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => setReviewModalOrder(order)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Rate & Review Buyer</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Digital Contract Modal */}
      {selectedOrderForContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-stone-950 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">Digital Agri-Trade Contract</h3>
              </div>
              <button
                onClick={() => setSelectedOrderForContract(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs text-stone-700">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-emerald-950">Contract ID: {selectedOrderForContract.id}</div>
                  <div className="text-[11px] text-emerald-700">Direct Farm-Gate Non-Intermediary Agreement</div>
                </div>
                <QrCode className="w-8 h-8 text-emerald-900" />
              </div>

              <div className="space-y-2 border-b border-stone-200 pb-3">
                <div className="flex justify-between">
                  <span className="text-stone-500">Seller / Farmer:</span>
                  <strong className="text-stone-900">{selectedOrderForContract.farmer.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Buyer:</span>
                  <strong className="text-stone-900">{selectedOrderForContract.buyer.company}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Commodity & Grade:</span>
                  <strong className="text-stone-900">{selectedOrderForContract.commodity} (Grade {selectedOrderForContract.grade})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Total Quantity:</span>
                  <strong className="text-stone-900">{selectedOrderForContract.quantityQuintals} Quintals</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Agreed Price:</span>
                  <strong className="text-emerald-800">₹{selectedOrderForContract.agreedPricePerQuintal} / Quintal</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Total Contract Value:</span>
                  <strong className="text-stone-900 text-sm">₹{selectedOrderForContract.totalAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div className="font-bold text-stone-800">Binding Legal Clauses:</div>
                <div>1. 100% of purchase consideration is held in KisanSetu Escrow Bank prior to dispatch.</div>
                <div>2. Weighment slip at arrival terminal and digital moisture test govern final release.</div>
                <div>3. Settlement released within 24 hours (T+1) directly via NEFT/RTGS to seller bank.</div>
                <div>4. Zero middleman commissions or unrecorded market cess deducted.</div>
              </div>
            </div>

            <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedOrderForContract(null)}
                className="px-4 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 cursor-pointer"
              >
                Close Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden">
            <div className="bg-stone-950 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base">Rate Buyer & Payment Speed</h3>
              <button
                onClick={() => setReviewModalOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostReview} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Buyer: <strong className="text-stone-900">{reviewModalOrder.buyer.company}</strong>
                </label>
                <p className="text-[11px] text-stone-500">Your review helps other farmers select reliable buyers.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRatingVal(num)}
                      className={`p-2 rounded-xl transition-all ${
                        ratingVal >= num ? 'bg-amber-100 text-amber-600 scale-105' : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${ratingVal >= num ? 'fill-amber-500' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Comment & Feedback</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Prompt payment on T+1, accurate weighment, professional team."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingReview ? 'Submitting...' : 'Post Verified Review'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Community Verified Reviews Feed */}
      <div className="space-y-3 pt-4 border-t border-stone-200">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
          Recent Farmer & Buyer Ratings ({reviews.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs text-stone-900">{rev.authorName}</strong>
                  <span className="text-[11px] text-stone-400 ml-1.5">reviewed <strong>{rev.targetName}</strong></span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span className="text-xs font-bold text-stone-800">{rev.rating}.0</span>
                </div>
              </div>

              <p className="text-xs text-stone-600 italic">"{rev.comment}"</p>
              <div className="text-[10px] text-stone-400">{rev.date}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
