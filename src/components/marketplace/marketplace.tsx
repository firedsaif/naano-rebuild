"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, Star, UserSearch } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/common/layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_COUNTRIES, ALL_INDUSTRIES } from "@/lib/data/creators";
import { cpm, fitScore } from "@/lib/domain/rules";
import type { CountryCode, Industry } from "@/lib/domain/types";
import { COUNTRY_NAMES, flag, plural } from "@/lib/format";
import { useCreators, useDemo, useDemoBrand } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";
import { CreatorCard } from "./creator-card";
import { CreatorProfileDialog } from "./creator-profile-dialog";

const SORTS = {
  fit: "Best match",
  cpm: "Lowest CPM",
  followers: "Most followers",
  price: "Lowest price",
} as const;
type Sort = keyof typeof SORTS;

export function Marketplace() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const openId = params.get("creator");

  const creators = useCreators();
  const brand = useDemoBrand();
  const shortlist = useDemo((s) => s.shortlist);
  const toggleShortlist = useDemo((s) => s.toggleShortlist);

  const [tab, setTab] = useState<"all" | "shortlist">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("fit");
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [maxPrice, setMaxPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [bookingFor, setBookingFor] = useState<string | null>(null);

  const scored = useMemo(() => creators.map((creator) => ({ creator, fit: fitScore(creator, brand) })), [creators, brand]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = Number(minPrice) || 0;
    const max = Number(maxPrice) || Infinity;
    const filtered = scored.filter(({ creator }) => {
      if (tab === "shortlist" && !shortlist.includes(creator.id)) return false;
      if (industries.length && !creator.industries.some((i) => industries.includes(i))) return false;
      if (countries.length && !countries.includes(creator.country)) return false;
      if (creator.pricePerPost < min || creator.pricePerPost > max) return false;
      if (q && ![creator.name, creator.headline, ...creator.industries].some((s) => s.toLowerCase().includes(q))) return false;
      return true;
    });
    const compare = {
      fit: (a: (typeof filtered)[0], b: (typeof filtered)[0]) => b.fit - a.fit || cpm(a.creator) - cpm(b.creator),
      cpm: (a: (typeof filtered)[0], b: (typeof filtered)[0]) => cpm(a.creator) - cpm(b.creator),
      followers: (a: (typeof filtered)[0], b: (typeof filtered)[0]) => b.creator.followers - a.creator.followers,
      price: (a: (typeof filtered)[0], b: (typeof filtered)[0]) => a.creator.pricePerPost - b.creator.pricePerPost,
    }[sort];
    return [...filtered].sort(compare);
  }, [scored, tab, shortlist, industries, countries, minPrice, maxPrice, query, sort]);

  const filtersOn = industries.length + countries.length > 0 || Boolean(minPrice || maxPrice);
  const clearFilters = () => {
    setIndustries([]);
    setCountries([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const openCreator = (id: string | null, booking = false) => {
    setBookingFor(booking ? id : null);
    const next = new URLSearchParams(params.toString());
    if (id) next.set("creator", id);
    else next.delete("creator");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const open = creators.find((c) => c.id === openId) ?? null;

  return (
    <>
      <PageHeader
        title="Creators"
        description={`Ranked by how well their audience matches ${brand.name}'s buyers, then by performance.`}
      />

      <div className="mb-4 flex gap-1" role="tablist" aria-label="Creator lists">
        {([["all", "All creators", creators.length], ["shortlist", "Shortlist", shortlist.length]] as const).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              tab === key ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {key === "shortlist" && <Star className={cn("size-3.5", shortlist.length > 0 && "fill-[#f5b301] text-[#f5b301]")} aria-hidden />}
            {label}
            <span className="text-xs tabular-nums opacity-70">{count}</span>
          </button>
        ))}
      </div>

      <Panel className="mb-5 flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a creator…" className="h-10 pl-9" aria-label="Search creators" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MultiSelect
            label="Industry"
            options={ALL_INDUSTRIES.map((i) => ({ value: i, label: i }))}
            selected={industries}
            onChange={(v) => setIndustries(v as Industry[])}
          />
          <MultiSelect
            label="Country"
            options={ALL_COUNTRIES.map((c) => ({ value: c, label: `${flag(c)} ${COUNTRY_NAMES[c]}` }))}
            selected={countries}
            onChange={(v) => setCountries(v as CountryCode[])}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" className={cn(minPrice || maxPrice ? "border-brand text-brand" : undefined)}>
                <SlidersHorizontal /> Price <ChevronDown />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-3">
              <p className="text-sm font-semibold">Price per post</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="min-price" className="text-xs">
                    Minimum
                  </Label>
                  <Input id="min-price" type="number" min={0} step={50} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="€0" className="h-9" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="max-price" className="text-xs">
                    Maximum
                  </Label>
                  <Input id="max-price" type="number" min={0} step={50} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className="h-9" />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-10 w-44" aria-label="Sort creators">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORTS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filtersOn && (
            <Button variant="ghost" size="lg" onClick={clearFilters}>
              Clear
            </Button>
          )}
          <span className="ml-auto text-sm whitespace-nowrap text-muted-foreground tabular-nums lg:ml-0">{plural(results.length, "creator")}</span>
        </div>
      </Panel>

      {results.length === 0 ? (
        <Panel>
          <EmptyState
            icon={UserSearch}
            title={tab === "shortlist" ? "No creators saved yet" : "No creators match those filters"}
            description={tab === "shortlist" ? "Tap the star on a creator to save them here." : "Try widening the price range or clearing a filter."}
            action={
              tab === "shortlist" ? (
                <Button onClick={() => setTab("all")}>Browse all creators</Button>
              ) : (
                filtersOn && <Button onClick={clearFilters}>Clear filters</Button>
              )
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map(({ creator, fit }) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              fit={fit}
              shortlisted={shortlist.includes(creator.id)}
              onOpen={() => openCreator(creator.id)}
              onBook={() => openCreator(creator.id, true)}
              onToggleShortlist={() => toggleShortlist(creator.id)}
            />
          ))}
        </div>
      )}

      <CreatorProfileDialog creator={open} brand={brand} startBooking={bookingFor === openId} onClose={() => openCreator(null)} />
    </>
  );
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="lg" className={cn(selected.length > 0 && "border-brand text-brand")}>
          {label}
          {selected.length > 0 && <span className="tabular-nums">({selected.length})</span>}
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-72 w-56 overflow-y-auto p-2">
        <fieldset className="space-y-0.5">
          <legend className="sr-only">{label}</legend>
          {options.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#f3f5f9]">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onChange(checked ? selected.filter((v) => v !== option.value) : [...selected, option.value])}
                />
                {option.label}
              </label>
            );
          })}
        </fieldset>
      </PopoverContent>
    </Popover>
  );
}
