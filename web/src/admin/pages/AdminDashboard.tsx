import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Eye, ShoppingBag, MessageCircle } from "lucide-react";
import { api } from "../../lib/api";

interface DashboardData {
  totals: {
    totalPerfumes: number;
    published: number;
    hidden: number;
    stockTotal: number;
    lowStock: number;
    outOfStock: number;
    featured: number;
    brands: number;
    families: number;
  };
  mostViewed: { id: string; name: string; brand: string; views: number }[];
  mostAddedToCart: { id: string; name: string; brand: string; cartAdds: number }[];
  mostWhatsapp: { id: string; name: string; brand: string; whatsappClicks: number }[];
  byFamily: { family: string; count: number }[];
  byBrand: { brand: string; count: number }[];
}

const COLORS = ["#3D3229", "#A68B5B", "#6B635A", "#C4B089", "#5C4E3A", "#D4C4A8"];

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="bg-white border border-line rounded-lg px-5 py-4 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="text-[11px] uppercase tracking-wider text-ink-soft/60 font-semibold mb-1.5">{label}</div>
      <div className={`font-display text-[28px] ${accent || ""}`}>{value}</div>
    </div>
  );
}

function RankedList({
  title,
  icon: Icon,
  items,
  valueKey,
}: {
  title: string;
  icon: any;
  items: { id: string; name: string; brand: string; [k: string]: any }[];
  valueKey: string;
}) {
  return (
    <div className="bg-white border border-line rounded-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-wine" />
        <span className="text-[13px] font-semibold">{title}</span>
      </div>
      {items.length === 0 || items.every((i) => !i[valueKey]) ? (
        <p className="text-[12.5px] text-ink-soft/60">Todavía no hay datos suficientes.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-2 truncate">
                <span className="text-ink-soft/40 w-4">{i + 1}.</span>
                <span className="truncate">{item.name}</span>
              </span>
              <span className="font-semibold flex-shrink-0 ml-2">{item[valueKey]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DashboardData>("/stats/dashboard", true)
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="p-4 sm:p-6 lg:p-8 text-wine">{error}</div>;
  if (!data) return <div className="p-4 sm:p-6 lg:p-8 text-ink-soft">Cargando estadísticas…</div>;

  const { totals } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px]">
      <h1 className="font-display text-[28px] mb-1">Dashboard</h1>
      <p className="text-[13.5px] text-ink-soft mb-7">Estado general del catálogo en tiempo real.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total perfumes" value={totals.totalPerfumes} />
        <StatCard label="Publicados" value={totals.published} accent="text-bottle" />
        <StatCard label="Ocultos" value={totals.hidden} accent="text-ink-soft" />
        <StatCard label="Destacados" value={totals.featured} accent="text-gold" />
        <StatCard label="Stock total" value={totals.stockTotal} />
        <StatCard label="Poco stock" value={totals.lowStock} accent="text-[#7A4A16]" />
        <StatCard label="Sin stock" value={totals.outOfStock} accent="text-wine" />
        <StatCard label="Marcas / familias" value={`${totals.brands} / ${totals.families}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-line rounded-lg p-5 shadow-card">
          <span className="text-[13px] font-semibold block mb-4">Perfumes por familia olfativa</span>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.byFamily} dataKey="count" nameKey="family" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {data.byFamily.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
            {data.byFamily.map((f, i) => (
              <span key={f.family} className="text-[11.5px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {f.family} ({f.count})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-line rounded-lg p-5 shadow-card">
          <span className="text-[13px] font-semibold block mb-4">Perfumes por marca</span>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byBrand} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="brand" width={110} tick={{ fontSize: 11.5 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3D3229" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RankedList title="Más vistos" icon={Eye} items={data.mostViewed} valueKey="views" />
        <RankedList title="Más agregados al carrito" icon={ShoppingBag} items={data.mostAddedToCart} valueKey="cartAdds" />
        <RankedList title="Más pedidos por WhatsApp" icon={MessageCircle} items={data.mostWhatsapp} valueKey="whatsappClicks" />
      </div>
    </div>
  );
}
