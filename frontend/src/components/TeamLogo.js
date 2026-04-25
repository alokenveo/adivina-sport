/**
 * TeamLogo — Muestra el logo de un equipo/club respetando su forma original.
 * Para PNG no se fuerza recorte circular. Se usa object-contain con fondo transparente.
 * El fallback muestra las iniciales en un contenedor cuadrado redondeado.
 */

const TeamLogo = ({ team, size = "md", className = "" }) => {
  const sizeMap = {
    xs:  { container: "w-6 h-6",   text: "text-[8px]",  radius: "rounded" },
    sm:  { container: "w-8 h-8",   text: "text-[10px]", radius: "rounded-md" },
    md:  { container: "w-10 h-10", text: "text-xs",     radius: "rounded-lg" },
    lg:  { container: "w-14 h-14", text: "text-sm",     radius: "rounded-xl" },
    xl:  { container: "w-20 h-20", text: "text-base",   radius: "rounded-xl" },
  };

  const s = sizeMap[size] || sizeMap.md;
  const initials = (team?.short_name || team?.name || "?").substring(0, 2).toUpperCase();

  if (team?.logo_url || team?.crest_url) {
    const src = team.logo_url || team.crest_url;
    return (
      <div
        className={`${s.container} flex items-center justify-center flex-shrink-0 ${className}`}
      >
        <img
          src={src}
          alt={team?.name || ""}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${s.container} ${s.radius} bg-white/5 border border-white/10 flex items-center justify-center font-bold text-zinc-400 flex-shrink-0 ${className}`}
    >
      <span className={s.text}>{initials}</span>
    </div>
  );
};

export default TeamLogo;
