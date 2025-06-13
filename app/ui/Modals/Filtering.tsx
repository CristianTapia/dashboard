type FilteringProps = {
  filterA?: React.ReactNode;
  showHideFilterAButton?: string;
  onShowHideCategoryClickAction?: () => void;
  stock?: React.ReactNode;
  showHideStockButton?: string;
  onShowHideStockClickAction?: () => void;
  price?: React.ReactNode;
  showHidePriceButton?: string;
  onShowHidePriceClickAction?: () => void;
  alphabetical?: React.ReactNode;
  showHideAlphabeticalButton?: string;
  onShowHideAlphabeticalClickAction?: () => void;
  onResetFiltersClickAction?: () => void;
};

export default function Filtering({
  filterA,
  showHideFilterAButton,
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
      <button className="text-gray-900 mt-2 mb-2 border-2 p-2 cursor-pointer" onClick={onResetFiltersClickAction}>
        Restear filtros
      </button>
      <div className="text-gray-900 mb-2">
        <button className="text-sm text-blue-600 underline mb-2 cursor-pointer" onClick={onShowHideCategoryClickAction}>
          {showHideFilterAButton}
        </button>
        {filterA}
      </div>
      <div className="text-gray-900 mt-2 mb-2">
        <button className="text-sm text-blue-600 underline mb-2 cursor-pointer" onClick={onShowHideStockClickAction}>
          {showHideStockButton}
        </button>
        {stock}
      </div>
      <div className="text-gray-900 mt-2 mb-2">
        <button className="text-sm text-blue-600 underline mb-2 cursor-pointer" onClick={onShowHidePriceClickAction}>
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
