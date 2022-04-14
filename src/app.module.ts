import { MailerModule } from '@nestjs-modules/mailer';
import { MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from 'config/database.configuration';
import { MailConfig } from 'config/mail.config';
import { Administrator } from 'src/entities/administator.entity';
import { ArticleFeature } from 'src/entities/article-feature.entity';
import { ArticlePrice } from 'src/entities/article-price.entity';
import { Article } from 'src/entities/article.entity';
import { CartArticle } from 'src/entities/cart-article.entuty';
import { Cart } from 'src/entities/cart.entity';
import { Category } from 'src/entities/category.entity';
import { Feature } from 'src/entities/feature.entity';
import { Order } from 'src/entities/order.entity';
import { Photo } from 'src/entities/photo.entity';
import { User } from 'src/entities/user.entity';
import { AdministratorController } from './controllers/api/administrator.controller';
import { AdministratorOrderController } from './controllers/api/administrator.order.controller';
import { ArticleController } from './controllers/api/article.controller';
import { AuthController } from './controllers/api/auth.controller';
import { CategoryController } from './controllers/api/category.controller';
import { FeatureController } from './controllers/api/feature.controller';
import { UserCartController } from './controllers/api/user.cart.controller';
import { AppController } from './controllers/app.controller';
import { UserToken } from './entities/user-token.entity';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { AdministratorService } from './services/administrator/administrator.service';
import { ArticleServise } from './services/article/article.servise';
import { CartService } from './services/cart/cart.servise';
import { CategoryServise } from './services/category/category.servise';
import { FeatureServise } from './services/feature/feature.servise';
import { OrderMailer } from './services/order/order.mailer.service';
import { OrderService } from './services/order/order.service';
import { PhotoServise } from './services/photo/photo.service';
import { UserServise } from './services/user/user.servise';



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DatabaseConfiguration.hostname,
      port: 3306,
      username: DatabaseConfiguration.username,
      password: DatabaseConfiguration.password,
      database: DatabaseConfiguration.database,
      entities: [
        Administrator,
        ArticleFeature,
        ArticlePrice,
        Article,
        CartArticle,
        Cart,
        Category,
        Feature,
        Order,
        Photo,
        User,
        UserToken
      ]
    }),
    TypeOrmModule.forFeature([
      Administrator,
      ArticleFeature,
      ArticlePrice,
      Article,
      CartArticle,
      Cart,
      Category,
      Feature,
      Order,
      Photo,
      User,
      UserToken
    ]),
    MailerModule.forRoot({
      //smtps://username:password@smtp.gmail.com
      transport: { /* 'smtps://' + MailConfig.username + ':'+
                              MailConfig.password + '@'+
                              MailConfig.hostname, */
      host: MailConfig.hostname,
      port: 587,
      secure: false,
      auth: {
        user: MailConfig.username,
        pass: MailConfig.password
      },
      tls: {
        rejectUnauthorized: false
      }
    },
      defaults: {
        from: MailConfig.senderEmail,

      }
    }),
  ],
  controllers: [
    AppController,
    AdministratorController,
    CategoryController,
    ArticleController,
    AuthController,
    FeatureController,
    UserCartController,
    AdministratorOrderController
  ],
  providers: [
    AdministratorService,
    CategoryServise,
    ArticleServise,
    PhotoServise,
    FeatureServise,
    UserServise,
    CartService,
    OrderService,
    OrderMailer
  
  ],
  exports: [ //da bi bio dostupan i van modula (Middleware-u)
    AdministratorService,
    UserServise
  ]
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(AuthMiddleware)
    .exclude('auth/*')
    .forRoutes('api/*');
  }

}
