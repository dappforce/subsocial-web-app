export type Category = {
  title: string,
  color: string,
  children: Category[]
};

export type TopicData = {
  title: string;
  description: string;
  time: Date;
  commentsCount: number;
  score: number;
  isPinned: boolean;
  category: Category
};
