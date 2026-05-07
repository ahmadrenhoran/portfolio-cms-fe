import api from "@/api"

export interface Resume {
  id: number
  user_id: number
  file_url: string | null
  file_name: string | null
  is_primary: boolean
  uploaded_at: string
}

export const getResumes = async () => {
  return api.get('v1/resumes')
}

export const uploadResume = async (data: { file_url: string; file_name: string; is_primary?: boolean }) => {
  return api.post('v1/resumes/upload', data)
}

export const deleteResume = async (id: number) => {
  return api.delete(`v1/resumes/${id}`)
}

export const setPrimaryResume = async (id: number) => {
  return api.patch(`v1/resumes/${id}/primary`)
}
