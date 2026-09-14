import React, { useId } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { Users, Trash2 } from './InterfaceIcons';
import { nativeTransition } from './NativeMotion';

type Props = {
  value: 'active' | 'trash';
  onChange: (value: 'active' | 'trash') => void;
  contactsLabel: string;
  trashLabel: string;
  trashCount: number;
};

export function ContactViewSwitch({ value, onChange, contactsLabel, trashLabel, trashCount }: Props) {
  const id = useId();
  return (
    <LayoutGroup id={id}>
      <div className="ios-segmented" role="group" aria-label={`${contactsLabel} / ${trashLabel}`}>
        {([{ id: 'active', label: contactsLabel, Icon: Users }, { id: 'trash', label: trashLabel, Icon: Trash2 }] as const).map(item => (
          <button key={item.id} type="button" className="ios-segment" aria-pressed={value === item.id} onClick={() => onChange(item.id)}>
            {value === item.id && <motion.span className="ios-segment-selection" layoutId="selection" transition={nativeTransition} />}
            <item.Icon size={17} />
            <span>{item.label}</span>
            {item.id === 'trash' && trashCount > 0 && <small className="ios-segment-count">{trashCount}</small>}
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}
