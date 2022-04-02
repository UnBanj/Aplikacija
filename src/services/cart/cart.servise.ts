import { Injectable } from "@nestjs/common";
import { REQUEST_CONTEXT_ID } from "@nestjs/core/router/request/request-constants";
import { InjectRepository } from "@nestjs/typeorm";
import { Article } from "src/entities/article.entity";
import { CartArticle } from "src/entities/cart-article.entuty";
import { Cart } from "src/entities/cart.entity";
import { Order } from "src/entities/order.entity";
import { Repository } from "typeorm";

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly cart: Repository<Cart>,
   
        @InjectRepository(CartArticle)
        private readonly cartArticle: Repository<CartArticle>,
        
        @InjectRepository(Article)
        private readonly article: Repository<Article>,

        @InjectRepository(Order)
        private readonly order: Repository<Order>
    ){ }

    async getLastActiveCartByUserId(userId: number): Promise<Cart | null>{
        const carts = await this.cart.find({ //spisak svih korpi
           where: {
               userId: userId    //koje odgovaraju tom korisniku
           },
           order: {
               createdAt: "DESC", //Izvuci ih u opadajucem poretku
           },
           take: 1,//poslednja(jedna) pronadjena korpa
           relations: ["order"],
        });

        if(!carts || carts.length === 0){
            return null;
        }

        const cart = carts[0];

        if(cart.order !== null){
            return null;
        }

        return cart;

    }
    //Pravimo novu korpu za korisnika
    async createNewCartForUser(userId: number): Promise<Cart> {
        const newCart: Cart = new Cart();
        newCart.userId = userId;
        return await this.cart.save(newCart);
    }
    //dodavanje artikla u korpu
    async addArticleToCart(cartId: number, articleId: number, quantity:number): Promise<Cart> {
         let record: CartArticle = await this.cartArticle.findOne({
             cartId: cartId,
             articleId: articleId,
         });

         if(!record){
             record = new CartArticle();
             record.cartId = cartId;
             record.articleId = articleId;
             record.quantity = quantity;
             
         } else {
             record.quantity += quantity;//ako vec postoji u korpi povecaj kolicinu samo
         }

         await this.cartArticle.save(record);

         return this.getById(cartId);
    }

     async getById(cartId: number): Promise<Cart> {
        return await this.cart.findOne(cartId, {
            relations: [
                "user",
                "cartArticles",
                "cartArticles.article",
                "cartArticles.article.category"
            ],
        });
     }

     async changeQuantity(cartId: number, articleId: number, newQuantity: number): Promise<Cart>{
        let record: CartArticle = await this.cartArticle.findOne({
            cartId: cartId,
            articleId: articleId,
        });

        if(record) {
        record.quantity = newQuantity;
        if(record.quantity === 0){
            await this.cartArticle.delete(record.cartArticleId);
        }else {
            await this.cartArticle.save(record);
        }
      }
        return await this.getById(cartId);
     }
}
    