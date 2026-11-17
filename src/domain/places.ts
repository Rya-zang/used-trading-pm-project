import type { AreaId, CityId } from "./catalog.ts";
import type { NearbyId } from "./commute.ts";

export const photoPresets = [
  { id: "living", label: "客厅", src: "/home/photo-living.jpg" },
  { id: "master", label: "主卧", src: "/home/photo-master.jpg" },
  { id: "second", label: "次卧", src: "/home/photo-second.jpg" },
  { id: "kitchen", label: "厨房", src: "/home/photo-kitchen.jpg" },
  { id: "balcony", label: "阳台", src: "/home/photo-balcony.jpg" },
] as const;

export type PhotoId = (typeof photoPresets)[number]["id"];

export interface RoomSpot {
  name: string;
  areaSqm: number;
  rent: number;
  privateBath: boolean;
  light: string;
  balcony: boolean;
  furniture: string;
}

export interface PublishedRoom {
  id: string;
  ownerId: string;
  cityId: CityId;
  areaId: AreaId;
  community: string;
  address: string;
  wholeRent: number;
  layout: string;
  areaSqm: number;
  bedrooms: number;
  baths: number;
  ownRoom: RoomSpot;
  roommateRoom: RoomSpot;
  moveIn: string;
  requirements: string;
  photos: PhotoId[];
}

export interface FakeListing {
  id: string;
  cityId: CityId;
  areaId: AreaId;
  community: string;
  rent: number;
  layout: string;
  baths: number;
  areaSqm: number;
  metro: string;
  amenities: readonly string[];
  description: string;
  photoId: PhotoId;
  lat: number;
  lng: number;
  nearby: readonly NearbyId[];
}

export interface ListingFilter {
  areaId: string;
  rentMax: string;
  layout: string;
  baths: string;
  areaMin: string;
}

export const emptyListingFilter: ListingFilter = {
  areaId: "any",
  rentMax: "any",
  layout: "any",
  baths: "any",
  areaMin: "any",
};

function spot(
  name: string,
  areaSqm: number,
  rent: number,
  privateBath: boolean,
  light: string,
  balcony: boolean,
  furniture: string,
): RoomSpot {
  return { name, areaSqm, rent, privateBath, light, balcony, furniture };
}

export const mockRooms: readonly PublishedRoom[] = [
  {
    id: "room-chen-yu",
    ownerId: "chen-yu",
    cityId: "shanghai",
    areaId: "xuhui",
    community: "衡复小路",
    address: "衡复路 18 号",
    wholeRent: 7800,
    layout: "2室1厅",
    areaSqm: 72,
    bedrooms: 2,
    baths: 1,
    ownRoom: spot("朝南主卧", 16, 4200, false, "光线好", true, "床、衣柜、书桌"),
    roommateRoom: spot("朝东次卧", 11, 3600, false, "光线一般", false, "床和衣柜"),
    moveIn: "2026年12月",
    requirements: "作息可以晚一点。公共区域用完最好当天收。",
    photos: ["living", "master", "second"],
  },
  {
    id: "room-jiang-he",
    ownerId: "jiang-he",
    cityId: "shanghai",
    areaId: "xuhui",
    community: "龙华绿苑",
    address: "龙华路 6 号",
    wholeRent: 8600,
    layout: "3室1厅",
    areaSqm: 90,
    bedrooms: 3,
    baths: 2,
    ownRoom: spot("主卧", 18, 0, true, "光线好", true, "床、衣柜、空调"),
    roommateRoom: spot("空出来的次卧", 12, 3200, true, "光线好", false, "床、衣柜、书桌"),
    moveIn: "2026年12月",
    requirements: "会和伴侣一起住，还空一间。希望家里整洁、作息偏早。",
    photos: ["living", "second", "kitchen"],
  },
  {
    id: "room-tang-ning",
    ownerId: "tang-ning",
    cityId: "shanghai",
    areaId: "jingan",
    community: "静安小院",
    address: "愚园路 2 号",
    wholeRent: 9800,
    layout: "2室1厅",
    areaSqm: 68,
    bedrooms: 2,
    baths: 1,
    ownRoom: spot("主卧", 15, 5600, false, "光线一般", false, "床、衣柜"),
    roommateRoom: spot("次卧", 12, 4200, false, "光线好", true, "床、衣柜、书桌"),
    moveIn: "2027年2月",
    requirements: "只考虑男生室友。伴侣不一起住。",
    photos: ["living", "second", "balcony"],
  },
  {
    id: "room-zhao-qiming",
    ownerId: "zhao-qiming",
    cityId: "beijing",
    areaId: "haidian",
    community: "中关村嘉园",
    address: "中关村大街 88 号",
    wholeRent: 9000,
    layout: "3室1厅",
    areaSqm: 96,
    bedrooms: 3,
    baths: 2,
    ownRoom: spot("主卧", 17, 0, true, "光线好", true, "床、衣柜、空调"),
    roommateRoom: spot("空房", 13, 3500, false, "光线一般", false, "床和书桌"),
    moveIn: "2027年3月或更晚",
    requirements: "和伴侣一起住，再找一个人。预算可以高一些。",
    photos: ["master", "second", "kitchen"],
  },
];

