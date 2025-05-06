type FilteringProps = {
  category?: React.ReactNode;
  showHideCategoryButton: string;
  onShowHideCategoryClickAction: () => void;
  stock?: React.ReactNode;
  showHideStockButton: string;
  onShowHideStockClickAction: () => void;
  price?: React.ReactNode;
  showHidePriceButton: string;
  onShowHidePriceClickAction: () => void;
  alphabetical?: React.ReactNode;
  showHideAlphabeticalButton: string;
  onShowHideAlphabeticalClickAction: () => void;
  onResetFiltersClickAction: () => void;
};

export default function Filtering({
  category,
  showHideCategoryButton,
  onShowHideCategoryClickAction,
  stock,
  showHideStockButton,
  onShowHideStockClickAction,
  price,
  showHidePriceButton,
  onShowHidePriceClickAction,
  alphabetical,
  showHideAlphabeticalButton,
  onShowHideAlphabeticalClickAction,
  onResetFiltersClickAction,
}: FilteringProps) {
  return (
    <>
      <button className="text-gray-900 mt-2 mb-2 border-2 p-2" onClick={onResetFiltersClickAction}>
        Restear filtros
      </button>
      <div className="text-gray-900 mb-2">
        <button className="text-sm text-blue-600 underline mb-2" onClick={onShowHideCategoryClickAction}>
          {showHideCategoryButton}
        </button>
        {category}
      </div>
      <div className="text-gray-900 mt-2 mb-2">
        <button className="text-sm text-blue-600 underline mb-2" onClick={onShowHideStockClickAction}>
          {showHideStockButton}
        </button>
        {stock}
      </div>
      <div className="text-gray-900 mt-2 mb-2">
        <button className="text-sm text-blue-600 underline mb-2" onClick={onShowHidePriceClickAction}>
          {showHidePriceButton}
        </button>
        {price}
      </div>
      <div className="text-gray-900 mt-2 mb-2">
        <button className="text-sm text-blue-600 underline mb-2" onClick={onShowHideAlphabeticalClickAction}>
          {showHideAlphabeticalButton}
        </button>
        {alphabetical}
      </div>
    </>
  );
}
