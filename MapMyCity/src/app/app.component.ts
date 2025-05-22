import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

  title = 'city-map-app';
  center: google.maps.LatLngLiteral = { lat: 21.0, lng: 78.0 };
  zoom = 5;
  defaultCenter: google.maps.LatLngLiteral = { lat: 21.0, lng: 78.0 };
  defaultZoom = 4;
  locationData: any[] = [];
  selectedCityIDs: Set<string> = new Set();
  selectedMarker: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('assets/data.json').subscribe((data) => {
      this.locationData = data.map((country) => ({
        ...country,
        selected: false,
        cities: country.cities.map((city: any) => ({
          ...city,
          selected: false,
        })),
      }));
    });
  }

  openInfoWindow(marker: MapMarker, markerData: any) {
    this.selectedMarker = markerData;
    this.infoWindow.open(marker);
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
      for (let i of this.locationData) {
        const match = i.cities.find((res: any) => res.id === selectedCityID);
        if (match) {
          this.center = { lat: match.lat, lng: match.lng };
          break;
        }
      }
      this.zoom = 10;
    } else if (count > 1) {
      this.zoom = 4;
    } else {
      this.center = this.defaultCenter;
      this.zoom = this.defaultZoom;
    }
  }

  onCountryToggle(country: any) {
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
    this.locationData.forEach((country) => {
      country.cities.forEach((city: any) => {
        if (this.selectedCityIDs.has(city.id)) {
          markers.push({
            position: { lat: city.lat, lng: city.lng },
            title: city.name,
            description: city.description,
          });
        }
      });
    });
    return markers;
  }
}
