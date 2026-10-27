import { Lottie } from 'lottie-react';
import developerAnimation from '../../assets/developer.json';
import { 
  SiReact, 
  SiDotnet, 
  SiTailwindcss, 
  SiPostgresql, 
  SiGit, 
  SiGithub, 
  SiDocker, 
  SiFirebase, 
  SiVite, 
  SiCss, 
  SiJavascript 
} from 'react-icons/si';

export default function TechBannerGraphic() {
  const leftPills = [
    { icon: <SiReact className="text-[#61DAFB]" />, name: 'React', orbit: 'animate-float-1', custom: 'self-start ml-2' },
    { icon: <SiTailwindcss className="text-[#06B6D4]" />, name: 'Tailwind', orbit: 'animate-float-2', custom: 'self-end -mr-1' },
    { icon: <SiDocker className="text-[#2496ED]" />, name: 'Docker', orbit: 'animate-float-3', custom: 'self-center ml-1' },
    { icon: <SiGit className="text-[#F05032]" />, name: 'Git', orbit: 'animate-float-4', custom: 'self-start ml-4' },
    { icon: <SiVite className="text-[#646CFF]" />, name: 'Vite', orbit: 'animate-float-5', custom: 'self-end mr-3' },
  ];

  const rightPills = [
    { icon: <SiDotnet className="text-[#512BD4]" />, name: '.NET', orbit: 'animate-float-2', custom: 'self-end mr-2' },
    { icon: <SiJavascript className="text-[#F7DF1E]" />, name: 'JS', orbit: 'animate-float-1', custom: 'self-start -ml-1' },
    { icon: <SiPostgresql className="text-[#4169E1]" />, name: 'SQL', orbit: 'animate-float-3', custom: 'self-center mr-1' },
    { icon: <SiGithub className="text-zinc-800 dark:text-zinc-200" />, name: 'GitHub', orbit: 'animate-float-5', custom: 'self-end mr-4' },
    { icon: <SiFirebase className="text-[#FFCA28]" />, name: 'Firebase', orbit: 'animate-float-4', custom: 'self-start ml-2' },
    { icon: <SiCss className="text-[#1572B6]" />, name: 'CSS', orbit: 'animate-float-2', custom: 'self-center' },
  ];

  return (
    <div className="relative flex items-center justify-center select-none shrink-0 py-1">
      {/* Background Soft Glow */}
      <div className="absolute w-72 h-24 rounded-full bg-blue-500/10 dark:bg-cyan-500/10 blur-2xl pointer-events-none" />

      {/* Left Uneven Pill Cluster */}
      <div className="hidden lg:flex flex-col gap-2 w-32 justify-center z-10">
        {leftPills.map((pill, idx) => (
          <div
            key={idx}
            className={`${pill.custom} ${pill.orbit} flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
              bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 
              border border-slate-200/90 dark:border-slate-800 
              shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer whitespace-nowrap`}
          >
            <span className="text-sm sm:text-base">{pill.icon}</span>
            <span className="text-[11px] font-medium tracking-tight">{pill.name}</span>
          </div>
        ))}
      </div>

      {/* Center Lottie - Laptop Prominently Enlarged */}
      <div className="relative z-10 w-44 sm:w-52 h-40 sm:h-44 flex items-center justify-center mx-2 drop-shadow-xl overflow-visible">
        <Lottie 
          src={developerAnimation} 
          loop={true} 
          autoplay={true}
          className="w-full h-full object-contain pointer-events-none scale-125 transition-transform duration-300" 
        />
      </div>

      {/* Right Uneven Pill Cluster */}
      <div className="flex flex-col gap-2 w-32 justify-center z-10">
        {rightPills.map((pill, idx) => (
          <div
            key={idx}
            className={`${pill.custom} ${pill.orbit} flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
              bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 
              border border-slate-200/90 dark:border-slate-800 
              shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer whitespace-nowrap`}
          >
            <span className="text-sm sm:text-base">{pill.icon}</span>
            <span className="text-[11px] font-medium tracking-tight">{pill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
