import { CommodityPrice, FarmerLot, BuyerRequirement, LogisticsOption, OrderTransaction, ReviewItem, GrievanceTicket, MatchRecommendation, LanguageCode } from '../types';

export const api = {
  async getMandiPrices(params?: { search?: string; commodity?: string; state?: string; grade?: string; season?: string }): Promise<{ data: CommodityPrice[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.commodity) query.append('commodity', params.commodity);
    if (params?.state) query.append('state', params.state);
    if (params?.grade) query.append('grade', params.grade);
    if (params?.season) query.append('season', params.season);

    const res = await fetch(`/api/mandi-prices?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch mandi prices');
    return res.json();
  },

  async getBuyerRequirements(params?: { commodity?: string; buyerType?: string; state?: string }): Promise<{ data: BuyerRequirement[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.commodity) query.append('commodity', params.commodity);
    if (params?.buyerType) query.append('buyerType', params.buyerType);
    if (params?.state) query.append('state', params.state);

    const res = await fetch(`/api/buyer-requirements?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch buyer requirements');
    return res.json();
  },

  async postBuyerRequirement(req: Partial<BuyerRequirement>): Promise<{ success: boolean; data: BuyerRequirement }> {
    const res = await fetch('/api/buyer-requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to create buyer requirement');
    return res.json();
  },

  async getFarmerLots(params?: { commodity?: string; state?: string }): Promise<{ data: FarmerLot[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.commodity) query.append('commodity', params.commodity);
    if (params?.state) query.append('state', params.state);

    const res = await fetch(`/api/farmer-lots?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch farmer lots');
    return res.json();
  },

  async postFarmerLot(lot: Partial<FarmerLot>): Promise<{ success: boolean; data: FarmerLot }> {
    const res = await fetch('/api/farmer-lots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lot),
    });
    if (!res.ok) throw new Error('Failed to create harvest lot');
    return res.json();
  },

  async optimizeMatch(payload: {
    commodity: string;
    quantityQuintals: number;
    qualityGrade: string;
    farmerState: string;
    farmerDistrict: string;
    expectedPrice: number;
  }): Promise<{
    success: boolean;
    commodity: string;
    quantityQuintals: number;
    localMandiReference: CommodityPrice;
    localMandiGrossModal: number;
    localMandiNetRealization: number;
    recommendations: MatchRecommendation[];
  }> {
    const res = await fetch('/api/match-optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to calculate optimal matches');
    return res.json();
  },

  async getLogisticsOptions(): Promise<{ data: LogisticsOption[] }> {
    const res = await fetch('/api/logistics-options');
    if (!res.ok) throw new Error('Failed to fetch logistics options');
    return res.json();
  },

  async getOrders(): Promise<{ data: OrderTransaction[] }> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async createOrder(orderData: any): Promise<{ success: boolean; data: OrderTransaction }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async updateOrderStatus(id: string, update: { status?: string; escrowStatus?: string }): Promise<{ success: boolean; data: OrderTransaction }> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async getReviews(): Promise<{ data: ReviewItem[] }> {
    const res = await fetch('/api/reviews');
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async postReview(review: Partial<ReviewItem>): Promise<{ success: boolean; data: ReviewItem }> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) throw new Error('Failed to post review');
    return res.json();
  },

  async getGrievances(): Promise<{ data: GrievanceTicket[] }> {
    const res = await fetch('/api/grievances');
    if (!res.ok) throw new Error('Failed to fetch grievances');
    return res.json();
  },

  async postGrievance(grievance: Partial<GrievanceTicket>): Promise<{ success: boolean; data: GrievanceTicket }> {
    const res = await fetch('/api/grievances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grievance),
    });
    if (!res.ok) throw new Error('Failed to submit grievance');
    return res.json();
  },

  async verifyContact(phone: string, otp: string): Promise<{ success: boolean; verified: boolean; message: string }> {
    const res = await fetch('/api/verify-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    if (!res.ok) throw new Error('Verification failed');
    return res.json();
  },

  async queryAIAdvisor(prompt: string, language: LanguageCode, context?: any): Promise<{ reply: string }> {
    const res = await fetch('/api/ai-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language, context }),
    });
    if (!res.ok) throw new Error('Failed to get AI advisory');
    return res.json();
  },
};
