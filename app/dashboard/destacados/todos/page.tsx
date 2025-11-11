import AllHighlights from "@/app/ui/AllHighlights";
import { listHighlights } from "@/app/lib/data/highlights";

const highlights = await listHighlights(); // server-only helper

export default function HighlightsPage() {
  return <AllHighlights highlights={highlights} />;
}
