export type ServiceItem = {
  id: number;
  title: string;
  description: string;
};

export const services: ServiceItem[] = [
  {
    id: 1,
    title: "Detailing",
    description: "Комплексный уход за кузовом и салоном автомобиля.",
  },
  {
    id: 2,
    title: "Polishing",
    description:
      "Глубокая полировка для восстановления блеска и глубины цвета.",
  },
  {
    id: 3,
    title: "Ceramic Coating",
    description: "Долговременная защита кузова и эффектный внешний вид.",
  },
  {
    id: 4,
    title: "Interior Cleaning",
    description: "Премиальная химчистка и восстановление чистоты салона.",
  },
];
