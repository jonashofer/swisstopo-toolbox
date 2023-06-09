# swisstopo Toolbox
Geodata should be accessible to everyone in an easy form. This toolbox allows you to do the most common tasks like geocoding, reverse geocoding and coordinate transformation for swiss addresses and coordinate systems in a sleek web interface.

This project is a collaboration between the [Swiss Federal Office of Topography (swisstopo)](https://www.swisstopo.admin.ch/en/home.html) and the [Bern University of Applied Sciences (BFH)](https://www.bfh.ch/en/).

Give it a try at: [jonashofer.github.io/swisstopo-toolbox](https://jonashofer.github.io/swisstopo-toolbox)

![Application overview](technical_documentation/cookbook/pictures/main_screenshot.png)

## Background and Goals
In cooperation with [@David Oesch](https://github.com/davidoesch), ideas from the [GeoUnconference](https://github.com/GeoUnconference/discussions/discussions/4) were implemented during bachelor semester projects at BFH.

This resulted in this toolbox that currently allows the following features:
* Geocoding (address to coordinates)
* Reverse geocoding (coordinates to address)
* Coordinate transformation (between LV95, LV03 and GPS/WGS84)
* EGID and EGRID search (swiss building identifiers)
* Height (for addresses and coordinates)

Lists can be easily imported via copy & paste or file upload. The results can be exported as csv/kml or copied to the clipboard.

## Technical documentation
Information about the application internals and instructions on how to run and extend it can be found in the [Technical Documentation](technical_documentation/README.md).

There is more documentation (also non-technical) available outside this repository, please reach out.

## User guide
Comprehensive user documentation from the first prototype version is available in the [User Guide (v1)](technical_documentation/cookbook/cookbook-en.md). However, it only covers the first prototype version and is therefore outdated.

## Known Issues
* When using the list input via paste or the file upload, the mechanism to identify unique addresses is quiet basic. If more than one result is returned from the api search, it is no longer considered unique. However, a full hit of the address (e.g. `input`==`apiResult.address`==`'Mattenstrasse 18'`) could be considered unique despite another similar but longer result (e.g. `apiResult.address`==`'Mattenstrasse 18xyz'`) from the api search.

## Attributions
J. Hofer, D. Oesch, P.Amado, E. Graf, M. Wiedmer, P. Friedli, B. Fehrensen, M. Luggen, S. Tuscano, T. Lombris
