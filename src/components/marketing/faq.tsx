import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { TEXT_H2 } from "./tokens";

const FAQS = [
  {
    q: "What is Naano?",
    a: "Naano connects B2B brands with specialist creators on LinkedIn. Brands launch campaigns and pay a fixed price per post; creators post in their own voice and get paid after delivery.",
  },
  {
    q: "How does per-post pricing work?",
    a: "Each creator sets a fixed price per post. The brand pays that price once the post is delivered, so there's no bidding and no hourly billing.",
  },
  {
    q: "How does attribution work?",
    a: "Every booking gets its own tracking link, so clicks, and the leads they generate, are counted per creator.",
  },
  {
    q: "Where is my demo data stored?",
    a: "In this browser only, nothing is sent to a server. You can reset your demo data any time from the account menu.",
  },
  {
    q: "Is this the real Naano?",
    a: "No. This is a demo rebuild made for an 8x assignment, with fictional creators and brands. It is not affiliated with Naano.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 bg-surface-3 py-20 sm:py-28 lg:scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className={cn(TEXT_H2, "text-center")}>Frequently asked questions.</h2>

        <Accordion type="single" collapsible className="mt-12">
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="text-[17px]">{item.q}</AccordionTrigger>
              <AccordionContent className="text-[15px] text-ink-soft">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
