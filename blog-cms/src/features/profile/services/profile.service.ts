import api from "@/api"

export const updateProfile = async (data: { username?: string; name?: string }) => {
  return api.patch('v1/user/profile', data)
}
