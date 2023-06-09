# Technical Documentation
This document gives a technical overview of the application and also shows how to run and develop it.

![System-overview](system-overview.png)

In this system overview, the dotted line indicates the official [geo.admin.ch](https://geo.admin.ch) portal, where the application is integrated via iFrame.

## Angular
The application is a standard, single-page [Angular](https://angular.io) application. It uses [TypeScript](https://www.typescriptlang.org) for having type-safety with javascript and [SCSS](https://sass-lang.com) for styling.

### Oblique framework
The page uses [Oblique](https://oblique.bit.admin.ch/oblique) ([GitHub](https://github.com/oblique-bit/oblique)), which is a Material-based framework for swiss branded applications. It is developed by the Federal Office of Information Technology, Systems and Telecommunication [FOITT](https://bit.admin.ch).

It does more than just provide components, since it also handles the site layout and provides many handy services, e.g. for notifications or handling HttpClient errors.

### Modules
Besides the standard routing module, the application consists only of the root module.
The close relation of all features and the overall size and complexity did not require splitting into further modules yet.

## Environments
The current [environments](../src/environments/environment.ts) are reflected in [angular.json](../angular.json) and in the projects GitHub actions.

|                          | local                                   | BFH                                                                                      | PROD                                                                                 |
| ------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
|                          | default config                          | GitHub pages hosting                                                                     | cms.geo.admin.ch hosting                                                             |
| URL:                     | [localhost:4200](http://localhost:4200) | [jonashofer.github.io/swisstopo-toolbox](https://jonashofer.github.io/swisstopo-toolbox) | [cms.geo.admin.ch/showcase/index.html](https://cms.geo.admin.ch/showcase/index.html) |
| GitHub action:           | none                                    | [bfh.yml](../.github/workflows/bfh.yml) - Build & deploy to GitHub pages                 | [cms-geo.yml](../.github/workflows/cms-geo.yml) - Build only, manual artifact deploy |
| Banner:                  | standard oblique LOCAL banner           | BFH banner in BFH colors                                                                 | no banner                                                                            |
| GitHub link:             | no link                                 | github.com/jonashofer/swisstopo-toolbox                                                  | no link                                                                              |
| base-href:               | none                                    | /swisstopo-toolbox/                                                                      | /showcase/index.html                                                                 |

> Because of the projects history, there still also is a [Netlify](https://app.netlify.com/sites/swisstopo-showcases/overview) hosting ([swisstopo-showcases.netlify.app](https://swisstopo-showcases.netlify.app)).
However, this is only kept alive for early adopters that are using the application since prototype phase and rely on the link.

### Banner:
The banner is a component of the oblique framework to indicate the current environment in the header.
For non-prod and non-official enviorments, the banner is recommended to avoid confusion.

### GitHub link:
There is the ability to provide an external link that will be displayed with the GitHub icon in the navigation,
as this is often used for GitHub-pages hosted applications.

### base-href:
This [angular configuration parameter](https://angular.io/guide/deployment#the-base-tag) is needed for correct relative URLs when 
the page is served under a subpath.
When including `[index.html]` in there, it also prevents angular from rewriting the URLs to the root path, which can lead to 404s on browser reloading.

In this context it is also noteworthy that the application uses [hash-based routing](https://angular.io/guide/router#locationstrategy-and-browser-url-styles).
In [combination](https://angular.io/guide/router#base-href) with the `base-href`, this supports all current hosting scenarios.

## iFrame integration
The application can be used in a "headless" mode, when it is embedded in an iFrame.
This is the case for the [geo.admin.ch](https://geo.admin.ch) integration.
There are two possible query params to control the mode.

### Headless mode `?headless=true`
This param hides header, navigation and footer and removes the responsive breakpoints which leads to full-width content.
> Because this hides the navigation, the specific feature pages need to be access directly via the url.

_Forcing headless mode_: 
For the case where the application is embedded in an iFrame, but then opened in a new tab (with the same url),
we want to see the full application again. Therefore, the `headless` param is only applied when the application detects that it runs in an iFrame.
For demonstration or debugging purposes, you can force the headless mode - also when not in an iFrame - by using `?force-headless=true`.

### Language `?lang=en`
Because the language switcher is not available in headless mode, the language can be set via the url parameter `lang`.
Possible values are `de`, `fr`, `it`, `rm` and `en`.

## Architecture
The application architecture follows the general angular approach.
With focus on how the different features are organized, the structure looks like this:
```
+-- src
    +-- app
	    +-- feature-components
			+-- address-to-coordinate.component.ts
			+-- coordinate-to-address.component.ts
				etc.
		+-- feature-services
			+-- address-to-coordinate.feature.ts
			+-- coordinate-to-address.feature.ts
				etc.
	    +-- shared
			+-- components/
				+-- feature-tab/
					+-- feature-tab.component.ts
					+-- feature-tab.component.html
			+-- services/
					...
				+-- feature.service.ts
					...
			+-- models/
	+-- assets/
	+-- styles/
	+-- environments/
		...
```
Since all features follow the same pattern, the components and services are organized in feature folders.

### Feature component
From a functionality standpoint, the general [feature-tab](../src/app/shared/components/feature-tab) is the top-most component used
for all feature tabs.

It gets wrapped by the individual specific feature component to provide the correct dependencies and then registered in the routing.

_address-to-coordinate.component.ts:_
```js
@Component({
  selector: 'app-address-to-coordinate',
  template: `<app-feature-tab></app-feature-tab>`,
  providers: getFeatureProviders(AddressToCoordinateService)
})
export class AddressToCoordinateComponent {}
```

_app-routing.module.ts:_
```js
	//...
	{ path: 'address-to-coordinate', component: AddressToCoordinateComponent }
	//...
```

### Feature service
Each feature has its own service, which implements the `FeatureService` interface. 
To help with that, there is the abstract base class `FeatureServiceBase` which is co-located in [feature.service.ts](../src/app/shared/services/feature.service.ts).

To register the correct feature service in the angular dependency injection, the `getFeatureProviders()` function is used.
It ensures that all services or components who inject the `FeatureService` interface via the `InjectionToken`
get the correct instance.

_Functionality:_
A feature service needs to provide the essential building blocks for the user flow, most importantly:
| Name                             | Type                               | Responsibility                                                                            |
|----------------------------------|------------------------------------|-------------------------------------------------------------------------------------------|
| `name`                       | string                             | name of the feature for localstorage, download, and labels                                |
| `showCoordinateSystemSwitch` | boolean                            | whether the coordinate switcher should be shown, `false` for EGID and height features |
| `validateSearchInput()`      | string -> string                   | statically validate the user input                                                        |
| `search()`                   | string -> dropdown-item            | perform the API search, display the possiblities                                          |
| `transformInput()`           | dropdown-item -> result-row        | transform the dropdown entry into a table result row                                      |
| `transformEntryForEdit()`    | result-row -> string               | transform the result-row back into the input for editing                                  |
| `getDefaultColumns()`        | list of columns                    |                                                                                           |
| `getExampleFileContent()`    | string                             |                                                                                           |
| `searchMultiple()`           | list of strings -> list of results | handle file-upload or multi-line pasting                                                  |

The `searchMultiple()` function is implemented in the base class only, since it is the same for all features.
It generically uses the single-item functions to perform the search+transformation for each item in a batched parallel manner.

### Activity flow
Visualized as an activity diagram, the user flow when using a feature looks like this:
![Activity diagram](activitydiagramm.png)

## Internationalization
Oblique uses [ngx-translate](https://github.com/ngx-translate/core).
Our site is multilingual because there are four main languages in Switzerland and english is also provided:
- Deutsch, Français, Italiano, Bündnerromanisch, English

The language bindings can be found in **[i18n](../src/assets/i18n)**.

> Note on Rumantsch: Oblique does not provide a Rumantsch translation for Oblique labels, this is why `oblique-rm.json` exists.

## Map
The map is implemented with [OpenLayers](https://openlayers.org/), a widely popular mapping library.

## Coordinate systems
There are currently three cordinate systems supported, which can be selected in the coordinate switch or via the column configuration.
For WGS84, 4 decimal places are used, for LV95 and LV03, 2 decimal places are used.

| Coordinate system |
|-------------------|
| WGS84 / GPS       |
| CH1903+ / LV95    |
| CH1903 / LV03     |

## Consumed APIs / Services
For every geo-related functionality in the application, an API from [`geo.admin.ch`](https://api.geo.admin.ch) is used.
Because of the anonymous fair-use policy, there is no need for authentication at all.

| Service                               | Usage                  | Params / Remarks                                                                         | Example                                                                                                                     |
| ------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| api.geo.admin.ch:                     |                        |                                                                                          |                                                                                                                             |
| /rest/services/api/SearchServer       | Geocoding              | address search input                                                                     | <https://api.geo.admin.ch/rest/services/api/SearchServer?lang=de&searchText=Seftigenstrasse%20264&type=locations&origins=address> |
| /rest/services/api/MapServer/identify | Reverse geocoding      | coordinates, search extent - always lv95 for extent+tolerance to be meters               | <https://api.geo.admin.ch/rest/services/api/MapServer/identify?mapExtent=0,0,100,100&imageDisplay=100,100,100&tolerance=100&geometryType=esriGeometryPoint&geometry=2600972.33,1197422.82&layers=all:ch.bfs.gebaeude_wohnungs_register&returnGeometry=true&sr=2056> |
| /rest/services/api/MapServer/[layer]  | Building details (GWR) | GWR feature identifier - for querying EGID witch SearchServer result                     | <https://api.geo.admin.ch/rest/services/api/MapServer/ch.bfs.gebaeude_wohnungs_register/1272199_0?returnGeometry=false> |
| /rest/services/api/MapServer/find     | Find buildings         | EGID                                                                                     | <https://api.geo.admin.ch/rest/services/api/MapServer/find?layer=ch.bfs.gebaeude_wohnungs_register&searchText=1272199&searchField=egid&returnGeometry=true&sr=4326&contains=false> |
| /rest/services/height                 | Height                 | coordinates                                                                              | <https://api.geo.admin.ch/rest/services/height?easting=2600972.33&northing=1197422.82> |
|                                       |                        |                                                                                          |                                                                                                                             |
| geodesy.geo.admin.ch/reframe          | Coordinate conversions | coordinates, target system                                                               | <https://geodesy.geo.admin.ch/reframe/wgs84tolv95?northing=46.92793655395508&easting=7.451352119445801&format=json>         |
| wmts.geo.admin.ch                     | Map tiles              | X-Y-Z positions and layer (`ch.swisstopo.pixelkarte-farbe` or `ch.swisstopo.swissimage`) | <https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/18/136498/92279.jpeg>                    |
| map.geo.admin.ch                      | Link to map            | Not directly called - .kml will be uploaded by the user                                  | <https://map.geo.admin.ch>                                                                                                  |

## Columns
Each feature has a set of active default columns. To support more advanced use cases, the user can add/remove/rearrange columns.
The available columns depend on the current feature - e.g. EGID is not availble in the coordinates-to-height feature.
All availble columns are:
- Address
- EGID
- EGRID
- Height
- WGS84
- LV95
- LV03
- Edit function

This is handled in the [column.service.ts](../src/app/shared/services/column.service.ts).
Based on the selected columns, the [address.service.ts](../src/app/shared/services/address.service.ts) will then query the required APIs to retrieve the additional data for the columns.

## Local storage
To enable a smooth user experience and avoid loosing all data when reloading the page, data is saved in the local storage.
This includes
- user language
- map layer
- selected columns (per feature)
- selected coordinate system (per feature)
- results / table-rows (per feature)

Besides that, and the requests made to the APIs, no data is stored or sent anywhere else.

<hr>

# Start and develop
To start the application, run `npm install` in this directory and then run `ng serve`. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io). However, we don't have any automated tests at the moment.

## Formatting
Run `node_modules/.bin/prettier --write "src/**/*.{scss, ts, html}"` to use prettier to format the files based on the rules in `.prettierrc`. 
