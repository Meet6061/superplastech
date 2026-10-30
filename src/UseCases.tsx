import UseStack from "./UseStack";
import type { StackItem } from "./UseStack";

/** Content for both use-case stacks. Photos live in public/img/uses/. */

const TUB_ITEMS: StackItem[] = [
  { title: "Farming", text: "Pick, carry and rinse the harvest. A wide, tough tub that goes from the field to the market.", photo: "farming.webp" },
  { title: "Household", text: "Dishes, utensils, toys and clothes. One tub that keeps up with the whole family.", photo: "household.webp" },
  { title: "Laundry", text: "Soak, wash and carry. A wide opening and smooth, glossy walls that wipe clean.", photo: "laundry.webp" },
  { title: "Cleaning", text: "Mop water, scrubbing and rinsing. Sits steady on the floor and takes the knocks.", photo: "cleaning.webp" },
  { title: "Fruit and veg washing", text: "The small tub is just right for rinsing fruit and vegetables before they reach the kitchen.", photo: "fruit-washing.webp" },
  { title: "Baby bath", text: "A smooth, rounded tub for bath time, easy to wipe down after every use.", photo: "baby-bath.webp" },
];

const PA6_ITEMS: StackItem[] = [
  { title: "Gears and gearboxes", text: "Gears for gearboxes, motors and drive systems, including automotive and appliance mechanisms. Nylon runs quietly and resists wear.", photo: "gears.webp" },
  { title: "Castors and wheels", text: "Castor wheels, rollers and bushings for trolleys and equipment that carry heavy loads day after day.", photo: "castors.webp" },
  { title: "Electrical and electronics", text: "Coil formers, bobbins and terminal parts, where good insulation has to come with real strength.", photo: "electrical.webp" },
  { title: "Textile machinery", text: "Spools, rollers and bushings for spinning and winding lines. Light, smooth and built to resist wear.", photo: "textile.webp" },
];

export function TubUses() {
  return (
    <UseStack
      id="tub-uses"
      tone="light"
      eyebrow="Tub uses"
      title="One tub, many jobs."
      lead="Tough enough for the field, smooth enough for the baby's bath."
      items={TUB_ITEMS}
    />
  );
}

export function Pa6Uses() {
  return (
    <UseStack
      id="pa6-uses"
      tone="dark"
      eyebrow="PA6 uses"
      title="Where recycled PA6 goes to work."
      lead="PA6 (Nylon 6) is strong, tough and wear-resistant, so moulders turn it into parts that carry load and last."
      items={PA6_ITEMS}
      note="Grades and colours vary by batch. Tell us about your part and we will suggest the right one."
    />
  );
}
