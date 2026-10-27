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
    { icon: <SiReact className="text-[#61DAFB]" />, name: 'React', orbit: 'animate-[float_4s_ease-in-out_infinite]', custom: 'self-start ml-2' },
    { icon: <SiTailwindcss className="text-[#06B6D4]" />, name: 'Tailwind', orbit: 'animate-[float_4.5s_ease-in-out_infinite_0.5s]', custom: 'self-end -mr-1' },
    { icon: <SiDocker className="text-[#2496ED]" />, name: 'Docker', orbit: 'animate-[float_4.2s_ease-in-out_infinite_1.2s]', custom: 'self-center ml-1' },
    { icon: <SiGit className="text-[#F05032]" />, name: 'Git', orbit: 'animate-[float_3.5s_ease-in-out_infinite_1.8s]', custom: 'self-start ml-4' },
    { icon: <SiVite className="text-[#646CFF]" />, name: 'Vite', orbit: 'animate-[float_4.8s_ease-in-out_infinite_0.8s]', custom: 'self-end mr-3' },
  ];

  const rightPills = [
    { icon: <SiDotnet className="text-[#512BD4]" />, name: '.NET', orbit: 'animate-[float_5s_ease-in-out_infinite_0.7s]', custom: 'self-end mr-2' },
    { icon: <SiJavascript className="text-[#F7DF1E]" />, name: 'JS', orbit: 'animate-[float_3.8s_ease-in-out_infinite_1.5s]', custom: 'self-start -ml-1' },
    { icon: <SiPostgresql className="text-[#4169E1]" />, name: 'SQL', orbit: 'animate-[float_4.1s_ease-in-out_infinite_2.2s]', custom: 'self-center mr-1' },
    { icon: <SiGithub className="text-zinc-800 dark:text-zinc-200" />, name: 'GitHub', orbit: 'animate-[float_4.6s_ease-in-out_infinite_0.3s]', custom: 'self-end mr-4' },
    { icon: <SiFirebase className="text-[#FFCA28]" />, name: 'Firebase', orbit: 'animate-[float_5.2s_ease-in-out_infinite_1s]', custom: 'self-start ml-2' },
    { icon: <SiCss className="text-[#1572B6]" />, name: 'CSS', orbit: 'animate-[float_5s_ease-in-out_infinite_2.5s]', custom: 'self-center' },
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

      {/* Center Compact Lottie (Reduced Height to ~105px) */}
      <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mx-1 drop-shadow-md">
        <Lottie 
          src={developerAnimation} 
          loop={true} 
          autoplay={true}
          className="w-full h-full object-contain pointer-events-none" 
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
