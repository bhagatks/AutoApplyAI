import type { ReactNode, CSSProperties } from 'react';
import BrandWordmark from './BrandWordmark';

type BrandLockupProps = {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  subText?: ReactNode;
  className?: string;
  href?: string;
  style?: CSSProperties;
};

export default function BrandLockup({
  theme = 'dark',
  size = 'md',
  subText,
  className = '',
  href,
  style,
}: BrandLockupProps) {
  const mark = (
    <span className={`brand-lockup-mark brand-lockup-mark--${size}`} aria-hidden="true">
      <img src="/icon-48.png" alt="" />
    </span>
  );

  const textBlock = (
    <div className="brand-lockup-text">
      <BrandWordmark theme={theme} size={size} />
      {subText ? <span className="brand-lockup-sub">{subText}</span> : null}
    </div>
  );

  const inner = (
    <>
      {mark}
      {textBlock}
    </>
  );

  const classes = `brand-lockup brand-lockup--${size} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes} aria-label="AutoApplyAI home" style={style}>
        {inner}
      </a>
    );
  }

  return <div className={classes} style={style}>{inner}</div>;
}
