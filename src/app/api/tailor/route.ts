import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import sampleData from '@/data/masterData.sample.json';
import fs from 'fs';
import path from 'path';

function getMasterData() {
  if (process.env.RESUME_MASTER_DATA) {
    try {
      return JSON.parse(process.env.RESUME_MASTER_DATA);
    } catch (e) {
      console.error('Failed to parse RESUME_MASTER_DATA env var:', e);
    }
  }
  
  try {
    const localPath = path.join(process.cwd(), 'src', 'data', 'masterData.json');
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, 'utf8'));
    }
  } catch (e) {}

  return sampleData;
}

const resumeSchema = z.object({
  language: z.enum(['English', 'French']),
  targetJobTitle: z.string().describe("The EXACT job title from the JD (e.g., 'Concepteur Développeur Java/Angular Senior'). Critical for ATS."),
  companyName: z.string().describe("The name of the company the job is for. Use 'Unknown_Company' if not found."),
  profile: z.string().describe("3-sentence strategic profile connecting the JD to the user's background"),
  experiences: z.array(z.object({
    title: z.string(),
    company: z.string(),
    date: z.string(),
    location: z.string(),
    bullets: z.array(z.string()).describe("Select AS MANY relevant bullets as possible. Heavily tailor them to the JD. Use **bold** for key metrics/skills.")
  })).describe("The user's work experiences. Group the selected bullets accurately under the correct job titles from master data."),
  projects: z.array(z.object({
    title: z.string(),
    date: z.string(),
    bullets: z.array(z.string()).describe("The exact bullets from the master data. Wrap key words in **bold**.")
  })).describe("The user's projects."),
  skills: z.string().describe("A single string of ALL technical skills (core + JD specific) separated by ' • '. Deduplicate them. Example: 'Java • React • SQL'")
});

export async function POST(req: Request) {
  try {
    const masterData = getMasterData();
    const { jd, generatePdf = true } = await req.json();

    if (!jd) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    // Call Gemini
    const { object } = await generateObject({
      model: google('gemini-3-flash-preview'),
      schema: resumeSchema,
      prompt: `You are an expert resume tailor. Read this Job Description (JD) and tailor my resume data to fit it perfectly. Keep it concise so it fits on ONE page.
      
      My Master Data:
      ${JSON.stringify(masterData, null, 2)}
      
      Job Description:
      ${jd}
      
      Rules:
      1. Detect if the JD is English or French. Output the exact language match for ALL content (translate headers, titles, and dates to French if needed).
      2. Write a 3-sentence profile. The FIRST sentence MUST naturally use the exact job title from the JD (this is critical for ATS keyword matching). Then bridge my background to the JD's specific needs and weave in missing JD hard skills (like Kanban, BDD, Angular, Gitlab, Maven, etc.). Aggressively wrap key technologies and the job title in **bold**. NEVER mention anything about degree equivalence.
      3. For 'experiences', you MUST recreate my exact jobs using the exact dates, locations, titles, and companies from the Master Data. Select AS MANY relevant bullets as possible (up to 7 per job) and tailor them to the JD! You MUST aggressively wrap key technologies, metrics, and impactful verbs in **bold** (e.g., "Built **backend services** using **Java**, reducing latency by **20%**").
      4. For 'projects', you MUST recreate my exact projects using the exact dates and titles from the Master Data. Output ALL of their bullets exactly as they appear in the Master Data, but you may wrap key technologies in **bold**.
      5. For 'skills', merge my Core Technologies with any extra skills from the JD into a single bullet-separated string. DO NOT duplicate skills.
      6. ATS OPTIMIZATION: The resulting resume MUST pass at least a 95% ATS score. Use exact keywords and phrasing from the JD where appropriate in the profile, selected bullets, and skills section. The 'targetJobTitle' MUST exactly match the JD title.`
    });

    if (!generatePdf) {
      return NextResponse.json({ success: true, tailoredData: object });
    }

    const tempId = Date.now().toString();
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    fs.writeFileSync(path.join(tempDir, `${tempId}.json`), JSON.stringify(object));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const pdfResponse = await fetch(`${baseUrl}/api/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tempId, companyName: object.companyName })
    });

    if (!pdfResponse.ok) {
      throw new Error('Failed to generate PDF from tailored data');
    }

    const { pdfUrl } = await pdfResponse.json();

    return NextResponse.json({ success: true, pdfUrl, tailoredData: object });
  } catch (error: any) {
    console.error('Tailoring engine error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
