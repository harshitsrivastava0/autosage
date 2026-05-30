"use client";

import { useState, useCallback } from "react";

const BANKS = [
  { name: "SBI", rate: 8.55 },
  { name: "HDFC", rate: 8.75 },
  { name: "ICICI", rate: 8.90 },
  { name: "Kotak", rate: 8.65 },
  { name: "Axis", rate: 8.80 },
];

function calcEMI(principal: number, annualRate: number, tenureYears: number): number {
  const r = annualRate / 100 / 12;
  const n = tenureYears * 12;
  if (r === 0) return Math.round(principal / n);
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

function fmt(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

interface EMICalculatorProps {
  exShowroomPrice: number;
}

export function EMICalculator({ exShowroomPrice }: EMICalculatorProps) {
  const [loanPct, setLoanPct] = useState(85); // % of ex-showroom
  const [rate, setRate] = useState(8.55);
  const [tenure, setTenure] = useState(5);

  const loanAmount = Math.round(exShowroomPrice * loanPct / 100);
  const downPayment = exShowroomPrice - loanAmount;
  const emi = calcEMI(loanAmount, rate, tenure);
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - loanAmount;

  const applyBank = useCallback((bankRate: number) => setRate(bankRate), []);

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-brand-navy">EMI Calculator</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">Loan amount</span>
              <span className="font-semibold text-brand-navy">{fmt(loanAmount)}</span>
            </div>
            <input type="range" min={50} max={100} step={5} value={loanPct}
              onChange={(e) => setLoanPct(+e.target.value)}
              className="w-full accent-brand-navy" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>50%</span><span>100%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">Down payment</span>
              <span className="font-semibold text-gray-700">{fmt(downPayment)}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">Interest rate</span>
              <span className="font-semibold text-brand-navy">{rate.toFixed(2)}% p.a.</span>
            </div>
            <input type="range" min={6} max={14} step={0.05} value={rate}
              onChange={(e) => setRate(+e.target.value)}
              className="w-full accent-brand-navy" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>6%</span><span>14%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">Tenure</span>
              <span className="font-semibold text-brand-navy">{tenure} years</span>
            </div>
            <input type="range" min={1} max={7} step={1} value={tenure}
              onChange={(e) => setTenure(+e.target.value)}
              className="w-full accent-brand-navy" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1yr</span><span>7yr</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-brand-navy rounded-2xl p-5 text-white text-center">
            <p className="text-xs text-white/60 mb-1">Monthly EMI</p>
            <p className="text-4xl font-bold">{fmt(emi)}</p>
            <p className="text-xs text-white/50 mt-1">for {tenure} years</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Total interest</p>
              <p className="text-sm font-semibold text-brand-red">{fmt(totalInterest)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Total payment</p>
              <p className="text-sm font-semibold text-brand-navy">{fmt(totalPayment)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank rates */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Compare bank rates</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {BANKS.map(({ name, rate: br }) => (
            <button
              key={name}
              onClick={() => applyBank(br)}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                Math.abs(rate - br) < 0.01
                  ? "border-brand-navy bg-brand-navy/5"
                  : "border-gray-100 hover:border-brand-navy/50"
              }`}
            >
              <span className="text-xs font-bold text-gray-700">{name}</span>
              <span className="text-xs text-brand-blue mt-0.5">{br}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
