import Image from "next/image";

interface AppIconProps {
  size?: number;
  className?: string;
}

export default function AppIcon({ size = 32, className = "" }: AppIconProps) {
  return (
    <Image
      src="/growfarm-128x128.png"
      alt="GrowFarm Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}

export function AppIconSmall({ className = "" }: { className?: string }) {
  return <AppIcon size={24} className={className} />;
}

export function AppIconLarge({ className = "" }: { className?: string }) {
  return <AppIcon size={48} className={className} />;
}
