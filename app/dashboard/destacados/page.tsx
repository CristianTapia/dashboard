import AllHighlights from "@/app/ui/HighlightsClient";
import { listHighlightsWithSigned } from "@/app/lib/data/highlights";

export const revalidate = 60;

export default async function HighlightsPage() {
  const highlights = await listHighlightsWithSigned({ limit: 50, expires: 3600 }); // incluye image_url firmado
  return <AllHighlights highlights={highlights} />;
}
