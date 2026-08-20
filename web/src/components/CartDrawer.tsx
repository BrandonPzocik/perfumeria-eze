import { useState, type FormEvent } from "react";
import { Minus, MessageCircle, Plus, ShoppingBag, X, ArrowLeft, User, MapPin } from "lucide-react";
import Drawer from "./Drawer";
import Bottle from "./Bottle";
import { assetUrl } from "../lib/api";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import { useSettingsStore } from "../hooks/useSettingsStore";
import { formatCurrency, buildWhatsAppOrderMessage, buildWhatsAppLink } from "../lib/format";
import { useCartStore } from "../hooks/useCartStore";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const lines = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const checkoutStep = useCartStore((s) => s.checkoutStep);
  const setCheckoutStep = useCartStore((s) => s.setCheckoutStep);
  const customerName = useCartStore((s) => s.customerName);
  const customerAddress = useCartStore((s) => s.customerAddress);
  const setCustomerInfo = useCartStore((s) => s.setCustomerInfo);
  const items_ = usePerfumesStore((s) => s.items);
  const registerEvent = usePerfumesStore((s) => s.registerEvent);
  const settings = useSettingsStore((s) => s.settings);

  const [name, setName] = useState(customerName);
  const [address, setAddress] = useState(customerAddress);
  const [formError, setFormError] = useState("");

  const items = lines
    .map((l) => ({ ...l, product: items_.find((p) => p.id === l.id) }))
    .filter((x): x is { id: string; qty: number; product: (typeof items_)[number] } => Boolean(x.product));

  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  const handleCheckout = () => {
    items.forEach((i) => registerEvent(i.product.id, "whatsapp"));
  };

  const handleContinue = () => {
    setCheckoutStep("details");
    setName(customerName);
    setAddress(customerAddress);
  };

  const handleSubmitDetails = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    if (!trimmedName || !trimmedAddress) {
      setFormError("Completá tu nombre y dirección para continuar.");
      return;
    }
    setFormError("");
    setCustomerInfo(trimmedName, trimmedAddress);

    const message = buildWhatsAppOrderMessage(
      lines,
      items_,
      settings.currency,
      settings.whatsappMessage,
      trimmedName,
      trimmedAddress
    );
    const waHref = buildWhatsAppLink(message, settings.whatsappNumber);
    handleCheckout();
    window.open(waHref, "_blank", "noopener,noreferrer");
  };

  const drawerTitle = checkoutStep === "details"
    ? "Datos de envío"
    : `Tu selección (${items.length})`;

  return (
    <Drawer
      open={isOpen}
      onClose={close}
      title={drawerTitle}
      width="sm"
      footer={
        items.length > 0 ? (
          checkoutStep === "cart" ? (
            <div className="p-5 sm:p-6">
              <div className="flex justify-between text-[13px] text-ink-soft mb-1.5">
                <span>Subtotal</span>
                <span>{formatCurrency(total, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-[18px] font-bold mb-4">
                <span className="font-display uppercase tracking-wide">Total</span>
                <span>{formatCurrency(total, settings.currency)}</span>
              </div>
              <button onClick={handleContinue} className="btn-primary w-full py-4">
                Continuar con el pedido
              </button>
              <p className="text-[10.5px] text-ink-soft text-center mt-2.5 opacity-75">
                Te pediremos tu nombre y dirección antes de enviar el pedido por WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitDetails} className="p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setCheckoutStep("cart")}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-soft hover:text-ink mb-4 transition-colors"
              >
                <ArrowLeft size={14} /> Volver al carrito
              </button>

              <div className="flex flex-col gap-3.5 mb-4">
                <div>
                  <label htmlFor="cart-name" className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-soft mb-1.5">
                    <User size={13} /> Nombre completo
                  </label>
                  <input
                    id="cart-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="cart-address" className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-soft mb-1.5">
                    <MapPin size={13} /> Dirección de envío
                  </label>
                  <textarea
                    id="cart-address"
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, número, localidad, código postal…"
                    className="input-field resize-none"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-[12.5px] text-red-700 bg-red-50 rounded-lg px-3 py-2 mb-3">{formError}</p>
              )}

              <div className="flex justify-between text-[15px] font-bold mb-3">
                <span className="font-display uppercase tracking-wide">Total</span>
                <span>{formatCurrency(total, settings.currency)}</span>
              </div>

              <button type="submit" className="btn-primary w-full py-4">
                <MessageCircle size={16} /> Enviar pedido por WhatsApp
              </button>
              <p className="text-[10.5px] text-ink-soft text-center mt-2.5 opacity-75">
                Se abrirá WhatsApp con tu pedido y datos de envío.
              </p>
            </form>
          )
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 p-10 text-center min-h-[50vh]">
          <div className="w-16 h-16 rounded-full bg-line-soft flex items-center justify-center">
            <ShoppingBag size={28} strokeWidth={1.2} className="text-ink-soft" />
          </div>
          <p className="font-display text-[22px] uppercase tracking-wide">Tu carrito está vacío</p>
          <span className="text-[13px] text-ink-soft max-w-[260px]">
            Explorá el catálogo y agregá tus fragancias favoritas.
          </span>
        </div>
      ) : checkoutStep === "details" ? (
        <div className="px-5 sm:px-6 py-4">
          <p className="text-[13px] text-ink-soft mb-4">
            Revisá tu pedido antes de confirmar:
          </p>
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex justify-between py-2.5 border-b border-line-soft last:border-0 text-[13px]">
              <span className="font-medium">{product.name} × {qty}</span>
              <span className="font-semibold">{formatCurrency(product.price * qty, settings.currency)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 sm:px-6 py-2">
          {items.map(({ product, qty }) => {
            const img = assetUrl(product.images?.find((i) => i.isMain)?.url || product.images?.[0]?.url);
            return (
              <div key={product.id} className="flex gap-4 py-4 border-b border-line-soft last:border-0">
                <div className="w-[68px] h-[84px] image-placeholder rounded-card flex-shrink-0 overflow-hidden shadow-card">
                  {img ? (
                    <img src={img} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-1.5 w-full h-full"><Bottle family={product.family} /></div>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold text-sm truncate">{product.name}</span>
                    <button onClick={() => removeItem(product.id)} className="text-ink-soft flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-line-soft" aria-label="Quitar">
                      <X size={14} />
                    </button>
                  </div>
                  <span className="text-[11.5px] text-ink-soft">{product.type} · {product.size}</span>
                  <div className="flex justify-between items-center mt-1.5">
                    <div className="flex items-center border border-line rounded-full bg-stone">
                      <button onClick={() => setQty(product.id, qty - 1)} className="px-3 py-1.5 hover:bg-line-soft rounded-l-full transition-colors" aria-label="Restar">
                        <Minus size={12} />
                      </button>
                      <span className="text-[12.5px] w-5 text-center font-medium">{qty}</span>
                      <button onClick={() => setQty(product.id, qty + 1)} className="px-3 py-1.5 hover:bg-line-soft rounded-r-full transition-colors" aria-label="Sumar">
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-semibold text-[14px]">{formatCurrency(product.price * qty, settings.currency)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
}
