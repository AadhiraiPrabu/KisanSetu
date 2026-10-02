export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'mr' | 'bn' | 'pa' | 'gu';

export type UserRole = 'farmer' | 'fpo' | 'buyer' | 'logistics' | 'admin';

export type BuyerCategory = 'family' | 'retail_shop' | 'wholesale' | 'quick_commerce' | 'food_processor' | 'exporter';

export type QualityGrade = 'A+' | 'A' | 'B' | 'C' | 'Organic' | 'Export';

export interface CommodityPrice {
  id: string;
  commodity: string;
  category: 'Cereals' | 'Pulses' | 'Oilseeds' | 'Vegetables' | 'Fruits' | 'Spices' | 'Cash Crops';
  mandi: string;
  district: string;
  state: string;
  variety: string;
  minPrice: number; // INR per Quintal
  maxPrice: number;
  modalPrice: number;
  previousModalPrice: number;
  priceChange: number; // percentage
  arrivalsToday: number; // in Quintals
  arrivalsUnit: string;
  grade: QualityGrade;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Year-round';
  updatedAt: string;
  forecastTrend: 'rising' | 'falling' | 'stable';
  bestSellingWindow: string;
  predictedPriceNextWeek: number;
  confidenceScore: number;
  priceHistory: { date: string; price: number; volume: number }[];
}

export interface FarmerLot {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  isPhoneVerified: boolean;
  village: string;
  district: string;
  state: string;
  commodity: string;
  variety: string;
  quantityQuintals: number;
  qualityGrade: QualityGrade;
  moisturePercentage: number;
  foreignMatterPercentage: number;
  expectedPricePerQuintal: number;
  minAcceptablePrice: number;
  harvestDate: string;
  availableFrom: string;
  storageType: 'Farm Gate' | 'Warehouse' | 'Cold Storage' | 'On-Field';
  status: 'active' | 'negotiating' | 'sold' | 'in_transit';
  fpoAffiliated?: string;
  images?: string[];
  createdAt: string;
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: BuyerCategory;
  companyOrOrg: string;
  isVerified: boolean;
  kycDocType: 'GST' | 'FSSAI' | 'PAN' | 'Aadhaar' | 'Trade License';
  contactPhone: string;
  deliveryLocation: {
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  commodity: string;
  variety: string;
  minQuantityQuintals: number;
  maxQuantityQuintals: number;
  requiredGrade: QualityGrade;
  maxMoistureAllowed: number;
  offeredPricePerQuintal: number;
  paymentTerms: 'Immediate T+0' | 'T+1 Escrow' | 'T+3 Bank Transfer' | 'Advance 30% + Balance Delivery';
  paymentReliabilityScore: number; // out of 100
  rating: number; // out of 5
  reviewsCount: number;
  neededByDate: string;
  transportPreference: 'Buyer Arranges' | 'Farmer Arranges' | 'Platform Kisan Rail / Rural Carrier';
  notes: string;
  createdAt: string;
}

export interface MatchRecommendation {
  buyerRequirement: BuyerRequirement;
  matchScore: number; // 0-100
  grossRevenue: number;
  estimatedTransportCost: number;
  mandiMiddlemanSavings: number;
  netRealizationPerQuintal: number;
  totalNetRealization: number;
  mandiNetRealization: number;
  gainOverMandiPercentage: number;
  transportDistanceKm: number;
  suggestedTransportMode: string;
  optimizationFactors: {
    priceAttractiveness: number;
    qualityCompatibility: number;
    distanceConvenience: number;
    buyerReliability: number;
  };
}

export interface LogisticsOption {
  id: string;
  name: string;
  type: 'Kisan Rail Express' | 'Radheemena Rural Carrier' | 'AgriReefer Cold Chain' | 'Mini-Truck Pool';
  baseRatePerKm: number;
  perQuintalRatePer100Km: number;
  minCapacityQuintals: number;
  maxCapacityQuintals: number;
  coverageStates: string[];
  features: string[];
  phone: string;
  rating: number;
  bookingAvailable: boolean;
}

export interface OrderTransaction {
  id: string;
  lotId: string;
  requirementId?: string;
  commodity: string;
  quantityQuintals: number;
  grade: QualityGrade;
  agreedPricePerQuintal: number;
  totalAmount: number;
  farmer: {
    id: string;
    name: string;
    phone: string;
    location: string;
  };
  buyer: {
    id: string;
    name: string;
    company: string;
    category: BuyerCategory;
    phone: string;
    location: string;
  };
  logistics: {
    providerName: string;
    trackingId: string;
    estimatedDelivery: string;
    freightCost: number;
  };
  status: 'created' | 'escrow_funded' | 'dispatched' | 'quality_inspected' | 'completed' | 'disputed';
  escrowStatus: 'Pending Deposit' | 'Held in Escrow' | 'Released to Farmer' | 'Refunded';
  contactVerified: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface ReviewItem {
  id: string;
  authorName: string;
  authorRole: 'farmer' | 'buyer' | 'fpo';
  targetName: string;
  rating: number;
  commodity: string;
  comment: string;
  date: string;
  verifiedTransaction: boolean;
}

export interface GpsWaypoint {
  name: string;
  location: string;
  lat: number;
  lng: number;
  time: string;
  status: 'passed' | 'current' | 'upcoming';
  remarks?: string;
}

export interface GpsTrackingData {
  trackingId: string;
  orderId: string;
  commodity: string;
  quantityQuintals: number;
  vehicleNumber: string;
  vehicleType: 'Refrigerated Reefer Truck (15 MT)' | 'Kisan Rail Rake #KR-204' | 'Direct Eicher 14ft' | 'Heavy Multi-Axle Carrier';
  driverName: string;
  driverPhone: string;
  driverRating: number;
  origin: {
    title: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  destination: {
    title: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  currentPosition: {
    lat: number;
    lng: number;
    heading: number; // degrees
    speedKmH: number;
    lastUpdated: string;
  };
  telemetry: {
    cargoTempCelsius: number;
    targetTempCelsius: number;
    moisturePercent: number;
    batteryLevel: number;
    fuelPercent: number;
    digitalSealLocked: boolean;
    doorOpeningsCount: number;
  };
  totalDistanceKm: number;
  distanceCoveredKm: number;
  estimatedArrival: string;
  etaHours: number;
  transitStatus: 'Dispatched from Farm Gate' | 'In Transit on Green Highway' | 'Halted at Weighbridge' | 'Arrived at Buyer Terminal';
  waypoints: GpsWaypoint[];
}

export interface GrievanceTicket {
  id: string;
  orderId: string;
  raisedBy: 'farmer' | 'buyer';
  userName: string;
  phone: string;
  issueType: 'Payment Delay' | 'Quality Dispute' | 'Weight Mismatch' | 'Logistics Delay' | 'Middleman Interference';
  description: string;
  status: 'open' | 'under_investigation' | 'resolved';
  resolutionNotes?: string;
  createdAt: string;
}
