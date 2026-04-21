import type { Country } from "../countries/types";

export interface Service {
            id: number,
            slug: string,
            image: string,
            title: string,
            description: string,
            sort_order: number,
            is_active: boolean,
            highlight_description: string,
            media_url: string,
            media_type: string,
            meta_title: string,
            meta_description: string,
            countries : Country[],
            created_at: string
        }

        export interface GetServicesResponse {
    status: "true",
    message: string,
    data: Service[]
        }