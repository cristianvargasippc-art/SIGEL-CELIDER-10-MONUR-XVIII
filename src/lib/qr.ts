import QRCode from "qrcode";

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getQrUrl(id: string) {
  return `${getAppUrl()}/scan/${id}`;
}

export async function generateQrDataUrl(id: string) {
  return QRCode.toDataURL(getQrUrl(id), {
    margin: 1,
    width: 480,
    color: {
      dark: "#0D2B5E",
      light: "#FFFFFF"
    }
  });
}
