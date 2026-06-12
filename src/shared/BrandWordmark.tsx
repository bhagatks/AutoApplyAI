import './brand-wordmark.css';

type BrandWordmarkProps = {
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'strong';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** dark = light text (default app theme); light = dark text on light surfaces */
  theme?: 'light' | 'dark';
  className?: string;
};

export default function BrandWordmark({
  as: Tag = 'span',
  size = 'md',
  theme = 'dark',
  className = '',
}: BrandWordmarkProps) {
  return (
    <Tag className={`brand-wordmark brand-wordmark--${size} brand-wordmark--${theme} ${className}`.trim()}>
      AutoApply<span className="brand-wordmark-ai">AI</span>
    </Tag>
  );
}
