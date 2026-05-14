import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const { id, companyName } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Preview ID is required' }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set exactly to A4
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseUrl}/preview?id=${id}`, { waitUntil: 'networkidle0' });

    const outputDir = path.join(process.cwd(), 'public', 'resumes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Determine output file name based on data if possible, default to Anik_Youssef.pdf
    const sanitizedCompany = (companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
    const outputPath = path.join(outputDir, `Anik_Youssef_${sanitizedCompany}.pdf`);

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();

    return NextResponse.json({ success: true, pdfUrl: `/resumes/Anik_Youssef_${sanitizedCompany}.pdf` });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
