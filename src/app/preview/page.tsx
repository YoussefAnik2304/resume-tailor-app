import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function PreviewPage(props: { searchParams: Promise<{ id?: string }> }) {
  const searchParams = await props.searchParams;
  const { id } = searchParams;
  if (!id) return <div className="p-10 text-red-500">Preview ID missing</div>;

  const tmpPath = path.join(process.cwd(), 'tmp', `${id}.json`);
  if (!fs.existsSync(tmpPath)) {
    return <div className="p-10 text-red-500">Tailored data not found</div>;
  }

  const data = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));

  const isFr = data.language === 'French';

  // Programmatically deduplicate skills to guarantee no duplicates
  const skillArray = data.skills?.split('•').map((s: string) => s.trim()) || [];
  const uniqueSkillsMap = new Map();
  skillArray.forEach((s: string) => {
    if (s && !uniqueSkillsMap.has(s.toLowerCase())) {
      uniqueSkillsMap.set(s.toLowerCase(), s);
    }
  });
  const finalSkills = Array.from(uniqueSkillsMap.values()).join(' • ');

  // Helper to parse **bold** markdown
  const renderBold = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-bold text-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="bg-white text-neutral-950 font-sans w-[794px] min-h-[1123px] mx-auto p-4 relative box-border text-[11px] leading-tight">
      {/* Header */}
      <header className="mb-2 text-center border-b-2 border-neutral-800 pb-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-black">Anik Youssef</h1>
        <h2 className="text-[14px] font-bold text-neutral-800 mt-0.5 uppercase tracking-wider">
          {data.targetJobTitle || (isFr ? 'Ingénieur Logiciel' : 'Software Engineer')}
        </h2>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1 text-[11px] font-semibold text-neutral-700">
          <a href="mailto:youssefanik@gmail.com" className="hover:text-black">youssefanik@gmail.com</a>
          <span>|</span>
          <span>+212644587579</span>
          <span>|</span>
          <span>Casablanca, Morocco</span>
          <span>|</span>
          <a href="https://anik-youssef.vercel.app/" className="hover:text-black">Portfolio</a>
          <span>|</span>
          <a href="https://www.linkedin.com/in/youssef-anik-937b92273/" className="hover:text-black">LinkedIn</a>
          <span>|</span>
          <a href="https://github.com/YoussefAnik2304/" className="hover:text-black">GitHub</a>
        </div>
      </header>

      {/* Profile */}
      <section className="mb-2.5">
        <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-black mb-1 border-b border-neutral-300 pb-0.5">
          {isFr ? 'Profil' : 'Profile'}
        </h3>
        <p className="text-neutral-900 text-left">
          {renderBold(data.profile)}
        </p>
      </section>

      {/* Experience */}
      <section className="mb-2.5">
        <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-black mb-1 border-b border-neutral-300 pb-0.5">
          Professional Experience
        </h3>
        
        {data.experiences?.map((exp: any, index: number) => (
          <div key={index} className="mb-1.5 last:mb-0">
            <div className="flex justify-between items-baseline">
              <h4 className="font-bold text-black text-[12.5px]">{exp.title}, {exp.company}</h4>
              <span className="text-[11px] font-bold text-neutral-600">{exp.date} | {exp.location}</span>
            </div>
            <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-neutral-900 marker:text-neutral-500">
              {exp.bullets?.map((bullet: string, i: number) => (
                <li key={i} className="pl-1">{renderBold(bullet)}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="mb-2.5">
        <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-black mb-1 border-b border-neutral-300 pb-0.5">
          {isFr ? 'Projets' : 'Projects'}
        </h3>
        
        {data.projects?.map((proj: any, index: number) => (
          <div key={index} className="mb-1.5 last:mb-0">
            <div className="flex justify-between items-baseline">
              <h4 className="font-bold text-black text-[12.5px]">{proj.title}</h4>
              <span className="text-[11px] font-bold text-neutral-600">{proj.date}</span>
            </div>
            <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-neutral-900 marker:text-neutral-500">
              {proj.bullets?.map((bullet: string, i: number) => (
                <li key={i} className="pl-1">{renderBold(bullet)}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-2.5">
        <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-black mb-1 border-b border-neutral-300 pb-0.5">
          {isFr ? 'Compétences Techniques' : 'Technical Skills'}
        </h3>
        <p className="text-neutral-900 font-semibold leading-relaxed">
          {finalSkills}
        </p>
      </section>

      {/* Education */}
      <section>
        <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-black mb-1 border-b border-neutral-300 pb-0.5">
          Education
        </h3>
        <div className="flex justify-between items-baseline">
          <h4 className="font-bold text-black text-[12.5px]">
            {isFr ? 'Diplôme d’Ingénieur d’État en Génie Logiciel (Équivalent Master)' : 'Software Engineering Degree (Master\'s Equivalent)'} 
            <span className="font-normal text-neutral-700"> | National School of Applied Sciences (ENSA-H)</span>
          </h4>
          <span className="text-[11px] font-bold text-neutral-600">09/2020 – 07/2025 | Al Hoceima, Maroc</span>
        </div>
      </section>
    </div>
  );
}
