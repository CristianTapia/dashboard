import AllHighlights from "@/app/ui/AllHighlights";
import { listHighlightsWithSigned } from "@/app/lib/data/highlights";

export default async function HighlightsPage() {
  const highlights = await listHighlightsWithSigned(); // incluye image_url firmado
  return <AllHighlights highlights={highlights} />;
}
