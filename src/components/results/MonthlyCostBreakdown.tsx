interface MonthlyCostBreakdownProps {
  emiAt85Pct: number;
  fuelMonthly: number;
  insuranceMonthly: number;
  totalMonthly: number;
}

function fmt(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function MonthlyCostBreakdown({ emiAt85Pct, fuelMonthly, insuranceMonthly, totalMonthly }: MonthlyCostBreakdownProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-2">Est. monthly ownership</p>
      <div className="grid grid-cols-4 gap-1 text-center">
        <div>
          <p className="text-sm font-semibold text-brand-navy">{fmt(emiAt85Pct)}</p>
          <p className="text-[10px] text-gray-400">EMI</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-navy">{fmt(fuelMonthly)}</p>
          <p className="text-[10px] text-gray-400">Fuel</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-navy">{fmt(insuranceMonthly)}</p>
          <p className="text-[10px] text-gray-400">Insurance</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-red">{fmt(totalMonthly)}</p>
          <p className="text-[10px] text-gray-400">Total/mo</p>
        </div>
      </div>
    </div>
  );
}
