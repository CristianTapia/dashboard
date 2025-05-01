type Props = {
  onClick: () => void;
  text: string;
  icon?: string;
  className?: string;
};

export default function Buttons({ onClick, text, className }: Props) {
  return (
    <button className={className} onClick={onClick}>
      {text}
    </button>
  );
}
