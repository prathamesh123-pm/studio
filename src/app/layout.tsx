import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cattle Feed Survey App',
  description: 'महाराष्ट्र राज्यातील पशुखाद्य सर्वेक्षणासाठी आधुनिक आणि सोपे व्यासपीठ.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen text-foreground">
        {children}
      </body>
    </html>
  );
}
