// 리뷰 등록부. 새 리뷰 파일을 만들면 여기에 import 하고 배열에 추가한다.
// 순서는 상관없다 (화면에서는 updatedAt 최신순으로 정렬된다).
import type { Review } from "../types";
import { review as homeplanetHumidifier4l } from "./homeplanet-humidifier-4l";

export const reviews: Review[] = [homeplanetHumidifier4l];
