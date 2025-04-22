type FilteringProps = {
  onShowHideCategoryClickAction: () => void;
  showHideCategoryButton: string;
  category?: React.ReactNode;
  onShowHideStockClickAction: () => void;
  showHideStockButton: string;
  stock?: React.ReactNode;
};

export default function Filtering({
  showHideCategoryButton,
  onShowHideCategoryClickAction,
  onShowHideStockClickAction,
  category,
  showHideStockButton,
  stock,
}: FilteringProps) {
  return (
    <>
      <div className="text-gray-900">
        <button className="text-sm text-blue-600 underline mb-2" onClick={onShowHideCategoryClickAction}>
          {showHideCategoryButton}
        </button>
        {category}
      </div>
      <div className="text-gray-900">
        <button className="text-sm text-blue-600 underline mb-2" onClick={onShowHideStockClickAction}>
          {showHideStockButton}
        </button>
        {stock}
      </div>
    </>
  );
}
