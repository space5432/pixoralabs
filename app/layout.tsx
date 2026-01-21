import "./globals.css";

export const metadata = {
  title: "PixoraLabs",
  description: "UGC marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
