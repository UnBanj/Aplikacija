import { Controller } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Category } from "src/entities/category.entity";
import { CategoryServise } from "src/services/category/category.servise";

@Controller('api/category')
@Crud({
    model: {
        type: Category
    },
    params: {
        id: {
            field: 'categoryId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            categories: {
                eager: true
            },
            parentCategory: {
                eager: false
            },
            features: {
                eager: true
            },
            articles: {
                eager: false
            }
        }
    }
})
export class CategoryController {
    constructor(public service: CategoryServise){ }
}