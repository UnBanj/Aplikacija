import { SetMetadata } from "@nestjs/common"
// ... - niz pojedinacnih elemenata 
export const AllowToRoles = (...roles: ("administrator"| "user")[])=> {
    return SetMetadata('allow_to_roles',roles);
}