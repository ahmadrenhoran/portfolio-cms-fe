import api from "@/api"

export interface Portfolio {
  id: number
  user_id: number
  title: string | null
  description: Record<string, string> | null
  image_url: string | null
  tech_stack: string[] | null
  demo_url: string | null
  repo_url: string | null
  is_featured: boolean
  createdAt: string
  updatedAt: string
}

export const getPortfolios = async () => {
  return api.get('v1/portfolios')
}

export const createPortfolio = async (data: Partial<Portfolio>) => {
  return api.post('v1/portfolios', data)
}

export const updatePortfolio = async (id: number, data: Partial<Portfolio>) => {
  return api.patch(`v1/portfolios/${id}`, data)
}

export const deletePortfolio = async (id: number) => {
  return api.delete(`v1/portfolios/${id}`)
}
