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
import { Globalization } from '@ionic-native/globalization/ngx';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

// the second parameter 'fr-FR' is optional
registerLocaleData(localeEs, 'es');
const configIO: SocketIoConfig = { url: environment.URL_SERVER, options: {} };

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    ComponentsModule,
    PipesModule,
    HttpClientModule,
    SocketIoModule.forRoot(configIO),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule
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
    // tslint:disable-next-line: deprecation
    Globalization,
    LaunchNavigator,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
