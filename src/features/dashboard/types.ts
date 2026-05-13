export interface StatItem {
  total: number
  active?: number
  published?: number
  draft?: number
  suspended?: number
  banned?: number
}

export interface DashboardStats {
  blogs: StatItem
  partners: StatItem
  services: StatItem
  courses: StatItem
  faqs: StatItem
  testimonials: StatItem
  users: StatItem
}

export interface DashboardStatsResponse {
  status: string
  message: string
  data: DashboardStats
}
