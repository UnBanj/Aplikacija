import { Controller } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Feature } from "src/entities/feature.entity";
import { FeatureServise } from "src/services/feature/feature.servise";

@Controller('api/feature')
@Crud({
    model: {
        type: Feature
    },
    params: {
        id: {
            field: 'featureId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            articleFeatures:{
                eager: false
            },
            category: {
                eager: true
            },
            articles: {
                eager: false
            }
        }
    }
})
export class FeatureController {
    constructor(public service: FeatureServise){ }
}