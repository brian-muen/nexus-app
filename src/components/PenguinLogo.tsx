import logoSvgRaw from '@/assets/trace (1).svg?raw';

interface PenguinLogoProps {
  className?: string;
}

export default function PenguinLogo({ className = '' }: PenguinLogoProps) {
  // Extract the inner content (all paths) from the SVG
  const innerContent = logoSvgRaw
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .trim();
  
  // Match all path elements (self-closing format)
  const pathRegex = /<path[^>]*\/>/g;
  const allPaths = innerContent.match(pathRegex) || [];
  
  // The first path is the white rectangle background (starts with coordinates that draw the full canvas)
  // Remove it and keep only the penguin paths (yellow #fff759 and black #181818)
  const penguinPaths = allPaths.slice(1);
  
  // Combine penguin paths into SVG content
  const svgContent = penguinPaths.join('');
  
  // Calculate a viewBox that focuses on the penguin
  // Based on the path coordinates, the penguin is roughly centered
  // Original viewBox: 0 0 2360 1640
  // Penguin appears to be in the center area, roughly from x: 900-1500, y: 400-1100
  // Using a viewBox that crops to show just the penguin with some padding
  const penguinViewBox = '900 400 560 700';
  
  return (
    <svg
      className={className}
      viewBox={penguinViewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0
      }}
      preserveAspectRatio="xMidYMid meet"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

