"use client";

import { Building, MapPin, Phone, Mail, User } from "lucide-react";

interface ClientCardProps {
  client: {
    id: number;
    name: string;
    email?: string;
    contactPhone?: string;
    address?: string;
    city?: string;
    state?: string;
    ownerName?: string;
  };
  deal?: {
    id: number;
    name: string;
    stageCode: string;
    department: string;
    valueAmount?: number;
    closingDate?: string;
  };
  onClick?: () => void;
  compact?: boolean;
}

export default function ClientCard({ client, deal, onClick, compact = false }: ClientCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { 
      style: "currency", 
      currency: "INR" 
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium text-slate-900">{client.name}</div>
            {deal && (
              <div className="mt-1 text-xs text-slate-500">
                {deal.department} • {deal.stageCode}
              </div>
            )}
          </div>
          {deal?.valueAmount && (
            <div className="text-sm font-semibold text-indigo-600">
              {formatCurrency(deal.valueAmount)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{client.name}</h3>
          {deal && (
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                {deal.department}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {deal.stageCode}
              </span>
            </div>
          )}
        </div>
        {client.ownerName && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <User className="h-3 w-3" />
            {client.ownerName}
          </div>
        )}
      </div>

      {/* Deal Info */}
      {deal && (
        <div className="mb-3 rounded-lg bg-slate-50 p-3">
          <div className="font-medium text-slate-900">{deal.name}</div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-slate-600">Value</span>
            <span className="font-semibold text-indigo-600">
              {formatCurrency(deal.valueAmount)}
            </span>
          </div>
          {deal.closingDate && (
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">Closing</span>
              <span className="text-slate-900">{formatDate(deal.closingDate)}</span>
            </div>
          )}
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2 text-sm text-slate-600">
        {client.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        
        {client.contactPhone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>{client.contactPhone}</span>
          </div>
        )}
        
        {(client.address || client.city) && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
            <span className="text-slate-600">
              {client.address && `${client.address}`}
              {client.address && client.city && ", "}
              {client.city && client.city}
              {client.city && client.state && `, ${client.state}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
