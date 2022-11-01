import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import DistinctFeatureValuesDto from "src/dtos/feature/distinct.feature.values.dto";
import { Feature } from "src/entities/feature.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
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
    },
    routes: {
        only: [
            "createOneBase",
            "createManyBase",
            "getManyBase",
            "getOneBase",
            "updateOneBase"
        ],
        createOneBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator'),
            ],
        },
        createManyBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator'),
            ],
        },
        getManyBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator','user'),
            ],
        },
        getOneBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator','user'),
            ],
        },
        updateOneBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator'),
            ],
        }

    }
})
export class FeatureController {
    constructor(public service: FeatureServise){ }
     //izvlacimo vrednosti feature-a za odredjenu kategoriju 
    @Get('values/:categoryId')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator','user')
    getDistinctValuesByCategoryId(@Param('categoryId') categoryId: number):Promise<DistinctFeatureValuesDto>{
        return this.service.getDistinctValuesByCategoryId(categoryId);
    }
}