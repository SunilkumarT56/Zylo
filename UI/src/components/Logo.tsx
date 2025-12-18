export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      {/* 
         Final Design: Kafka-esque "BulDep" Logo.
         Three vertical strips.
         The first one is the "backbone" (solid).
         The second and third form the "stairs" or "building blocks".
         Sharp, rectangular, simple.
      */}
      
      {/* Left Strips (Backbone) */}
      <path d="M4 2h4v20H4z" />
      
      {/* Middle Strip - Top (Floating part of B) */}
      <path d="M10 2h4v9h-4z" />
      
      {/* Middle Strip - Bottom (Base of B) */}
      <path d="M10 13h4v9h-4z" />
      
      {/* Right Strip - Connecting the middle to make it look 'constructed' or just an accent */}
      <path d="M16 5h4v3h-4z" />
      <path d="M16 16h4v3h-4z" />
      
      {/* This creates a blocky, constructed 'B' shape using only vertical/horizontal blocks, no curves.
          Resembles the 'constructed' nature of Kafka's geometric logo.
      */}
    </svg>
  );
}
