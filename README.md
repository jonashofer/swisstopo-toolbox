# Swisstopo Toolbox
Welcome to our approach on bringing geodata closer to the user. This is our semester project during our Bachelor studies at the Bern University of Applied Sciences (BFH). 

Try it out at: [swisstopo-showcases.netlify.app/address-to-coordinate](https://swisstopo-showcases.netlify.app/address-to-coordinate)

![Adding address](src/assets/cookbook/pictures/en-swisstopo-add-cast.gif)

## Application
Information about the application internals and instructions on how to run it can be found in our [Technical Documentation](technical_documentation/README.md).

## User guide
The complete guide and overview of the functionality from the users perspective can be found in the [Cookbooks](src/assets/cookbook/cookbook-en.md) which are also available in the application itself.

## Goal / Background
In cooperation with [@David Oesch](https://github.com/davidoesch), we tried to bring geodata closer to a broader user audience. We did this by implementing ideas from the [GeoUnconference](https://github.com/GeoUnconference/discussions/discussions/4).

With our application, swiss addresses can be searched, which are then displayed in 3 different coordinate systems and on a map. Additionally there is a file upload and some comfort functions.

If you wish for further documentation of the project, please reach out. We developed the application on the internal GitLab of the BFH along with documenting the whole process for our studies. We extracted the code part and created this new public repository to present our work.

## Attributions
We'd like to thank the following people for their involvement in this project:

- **D. Oesch** Coach from swisstopo side
- **B. Fehrensen** Project supervision from BFH side 
- **M. Luggen** Initiator of project collaboration with swisstopo
- **S. Tuscano** Italian translations
- **T. Lombris** Romansh translations

## Known Bugs
* When switching to Romansh language, an error message is shown because Oblique does not provide a romansh translation file.
* If there are API errors, the application gets "stuck" and needs to be reloaded.
* When using the list input via paste or the file upload, the mechanism to identify unique addresses is too basic. If more than one result is returned from the api search, it is no longer considered unique. However, a full hit of the address (e.g. `input`==`apiResult.address`==`'Mattenstrasse 18'`) should be considered unique despite another similar but longer result (e.g. `apiResult.address`==`'Mattenstrasse 18xyz'`) from the api search.
