export type MealItem = {
  name: string;
  portion: string;
  allergens: string;
};

export type MealSection = {
  items: MealItem[];
};

export type DayMenu = {
  date: string;
  dayName: string;
  energyValues: string;
  breakfast: MealSection;
  lunch: MealSection;
  snack: MealSection;
};

export interface MenuData {
  weekRange: string;
  facility: string;
  pageNumber: string;
  days: DayMenu[];
  allergenLegend?: string;
  notes?: string;
  chef?: string;
  headChef?: string;
  pdfUrl: string;
}


