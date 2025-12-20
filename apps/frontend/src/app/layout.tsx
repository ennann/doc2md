import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Doc2MD - Privacy-first Document to Markdown Converter',
  description: 'Convert your documents to Markdown format with complete privacy. All processing happens in your browser.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