export const fakeListings: readonly FakeListing[] = [
  {
    id: "listing-01",
    cityId: "shanghai",
    areaId: "xuhui",
    community: "康健小区",
    rent: 6500,
    layout: "2室1厅",
    baths: 1,
    areaSqm: 68,
    metro: "1号线步行 8 分钟",
    amenities: ["电梯", "可做饭", "阳台"],
    description: "两间卧室都能住人，客厅朝南。",
    lat: 31.16,
    lng: 121.42,
    nearby: ["metro", "market", "park", "gym"],
    photoId: "living",
  },
  {
    id: "listing-02",
    cityId: "shanghai",
    areaId: "xuhui",
    community: "田林新村",
    rent: 9000,
    layout: "3室1厅",
    baths: 2,
    areaSqm: 95,
    metro: "9号线步行 12 分钟",
    amenities: ["电梯", "两卫", "可做饭"],
    description: "三间房，适合再找一位室友。",
    lat: 31.176,
    lng: 121.41,
    nearby: ["metro", "snacks", "market", "store"],
    photoId: "master",
  },
  {
    id: "listing-03",
    cityId: "shanghai",
    areaId: "yangpu",
    community: "控江路小区",
    rent: 5800,
    layout: "2室1厅",
    baths: 1,
    areaSqm: 62,
    metro: "8号线步行 6 分钟",
    amenities: ["近地铁", "可做饭"],
    description: "总价低一些，没有电梯。",
    lat: 31.275,
    lng: 121.52,
    nearby: ["metro", "snacks"],
    photoId: "second",
  },
  {
    id: "listing-04",
    cityId: "shanghai",
    areaId: "yangpu",
    community: "五角场小区",
    rent: 4200,
    layout: "1室1厅",
    baths: 1,
    areaSqm: 40,
    metro: "10号线步行 10 分钟",
    amenities: ["电梯", "采光好"],
    description: "只有一间卧室，两个人住会挤。",
    lat: 31.3,
    lng: 121.512,
    nearby: ["metro", "snacks", "market", "park", "gym", "store"],
    photoId: "balcony",
  },
  {
    id: "listing-05",
    cityId: "shanghai",
    areaId: "pudong",
    community: "花木小区",
    rent: 8000,
    layout: "2室2厅",
    baths: 2,
    areaSqm: 88,
    metro: "2号线步行 9 分钟",
    amenities: ["电梯", "两卫", "阳台"],
    description: "客厅大，卫生间有两个。",
    lat: 31.21,
    lng: 121.545,
    nearby: ["park", "market", "hospital"],
    photoId: "living",
  },
  {
    id: "listing-06",
    cityId: "shanghai",
    areaId: "pudong",
    community: "北蔡小区",
    rent: 12000,
    layout: "3室2厅",
    baths: 2,
    areaSqm: 110,
    metro: "13号线步行 14 分钟",
    amenities: ["电梯", "两卫", "可做饭", "储藏"],
    description: "面积大，整租数字更高。",
    lat: 31.182,
    lng: 121.545,
    nearby: ["market", "hospital"],
    photoId: "kitchen",
  },
  {
    id: "listing-07",
    cityId: "shanghai",
    areaId: "jingan",
    community: "南京西路小区",
    rent: 9800,
    layout: "2室1厅",
    baths: 1,
    areaSqm: 70,
    metro: "2号线步行 5 分钟",
    amenities: ["电梯", "近地铁", "采光好"],
    description: "地段靠中心，租金高。",
    lat: 31.23,
    lng: 121.455,
    nearby: ["metro", "snacks", "hospital", "store"],
    photoId: "master",
  },
  {
    id: "listing-08",
    cityId: "shanghai",
    areaId: "jingan",
    community: "曹家渡小区",
    rent: 15000,
    layout: "3室1厅",
    baths: 2,
    areaSqm: 120,
    metro: "7号线步行 7 分钟",
    amenities: ["电梯", "两卫", "阳台", "可做饭"],
    description: "三室，预算要够。",
    lat: 31.232,
    lng: 121.43,
    nearby: ["metro", "park"],
    photoId: "living",
  },
  {
    id: "listing-09",
    cityId: "shanghai",
    areaId: "xuhui",
    community: "徐家汇小区",
    rent: 7200,
    layout: "2室1厅",
    baths: 1,
    areaSqm: 75,
    metro: "1号线步行 4 分钟",
    amenities: ["电梯", "近地铁", "可做饭"],
    description: "地铁很近，适合通勤。",
    lat: 31.195,
    lng: 121.436,
    nearby: ["metro", "snacks", "market", "hospital", "gym"],
    photoId: "second",
  },
  {
    id: "listing-10",
    cityId: "shanghai",
    areaId: "yangpu",
    community: "新江湾小区",
    rent: 6100,
    layout: "2室1厅",
    baths: 1,
    areaSqm: 66,
    metro: "10号线步行 11 分钟",
    amenities: ["电梯", "可做饭", "阳台"],
    description: "小区安静，楼下可以买菜。",
    lat: 31.33,
    lng: 121.505,
    nearby: ["park", "market", "store"],
    photoId: "kitchen",
  },
];

export function isPhotoId(value: string): value is PhotoId {
  return photoPresets.some((item) => item.id === value);
}

export function photoOf(id: string) {
  return photoPresets.find((item) => item.id === id) ?? photoPresets[0];
}

export function filterListings(
  listings: readonly FakeListing[],
  filter: ListingFilter,
): FakeListing[] {
  return listings.filter((item) => {
    if (filter.areaId !== "any" && item.areaId !== filter.areaId) return false;
    if (filter.layout !== "any" && item.layout !== filter.layout) return false;
    if (filter.baths !== "any" && item.baths !== Number(filter.baths)) return false;
    if (filter.rentMax !== "any" && item.rent > Number(filter.rentMax)) return false;
    if (filter.areaMin !== "any" && item.areaSqm < Number(filter.areaMin)) return false;
    return true;
  });
}

export function findMockRoom(id: string): PublishedRoom | null {
  return mockRooms.find((room) => room.id === id) ?? null;
}

export function findListing(id: string): FakeListing | null {
  return fakeListings.find((item) => item.id === id) ?? null;
}
