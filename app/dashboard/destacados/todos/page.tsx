import AllHighlights from "@/app/ui/AllHighlights";
import { listHighlightsWithSigned } from "@/app/lib/data/highlights";

const highlights = await listHighlightsWithSigned(); // incluye image_url firmado

export default function HighlightsPage() {
  return <AllHighlights highlights={highlights} />;
}
