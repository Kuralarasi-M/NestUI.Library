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
    { icon: <SiReact className="text-[#61DAFB]" />, name: 'React', orbit: 'animate-[float_4s_ease-in-out_infinite]', pos: '-top-3 left-16' },
    { icon: <SiDotnet className="text-[#512BD4]" />, name: '.NET', orbit: 'animate-[float_5s_ease-in-out_infinite_1s]', pos: '-top-3 right-16' },
    { icon: <SiTailwindcss className="text-[#06B6D4]" />, name: 'Tailwind', orbit: 'animate-[float_4.5s_ease-in-out_infinite_0.5s]', pos: 'top-10 -left-6 sm:-left-10' },
    { icon: <SiJavascript className="text-[#F7DF1E]" />, name: 'JS', orbit: 'animate-[float_3.8s_ease-in-out_infinite_1.5s]', pos: 'top-10 -right-6 sm:-right-10' },
    { icon: <SiDocker className="text-[#2496ED]" />, name: 'Docker', orbit: 'animate-[float_4.2s_ease-in-out_infinite_2s]', pos: 'bottom-10 -left-6 sm:-left-10' },
    { icon: <SiFirebase className="text-[#FFCA28]" />, name: 'Firebase', orbit: 'animate-[float_5.2s_ease-in-out_infinite_0.8s]', pos: 'bottom-10 -right-6 sm:-right-10' },
    { icon: <SiVite className="text-[#646CFF]" />, name: 'Vite', orbit: 'animate-[float_4.8s_ease-in-out_infinite_1.2s]', pos: '-bottom-4 left-14' },
    { icon: <SiPostgresql className="text-[#4169E1]" />, name: 'SQL', orbit: 'animate-[float_4.1s_ease-in-out_infinite_2.2s]', pos: '-bottom-4 right-14' },
    { icon: <SiGit className="text-[#F05032]" />, name: 'Git', orbit: 'animate-[float_3.5s_ease-in-out_infinite_1.8s]', pos: 'top-[44%] -left-8 sm:-left-12' },
    { icon: <SiGithub className="text-zinc-800 dark:text-zinc-200" />, name: 'GitHub', orbit: 'animate-[float_4.6s_ease-in-out_infinite_0.3s]', pos: 'top-[44%] -right-8 sm:-right-12' },
    { icon: <SiCss className="text-[#1572B6]" />, name: 'CSS', orbit: 'animate-[float_5s_ease-in-out_infinite_2.5s]', pos: '-top-5 left-1/2 -translate-x-1/2' },
  ];

  return (
    <div className="relative flex items-center justify-center w-[26rem] sm:w-[29rem] h-72 select-none shrink-0 scale-90 sm:scale-100">
      {/* Background Radial Glow */}
      <div className="absolute w-80 h-56 rounded-[100%] bg-blue-500/15 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Oval / Elliptical Orbit Track Rings (Wider length) */}
      <div className="absolute w-[24rem] sm:w-[27rem] h-52 sm:h-56 border border-slate-200/70 dark:border-slate-700/50 rounded-[100%] pointer-events-none" />
      <div className="absolute w-[21rem] sm:w-[23.5rem] h-40 sm:h-44 border border-dashed border-indigo-300/40 dark:border-indigo-500/30 rounded-[100%] pointer-events-none" />

      {/* Center Lottie Developer Animation */}
      <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center drop-shadow-xl">
        <Lottie 
          src={developerAnimation} 
          loop={true} 
          autoplay={true}
          className="w-full h-full object-contain pointer-events-none" 
        />
      </div>

      {/* Orbiting Badges placed along the widened oval perimeter */}
      {techPills.map((pill, idx) => (
        <div
          key={idx}
          className={`absolute ${pill.pos} ${pill.orbit} z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
            bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 
            border border-slate-200/90 dark:border-slate-700 
            shadow-md dark:shadow-black/70 backdrop-blur-md transition-all duration-300 hover:scale-110 cursor-pointer`}
        >
          <span className="text-base sm:text-lg">{pill.icon}</span>
          <span className="text-xs font-medium tracking-tight">{pill.name}</span>
        </div>
      ))}
    </div>
  );
}
