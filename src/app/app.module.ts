import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { environment } from '../environments/environment';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { IonicStorageModule } from '@ionic/storage';

import { Camera } from '@ionic-native/camera/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { ComponentsModule } from './components/components.module';
import { PipesModule } from './pipes/pipes.module';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import { HTTP } from '@ionic-native/http/ngx';

// the second parameter 'fr-FR' is optional
registerLocaleData(localeEs, 'es');
const configIO: SocketIoConfig = { url: environment.URL_SERVER, options: {} };

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    PipesModule,
    SocketIoModule.forRoot(configIO),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    ComponentsModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    FilePath,
    // tslint:disable-next-line: deprecation
    FileTransfer,
    Geolocation,
    NativeGeocoder,
    OneSignal,
    Insomnia,
    SocialSharing,
    LaunchNavigator,
    BackgroundGeolocation,
    HTTP,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
