import React, { forwardRef } from 'react';
import type { LucideProps } from 'lucide-react';

// Original interface symbols on a shared 24-point grid.
function symbol(name: string, drawing: React.ReactNode) {
  const Icon = forwardRef<SVGSVGElement, LucideProps>(({ size = 24, strokeWidth = 1.65, className = '', ...props }, ref) => (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} className={`interface-symbol ${className}`}>
      {drawing}
    </svg>
  ));
  Icon.displayName = name;
  return Icon;
}

export const Users = symbol('Contacts', <><circle cx="9" cy="7.4" r="3" /><path d="M3.7 19v-1.1c0-3.1 2.2-5.1 5.3-5.1s5.3 2 5.3 5.1V19Z" fill="currentColor" fillOpacity=".08" /><path d="M16 4.6a3 3 0 0 1 0 5.6M17.4 13c2 .7 3 2.4 3 4.9V19h-2.6" /></>);
export const Trash2 = symbol('Trash', <><path d="M5.8 6.8h12.4l-.8 12.3c0 .8-.7 1.4-1.5 1.4H8.1c-.8 0-1.5-.6-1.5-1.4Z" fill="currentColor" fillOpacity=".07" /><path d="M4 6.8h16M9 6.8V4.7c0-.7.5-1.2 1.2-1.2h3.6c.7 0 1.2.5 1.2 1.2v2.1M9.7 10.5l.3 6.7M14.3 10.5l-.3 6.7" /></>);
export const Trash = Trash2;
export const Filter = symbol('Filter', <><circle cx="12" cy="12" r="8.5" fill="currentColor" fillOpacity=".04" /><path d="M7.5 9h9M9 12h6M10.5 15h3" /></>);
export const Edit2 = symbol('Edit', <><path d="M12.4 5H6.1C4.9 5 4 5.9 4 7.1v10.8C4 19.1 4.9 20 6.1 20h10.8c1.2 0 2.1-.9 2.1-2.1v-6.3" /><path d="m10 12.4-.7 3.3 3.3-.7 7.1-7.1a1.5 1.5 0 0 0 0-2.1l-1.5-1.5a1.5 1.5 0 0 0-2.1 0Zm4.8-6.8 3.6 3.6" fill="currentColor" fillOpacity=".06" /></>);
export const Download = symbol('ImportExport', <><path d="M12 3.5v10m-3.3-3.3 3.3 3.3 3.3-3.3M5 13v5.1c0 1.1.8 1.9 1.9 1.9h10.2c1.1 0 1.9-.8 1.9-1.9V13" /></>);
export const Copy = symbol('Copy', <><rect x="8" y="7" width="11" height="14" rx="2.4" fill="currentColor" fillOpacity=".06" /><path d="M15 4.5V4c0-1.1-.9-2-2-2H6C4.9 2 4 2.9 4 4v10c0 1.1.9 2 2 2h.5" /></>);
export const X = symbol('Close', <path d="m7 7 10 10M17 7 7 17" />);
export const Plus = symbol('Add', <path d="M12 5v14M5 12h14" />);
export const Settings2 = symbol('Adjustments', <><path d="M4 7h7m5 0h4M4 17h4m5 0h7" /><circle cx="13.5" cy="7" r="2.5" fill="currentColor" fillOpacity=".07" /><circle cx="10.5" cy="17" r="2.5" fill="currentColor" fillOpacity=".07" /></>);
