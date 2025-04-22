export default function Filtering({
  showHideButton,
  onShowHideButtonClickAction,
  categories,
}: {
  showHideButton: React.ReactNode;
  onShowHideButtonClickAction: () => void;
  categories: React.ReactNode;
}) {
  return (
    <div className="text-gray-900">
      <button className="text-sm text-blue-600 underline mb-2" onClick={onShowHideButtonClickAction}>
        {showHideButton}
      </button>
      {categories}
    </div>
  );
}
