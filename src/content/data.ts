export interface IMockPost {
  id: number
  author: number
  date: {
    month: number;
    day: number;
    year: number;
  }
  title: string
  body?: string
}

export const MockPostDatabase: Array<IMockPost> = [
  {
    id: 1,
    author: 1,
    date: {
      month: 6,
      day: 22,
      year: 2015,
    },
    title: 'How to Feel Better About Yourself Without Being a Jerk',
    body: '',
  },
  {
    id: 2,
    author: 2,
    date: {
      month: 8,
      day: 14,
      year: 2016,
    },
    title: 'How to Travel on $5',
    body: '',
  },
  {
    id: 3,
    author: 1,
    date: {
      month: 1,
      day: 4,
      year: 2017,
    },
    title: 'Live Longer in 250 Easy Steps',
    body: '',
  },
  {
    id: 4,
    author: 3,
    date: {
      month: 4,
      day: 10,
      year: 2016,
    },
    title: 'My Therapist Said to Write How I Feel',
    body: '',
  },
]

export function findPost(id: number): IMockPost | undefined {
  return MockPostDatabase.filter((next) => {
    return next.id === id
  })[0]
}
