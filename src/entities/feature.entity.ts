import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./category.entity";
import { ArticleFeature } from "./article-feature.entity";
import { Article } from "./article.entity";
import * as Validator from 'class-validator';

@Index("fk_feature_category_id", ["categoryId"], {})
@Index("uq_feature_name_category_id", ["name", "categoryId"], { unique: true })
@Entity("feature")
export class Feature {
  @PrimaryGeneratedColumn({ type: "int", name: "feature_id", unsigned: true })
  featureId: number;

  @Column("varchar", {length: 32})
  @Validator.IsNotEmpty()
  @Validator.IsString()
  @Validator.Length(5,32)
  name: string;

  @Column("int", { name: "category_id", unsigned: true})
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.features, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "category_id", referencedColumnName: "categoryId" }])
  category: Category;

  @OneToMany(
    () => ArticleFeature, 
    articleFeature=> articleFeature.article
  )
  articleFeatures: ArticleFeature[];

  @ManyToMany(type=> Article, article => article.features)
  @JoinTable({
    name: "article_feature",
    joinColumn: { name: "feature_id", referencedColumnName:"featureId" },
    inverseJoinColumn: { name: "article_id", referencedColumnName: "articleId"}
  })
  articles: Article[];

}
