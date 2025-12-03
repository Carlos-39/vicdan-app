'use client';

import React, { useRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import styles from './RippleButton.module.css';

interface RippleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/*
background
text
fuente
*/

export default function RippleButton({ children, onClick, className = '' }: RippleButtonProps) {
  const rippleElRef = useRef<HTMLSpanElement | null>(null);

  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;

    // Remover onda anterior si existe
    if (rippleElRef.current) {
      rippleElRef.current.remove();
    }

    const rippleEl = document.createElement('span');
    rippleEl.className = styles.ripple;
    rippleEl.style.width = rippleEl.style.height = `${size}px`;
    rippleEl.style.left = `${e.clientX - rect.left - size / 2}px`;
    rippleEl.style.top = `${e.clientY - rect.top - size / 2}px`;
    
    button.appendChild(rippleEl);
    rippleElRef.current = rippleEl;

    requestAnimationFrame(() => {
      rippleEl.classList.add(styles.expand);
    });
  };

  const endRipple = () => {
    if (!rippleElRef.current) return;
    
    rippleElRef.current.classList.remove(styles.expand);
    rippleElRef.current.classList.add(styles.fade);
    
    rippleElRef.current.addEventListener('transitionend', () => {
      rippleElRef.current?.remove();
      rippleElRef.current = null;
    }, { once: true });
  };

  return (
    <button
      className={cn(styles.btn, className)}
      
      onMouseDown={handleMouseDown}
      onMouseUp={endRipple}
      onMouseLeave={endRipple}
      onTouchEnd={endRipple}
      onTouchCancel={endRipple}
      onClick={onClick}
      style={{
        color: 'white',
        fontSize: '16px',
        hover: {
          color: 'black',
        }
      }}
    >
      <span className={styles.txt}>{children}</span>
    </button>
  );
}