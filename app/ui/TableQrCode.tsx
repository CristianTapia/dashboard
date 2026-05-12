"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

export default function TableQrCode({ value, label }: { value: string; label: string }) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 6,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl("");
      });

    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div className="rounded-lg border border-[var(--color-border-box)] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-txt-secondary)]">Codigo QR</p>
      <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="w-36 h-36 rounded-lg border border-[var(--color-border-box)] bg-white flex items-center justify-center overflow-hidden">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt={`Codigo QR para ${label}`}
              width={144}
              height={144}
              unoptimized
              className="w-full h-full"
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[var(--color-txt-secondary)] max-w-xs">
            Este QR abre el link publico corto de la mesa.
          </p>
          {qrDataUrl ? (
            <a
              href={qrDataUrl}
              download={`${label.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "mesa"}-qr.png`}
              className="inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg bg-[var(--color-bg-selected)] hover:opacity-90 cursor-pointer"
            >
              Descargar QR
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
