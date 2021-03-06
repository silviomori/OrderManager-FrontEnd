import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StorageService } from '../../services/storage.service';
import { CustomerDTO } from '../../models/customer.dto';
import { CustomerService } from '../../services/domain/customer.service';
import { API_CONFIG } from '../../config/api.config';
import { Camera, CameraOptions } from '@ionic-native/camera';


@IonicPage()

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})

export class ProfilePage {

  customerDTO: CustomerDTO;
  picture: string;
  cameraOn: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storageService: StorageService,
    public customerService: CustomerService,
    public camera: Camera) {
  }

  ionViewDidLoad() {
    this.loadData();
  }

  loadData() {
    let localUser = this.storageService.getLocalUser();
    if( localUser && localUser.email ) {
      this.customerService.fetchByEmail(localUser.email)
        .subscribe( 
          response => { 
            this.customerDTO = response as CustomerDTO;
            this.getImageIfExists();
          },
          error => {
            if( error.status == 403 ) {
              this.navCtrl.setRoot('HomePage');
            }
          }
        );
    } else {
      this.navCtrl.setRoot('HomePage');
    }
  }

  getImageIfExists() {
    this.customerService.getImageFromBucket(this.customerDTO.id)
      .subscribe(
        response => {
          this.customerDTO.imgUrl = `${API_CONFIG.bucketBaseUrl}/cp${this.customerDTO.id}.jpg`;
        }
      );
  }

  getCameraPicture() {
    
    this.cameraOn = true;

    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      allowEdit: true,
      targetWidth: 200,
      targetHeight: 200,
      cameraDirection: this.camera.Direction.FRONT
    };

    this.camera.getPicture( options ).then(
      (imageData) => {
        this.picture = 'data:image/jpeg;base64,' + imageData;
        this.cameraOn = false;
      },
      (err) => {
        this.cameraOn = false;
      }
    );
  }

  getGalleryPicture() {
    
    this.cameraOn = true;

    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
      allowEdit: true,
      targetWidth: 200,
      targetHeight: 200
    };

    this.camera.getPicture( options ).then(
      (imageData) => {
        this.picture = 'data:image/jpeg;base64,' + imageData;
        this.cameraOn = false;
      },
      (err) => {
        this.cameraOn = false;
      }
    );
  }

  sendProfilePicture() {
    this.customerService.uploadProfilePicture( this.picture )
      .subscribe(
        response => {
          this.picture = null;
          this.loadData();
        },
        error => {}
      );
  }

  cancelProfilePicture() {
    this.picture = null;
  }
}
