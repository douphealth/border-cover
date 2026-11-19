import type { Pick } from "@/components/AmazonPicks";
import { countries } from "@/lib/atlas";

// Product categories that follow from driving your own car across a border. Never legal advice:
// each item tells the reader to check the destination's own equipment list.
const EUROPE = new Set(["eu", "eea", "europe", "other-europe", "uk"]);
const DRIVES_LEFT = new Set(["gb", "ie", "mt", "cy", "ni", "au", "nz", "jp", "za"]);

export function drivingPicks(market: string, dest: string): Pick[] {
  const name = countries[dest]?.name ?? "your destination";
  const rhdOnRight = (market === "uk" || market === "ie") && !DRIVES_LEFT.has(dest);
  if (EUROPE.has(countries[dest]?.region)) {
    return [
      { label: "Warning triangle", query: "car warning triangle reflective", why: `Many European countries require one in the car. Check the equipment list for ${name}.` },
      { label: "High-visibility vests", query: "high visibility vest car pack", why: "Several countries expect a vest for each occupant, kept within reach of the seats." },
      ...(rhdOnRight ? [{ label: "Headlamp beam deflectors", query: "headlamp beam deflectors europe driving", why: `Stops right-hand-drive headlights dazzling oncoming drivers in ${name}.` }] : []),
      { label: "Car first-aid kit", query: "car first aid kit", why: "Compulsory in some countries and useful everywhere." },
      { label: "Spare bulb kit", query: "car spare bulb kit", why: "Recommended in several countries; check your car's bulbs are user-replaceable." },
      { label: "Dash cam", query: "dash cam front", why: "Video can support an insurance claim abroad. Some countries restrict dash cams, so check local rules." },
    ];
  }
  return [
    { label: "Dash cam", query: "dash cam front", why: `Video can support an insurance claim in ${name}. Check local rules on recording.` },
    { label: "Roadside emergency kit", query: "roadside emergency kit car", why: "Jump leads, a torch and basic tools for a breakdown far from home." },
    { label: "Car first-aid kit", query: "car first aid kit", why: "Worth carrying on any long drive." },
    { label: "Phone mount", query: "car phone mount", why: "Hands-free navigation; holding a phone while driving is illegal in most places." },
  ];
}
