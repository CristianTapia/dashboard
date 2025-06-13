type FilteringProps = {
  filterA?: React.ReactNode;
  showHideFilterAButton?: string;
  onShowHideFilterAClickAction?: () => void;
  filterB?: React.ReactNode;
  showHideFilterBButton?: string;
  onShowHideFilterBClickAction?: () => void;
  filterC?: React.ReactNode;
  showHideFilterCButton?: string;
  onShowHideFilterCClickAction?: () => void;
  filterD?: React.ReactNode;
  showHideFilterDButton?: string;
  onShowHideFilterDClickAction?: () => void;
  onResetFiltersClickAction?: () => void;
};

export default function Filtering({
  filterA,
  showHideFilterAButton,
  onShowHideFilterAClickAction,
  filterB,
  showHideFilterBButton,
  onShowHideFilterBClickAction,
  filterC,
  showHideFilterCButton,
  onShowHideFilterCClickAction,
  filterD,
  showHideFilterDButton,
  onShowHideFilterDClickAction,
  onResetFiltersClickAction,
}: FilteringProps) {
  return (
    <>
      <button className="text-gray-900 mt-2 mb-2 border-2 p-2 cursor-pointer" onClick={onResetFiltersClickAction}>
        Restear filtros
      </button>
      <div className="text-gray-900 mb-2">
        <button className="text-sm text-blue-600 underline mb-2 cursor-pointer" onClick={onShowHideFilterAClickAction}>
          {showHideFilterAButton}
        </button>
        {filterA}
      </div>
      <div className="text-gray-900 mt-2 mb-2">
        <button className="text-sm text-blue-600 underline mb-2 cursor-pointer" onClick={onShowHideFilterBClickAction}>
          {showHideFilterBButton}
        </button>
        {filterB}
      </div>
      <div className="text-gray-900 mt-2 mb-2">
        <button className="text-sm text-blue-600 underline mb-2 cursor-pointer" onClick={onShowHideFilterCClickAction}>
          {showHideFilterCButton}
        </button>
        {filterC}
      </div>
      <div className="text-gray-900 mt-2 mb-2">
        <button className="text-sm text-blue-600 underline mb-2" onClick={onShowHideFilterDClickAction}>
          {showHideFilterDButton}
        </button>
        {filterD}
      </div>
    </>
  );
}
