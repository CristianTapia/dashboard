"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

export default function TableQrCode({
  value,
  label,
  number,
  name,
}: {
  value: string;
  label: string;
  number?: string | null;
  name?: string | null;
}) {
  const [printDataUrl, setPrintDataUrl] = useState("");
  const tableTitle = number?.trim() ? `Mesa ${number.trim()}` : label;
  const tableSubtitle = name?.trim() ?? "";

  useEffect(() => {
    let cancelled = false;

    async function buildQr() {
      const width = 1920;
      const qrSize = 1440;
      const hasSubtitle = Boolean(tableSubtitle);
      const headerHeight = hasSubtitle ? 396 : 312;
      const padding = 144;

      const qrCanvas = document.createElement("canvas");
      await QRCode.toCanvas(qrCanvas, value, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: qrSize,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = headerHeight + qrSize + padding;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo preparar el QR");
      const canvasContext = ctx;

      canvasContext.fillStyle = "#ffffff";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      canvasContext.textAlign = "center";
      canvasContext.textBaseline = "middle";

      function drawCenteredText(text: string, y: number, size: number, weight: number, color: string, minSize: number) {
        let fontSize = size;
        const maxWidth = width - 192;
        do {
          canvasContext.font = `${weight} ${fontSize}px Arial, Helvetica, sans-serif`;
          if (canvasContext.measureText(text).width <= maxWidth) break;
          fontSize -= 4;
        } while (fontSize > minSize);

        canvasContext.fillStyle = color;
        canvasContext.fillText(text, width / 2, y, maxWidth);
      }

      drawCenteredText(tableTitle, 138, 126, 700, "#0f172a", 82);

      if (hasSubtitle) {
        drawCenteredText(tableSubtitle, 264, 78, 500, "#334155", 48);
      }

      canvasContext.imageSmoothingEnabled = false;
      canvasContext.drawImage(qrCanvas, (width - qrSize) / 2, headerHeight, qrSize, qrSize);

      if (!cancelled) setPrintDataUrl(canvas.toDataURL("image/png"));
    }

    buildQr().catch(() => {
      if (!cancelled) setPrintDataUrl("");
    });

    return () => {
      cancelled = true;
    };
  }, [tableSubtitle, tableTitle, value]);

  return (
    <div className="rounded-lg border border-[var(--color-border-box)] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-txt-secondary)]">Código QR</p>
      <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="w-full max-w-56 rounded-lg border border-[var(--color-border-box)] bg-white p-2 shadow-sm sm:w-56">
          {printDataUrl ? (
            <Image
              src={printDataUrl}
              alt={`Código QR imprimible para ${label}`}
              width={1920}
              height={tableSubtitle ? 1980 : 1896}
              unoptimized
              className="h-auto w-full rounded-md"
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          {printDataUrl ? (
            <a
              href={printDataUrl}
              download={`${
                label
                  .replace(/[^a-z0-9]+/gi, "-")
                  .replace(/^-+|-+$/g, "")
                  .toLowerCase() || "mesa"
              }-qr.png`}
              className="inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg bg-[var(--color-bg-selected)] hover:opacity-90 cursor-pointer"
            >
              Descargar
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
