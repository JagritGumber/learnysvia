import {useQuery} from "@tanstack/react-query"

export const useCatalogs = () => useQuery({
  queryKey: ['catalogs'],
  queryFn: async () => {
    
  }
})