import type { Icon, IconWeight } from "@phosphor-icons/react";
import {
  ArmchairIcon,
  BabyIcon,
  BarbellIcon,
  BathtubIcon,
  BedIcon,
  BookOpenIcon,
  BowlFoodIcon,
  BroomIcon,
  CarIcon,
  CoffeeIcon,
  CookingPotIcon,
  DropHalfIcon,
  HeadphonesIcon,
  HouseLineIcon,
  LaptopIcon,
  PackageIcon,
  PawPrintIcon,
  PillIcon,
  PottedPlantIcon,
  SparkleIcon,
  TentIcon,
  TShirtIcon,
  WashingMachineIcon,
  WindIcon,
} from "@phosphor-icons/react/ssr";
import type { CategoryIconKey } from "@/content/types";

const ICONS: Record<CategoryIconKey, Icon> = {
  appliance: WashingMachineIcon,
  humidifier: DropHalfIcon,
  air: WindIcon,
  cleaning: BroomIcon,
  kitchen: CookingPotIcon,
  coffee: CoffeeIcon,
  living: HouseLineIcon,
  bath: BathtubIcon,
  furniture: ArmchairIcon,
  sleep: BedIcon,
  digital: LaptopIcon,
  audio: HeadphonesIcon,
  beauty: SparkleIcon,
  fashion: TShirtIcon,
  baby: BabyIcon,
  pet: PawPrintIcon,
  health: PillIcon,
  food: BowlFoodIcon,
  sports: BarbellIcon,
  outdoor: TentIcon,
  car: CarIcon,
  book: BookOpenIcon,
  plant: PottedPlantIcon,
  package: PackageIcon,
};

/** 카테고리 아이콘 (content/types.ts 의 CategoryIconKey). 글자와 함께 쓰는 장식이라 스크린 리더에는 숨긴다 */
export function CategoryIcon({
  icon,
  weight = "duotone",
  className,
}: {
  icon: CategoryIconKey;
  weight?: IconWeight;
  className?: string;
}) {
  const Glyph = ICONS[icon] ?? PackageIcon;
  return <Glyph weight={weight} className={className} aria-hidden="true" />;
}
