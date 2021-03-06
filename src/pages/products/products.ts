import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading } from 'ionic-angular';
import { ProductDTO } from '../../models/product.dto';
import { ProductService } from '../../services/domain/product.service';
import { API_CONFIG } from '../../config/api.config';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../services/storage.service';

@IonicPage()

@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
})

export class ProductsPage {

  categoryName: string;

  currency: string;

  items : ProductDTO[] = [];

  page : number = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public productService: ProductService,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public storage: StorageService) {

      this.currency = this.storage.getCurrency()

  }

  ionViewDidLoad() {
    this.loadData();
  }

  loadData() {
    this.categoryName = this.navParams.get('categoryName');
    let categoryId = this.navParams.get('categoryId');

    if( categoryId == null ) {
      this.navCtrl.setRoot('CategoriesPage');
      return;
    } 

    let loader = this.presentLoading();
    
    this.productService.fetchByCategory(categoryId, this.page, 10)
      .subscribe(
        response => {
          let start = this.items.length;
          this.items = this.items.concat(response['content']);
          let end = this.items.length-1;

          loader.dismiss();

          if( (end - start) == 0 ) {
            return false;
          } else {
            this.loadImageURLs(start, end);
            return true;
          }
        },
        error => { 
          loader.dismiss();
          return false;
        }
      );
  }
  
  loadImageURLs(start: number, end: number) {
    while( start++ < end ) {
      let item = this.items[start];
      if( item.thumbnailUrl == null ) {
        this.productService.getThumbnailsFromBucket(item.id)
          .subscribe(
            response => { item.thumbnailUrl = `${API_CONFIG.bucketBaseUrl}/prod${item.id}-small.jpg` },
            error => {}
          );
      }
    }
  }

  showDetails(productId: string) {
    this.navCtrl.push('ProductDetailPage', {productId: productId});
  }

  presentLoading(): Loading {
    let loadingStr: string;
    this.translate.get("PLEASE_WAIT").subscribe(
      value => {
        loadingStr = value;
      }
    );

    let loader = this.loadingCtrl.create({
      content: loadingStr
    });
    
    loader.present();
    return loader;
  }

  doRefresh(refresher) {
    this.page = 0;
    this.items = [];
    this.loadData();
    setTimeout(() => {
      refresher.complete();
    }, 500);
  }

  doInfinite(infiniteScroll) {
    this.page++;
    this.loadData();
    setTimeout(() => {
      infiniteScroll.complete();
    }, 2000);
  }

}