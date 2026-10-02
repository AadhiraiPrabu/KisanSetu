import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  FileText, 
  RefreshCw,
  X,
  Send
} from 'lucide-react';
import { GrievanceTicket, LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { api } from '../services/api';

interface GrievancePortalProps {
  currentLang: LanguageCode;
  presetOrderId?: string | null;
}

export const GrievancePortal: React.FC<GrievancePortalProps> = ({
  currentLang,
  presetOrderId,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [tickets, setTickets] = useState<GrievanceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(!!presetOrderId);

  // Form State
  const [orderId, setOrderId] = useState(presetOrderId || 'ORD-8921');
  const [issueType, setIssueType] = useState<GrievanceTicket['issueType']>('Weight Mismatch');
  const [description, setDescription] = useState('');
  const [userName, setUserName] = useState('Rameshwar Patel');
  const [phone, setPhone] = useState('+91 98260 91455');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGrievances = async () => {
    setIsLoading(true);
    try {
      const res = await api.getGrievances();
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching grievances:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
    if (presetOrderId) {
      setOrderId(presetOrderId);
      setIsModalOpen(true);
    }
  }, [presetOrderId]);

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    setIsSubmitting(true);
    try {
      await api.postGrievance({
        orderId,
        raisedBy: 'farmer',
        userName,
        phone,
        issueType,
        description,
        status: 'open',
      });

      setIsModalOpen(false);
      setDescription('');
      fetchGrievances();
    } catch (err) {
      console.error('Failed to submit grievance:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 px-3 py-0.5 rounded-full text-xs font-bold border border-rose-400/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>24x7 Digital Mediation & Escrow Arbitration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.grievances} & Dispute Resolution
          </h1>
          <p className="text-xs sm:text-sm text-stone-300">
            Transparent dispute redressal backed by photo evidence, automated digital weighbridge audit, and independent agronomist mediation.
          </p>
        </div>

        <button
          id="btn-raise-dispute"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Grievance</span>
        </button>
      </div>

      {/* Grievance Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-stone-900">
                  Ticket #{ticket.id}
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-stone-500">Order #{ticket.orderId}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  {ticket.issueType}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  ticket.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : ticket.status === 'under_investigation'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                }`}>
                  {ticket.status === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {ticket.status === 'under_investigation' && <Clock className="w-3.5 h-3.5" />}
                  <span>Status: {ticket.status.replace('_', ' ').toUpperCase()}</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
              "{ticket.description}"
            </p>

            {ticket.resolutionNotes && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-950 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Arbitration Resolution:</span>
                </div>
                <p>{ticket.resolutionNotes}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
              <span>Filed by: {ticket.userName} ({ticket.raisedBy})</span>
              <span>Updated: {ticket.createdAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden">
            <div className="bg-stone-950 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="font-extrabold text-base">Submit Dispute to KisanSetu Mediation</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGrievance} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Order ID</label>
                  <input
                    type="text"
                    required
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Dispute Category</label>
                  <select
                    value={issueType}
                    onChange={(e: any) => setIssueType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Weight Mismatch">Weight Mismatch / Weighment</option>
                    <option value="Quality Dispute">Quality Grade Dispute</option>
                    <option value="Payment Delay">Payment Release Delay</option>
                    <option value="Logistics Delay">Logistics / Transit Delay</option>
                    <option value="Middleman Interference">Middleman Interference</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Complainant Name & Contact</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the issue with weighment slips, moisture test discrepancy, or delivery status..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600">
                • When a grievance is raised, escrow funds remain locked until mediation verification.<br />
                • Resolution takes under 24 hours with geo-tagged weighbridge verification.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Grievance Ticket'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
