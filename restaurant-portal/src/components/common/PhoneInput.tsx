import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Select from './Select';
import { Country } from 'country-state-city';

interface PhoneInputProps {
  name: string;
  value: string;
  extValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onExtChange: any;
  error?: string;
  disabled?: boolean;
}

export default function PhoneInput({ name, value, extValue, onChange, onExtChange, error, disabled }: PhoneInputProps) {
  const countryOptions = useMemo(() => {
    const uniquePhoneCodes = new Map<string, { value: string, label: string }>();
    Country.getAllCountries().forEach(c => {
      const code = `+${c.phonecode}`;
      if (!uniquePhoneCodes.has(code)) {
        uniquePhoneCodes.set(code, { value: code, label: `${code} (${c.isoCode})` });
      }
    });
    const arr = Array.from(uniquePhoneCodes.values());
    const popularCodes = ['+91', '+1', '+44', '+61', '+971'];
    const popular = popularCodes.map(code => arr.find(o => o.value === code)).filter(Boolean) as {value: string, label: string}[];
    const rest = arr.filter(o => !popularCodes.includes(o.value)).sort((a, b) => {
      const aNum = parseInt(a.value.replace('+',''));
      const bNum = parseInt(b.value.replace('+',''));
      return aNum - bNum;
    });
    return [...popular, ...rest];
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-brand-navy">Phone Number <span className="text-brand-orange-500">*</span></label>
      <div className="flex gap-2">
        <div className="w-[130px] shrink-0">
          <Select
            name={`${name}Ext`}
            value={extValue || '+91'}
            onChange={onExtChange}
            options={countryOptions}
            disabled={disabled}
            placeholder="Ext"
          />
        </div>
        <input
          type="tel"
          name={name}
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            if (v.length <= 10) {
              e.target.value = v;
              onChange(e);
            }
          }}
          placeholder="10 digit mobile number"
          disabled={disabled}
          maxLength={10}
          className={`flex-1 px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${
            disabled ? 'opacity-70 cursor-not-allowed border-border' : `focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${
              error ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
            }`
          }`}
        />
      </div>
      {error && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{error}</motion.span>}
    </div>
  );
}
