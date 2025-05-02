type Props = {
  onClick: () => void;
  text: string;
  icon?: string;
  variantClassName?: string;
};

export default function Buttons({ onClick, text, variantClassName }: Props) {
  const baseClass = "p-1 border-1 rounded hover:bg-blue-300";
  return (
    <button className={`${baseClass} ${variantClassName}`} onClick={onClick}>
      {text}
    </button>
  );
}
