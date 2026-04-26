import "axios"

declare module "axios" {
  export interface AxiosRequestConfig {
    suppressErrorToast?: boolean
  }
}
