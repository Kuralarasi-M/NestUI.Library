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
  const techPills = [
    { icon: <SiReact className="text-[#61DAFB]" />, name: 'React', orbit: 'animate-[float_4s_ease-in-out_infinite]', pos: '-top-3 left-6' },
    { icon: <SiDotnet className="text-[#512BD4]" />, name: '.NET', orbit: 'animate-[float_5s_ease-in-out_infinite_1s]', pos: '-top-5 right-10' },
    { icon: <SiTailwindcss className="text-[#06B6D4]" />, name: 'Tailwind', orbit: 'animate-[float_4.5s_ease-in-out_infinite_0.5s]', pos: 'top-8 -left-6' },
    { icon: <SiJavascript className="text-[#F7DF1E]" />, name: 'JS', orbit: 'animate-[float_3.8s_ease-in-out_infinite_1.5s]', pos: 'top-10 -right-6' },
    { icon: <SiDocker className="text-[#2496ED]" />, name: 'Docker', orbit: 'animate-[float_4.2s_ease-in-out_infinite_2s]', pos: 'bottom-10 -left-8' },
    { icon: <SiFirebase className="text-[#FFCA28]" />, name: 'Firebase', orbit: 'animate-[float_5.2s_ease-in-out_infinite_0.8s]', pos: 'bottom-8 -right-8' },
    { icon: <SiVite className="text-[#646CFF]" />, name: 'Vite', orbit: 'animate-[float_4.8s_ease-in-out_infinite_1.2s]', pos: '-bottom-4 left-4' },
    { icon: <SiPostgresql className="text-[#4169E1]" />, name: 'SQL', orbit: 'animate-[float_4.1s_ease-in-out_infinite_2.2s]', pos: '-bottom-4 right-8' },
    { icon: <SiGit className="text-[#F05032]" />, name: 'Git', orbit: 'animate-[float_3.5s_ease-in-out_infinite_1.8s]', pos: 'top-20 left-2' },
    { icon: <SiGithub className="text-zinc-800 dark:text-zinc-200" />, name: 'GitHub', orbit: 'animate-[float_4.6s_ease-in-out_infinite_0.3s]', pos: 'top-24 right-2' },
    { icon: <SiCss className="text-[#1572B6]" />, name: 'CSS', orbit: 'animate-[float_5s_ease-in-out_infinite_2.5s]', pos: 'top-0 right-1/2 translate-x-1/2' },
  ];

  return (
    <div className="relative flex items-center justify-center w-80 h-72 select-none shrink-0 scale-90 sm:scale-100">
      {/* Background Radial Glow */}
      <div className="absolute w-56 h-56 rounded-full bg-blue-500/15 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Orbit Track Rings */}
      <div className="absolute w-64 h-64 border border-slate-200/60 dark:border-slate-700/40 rounded-full animate-[spin_60s_linear_infinite]" />
      <div className="absolute w-48 h-48 border border-dashed border-slate-300/60 dark:border-slate-800/60 rounded-full animate-[spin_40s_linear_infinite_reverse]" />

      {/* Center Lottie Developer Animation */}
      <div className="relative z-10 w-48 h-48 flex items-center justify-center drop-shadow-xl">
        <Lottie 
          src={developerAnimation} 
          loop={true} 
          autoplay={true}
          className="w-full h-full object-contain pointer-events-none" 
        />
      </div>

      {/* Orbiting Badges */}
      {techPills.map((pill, idx) => (
        <div
          key={idx}
          className={`absolute ${pill.pos} ${pill.orbit} z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
            bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 
            border border-slate-200 dark:border-slate-700/80 
            shadow-sm dark:shadow-black/60 backdrop-blur-md transition-colors duration-300`}
        >
          <span className="text-sm">{pill.icon}</span>
          <span className="text-[11px] font-medium">{pill.name}</span>
        </div>
      ))}
    </div>
  );
}
