// 리뷰 등록부. 새 리뷰 파일을 만들면 여기에 import 하고 배열에 추가한다.
// 순서는 상관없다 (화면에서는 updatedAt 최신순으로 정렬된다).
import type { Review } from "../types";
import { review as cometToiletPaper3ply30m } from "./comet-toilet-paper-3ply-30m";
import { review as downyFabricSoftenerWhiteTeaLily1l } from "./downy-fabric-softener-white-tea-lily-1l";
import { review as hanilmedicalCarbonElectricBlanketHlD205 } from "./hanilmedical-carbon-electric-blanket-hl-d205";
import { review as homematLiquidS45dayRefill } from "./homemat-liquid-s-45day-refill";
import { review as homeplanetHandySteamIronMw801 } from "./homeplanet-handy-steam-iron-mw801";
import { review as homeplanetHumidifier4l } from "./homeplanet-humidifier-4l";
import { review as kuruaPocketSpringMattressSs20cm } from "./kurua-pocket-spring-mattress-ss-20cm";
import { review as miseensceneFoamHairColor2n } from "./miseenscene-foam-hair-color-2n";
import { review as pantoneBuiltInCablePowerBankPgb20 } from "./pantone-built-in-cable-power-bank-pgb-20";
import { review as persilLavenderGelMaxDrumRefill } from "./persil-lavender-gel-max-drum-refill";
import { review as sinjimoruOPd65wGan3portCharger } from "./sinjimoru-o-pd-65w-gan-3port-charger";

export const reviews: Review[] = [
  homeplanetHumidifier4l,
  cometToiletPaper3ply30m,
  downyFabricSoftenerWhiteTeaLily1l,
  persilLavenderGelMaxDrumRefill,
  homematLiquidS45dayRefill,
  miseensceneFoamHairColor2n,
  homeplanetHandySteamIronMw801,
  hanilmedicalCarbonElectricBlanketHlD205,
  pantoneBuiltInCablePowerBankPgb20,
  kuruaPocketSpringMattressSs20cm,
  sinjimoruOPd65wGan3portCharger,
];
