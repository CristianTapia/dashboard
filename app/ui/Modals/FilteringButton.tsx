type Props = {
  onClick: () => void;
  text: string;
  icon?: string;
  variantClassName?: string;
  disabled?: boolean;
};

export default function Buttons({ onClick, text, variantClassName, disabled }: Props) {
  const baseClass = "p-1 border-1 rounded";
  return (
    <button className={`${baseClass} ${variantClassName}`} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}
