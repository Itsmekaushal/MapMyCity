import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  title = 'city-map-app';
  center: google.maps.LatLngLiteral = { lat: 21.0000, lng: 78.0000 };
  zoom = 5;
  defaultCenter: google.maps.LatLngLiteral = { lat: 21.0000, lng: 78.0000 };
  defaultZoom = 4;
  locationData: any[] = [];
  selectedCityIDs: Set<string> = new Set();

  selectedMarker: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('assets/data.json').subscribe(data => {
      this.locationData = data.map(country => ({
        ...country,
        selected: false,
        cities: country.cities.map((city: any) => ({ ...city, selected: false }))
      }));
    });
  }

  onCityToggle(city: any, country: any) {
    if (city.selected) {
      this.selectedCityIDs.add(city.id);
    } else {
      this.selectedCityIDs.delete(city.id);
    }

    const count = this.selectedCityIDs.size;

    if (count === 1) {
      const selectedCityID = Array.from(this.selectedCityIDs)[0];
      for (let country of this.locationData) {
        const match = country.cities.find((city: any) => city.id === selectedCityID);
        if (match) {
          this.center = { lat: match.lat, lng: match.lng };
          this.zoom = 10;
          break;
        }
      }
    } else if (count > 1) {
      this.zoom = 4;
    } else {
      this.center = this.defaultCenter;
      this.zoom = this.defaultZoom;
    }
  }

  onCountryToggle(country: any) {
    country.selected = !country.selected;
    country.cities.forEach((city: any) => {
      city.selected = country.selected;
      if (country.selected) {
        this.selectedCityIDs.add(city.id);
      } else {
        this.selectedCityIDs.delete(city.id);
      }
    });
  }

  displayMarkers(): any[] {
    const markers: any[] = [];
    this.locationData.forEach(country => {
      country.cities.forEach((city: any) => {
        if (this.selectedCityIDs.has(city.id)) {
          markers.push({
            position: { lat: city.lat, lng: city.lng },
            title: city.name,
            description: city.description
          });
        }
      });
    });
    return markers;
  }

  openInfoWindow(marker: MapMarker, markerData: any) {
    this.selectedMarker = markerData;
    this.infoWindow.open(marker);
  }
}
