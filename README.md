# Examples for Evothings Studio

## Example app bundled with Evothings Studio

Apps in folder [generated/examples](https://github.com/evothings/evothings-examples/tree/master/generated/examples) are included in the [Evothings Studio download](http://evothings.com/dowload).

## Folder structure

Apps in folder [generated/experiments](https://github.com/evothings/evothings-examples/tree/master/generated/experiments) are under development and are not guaranteed to work. These are not bundled with Evothings Studio.

Example app source files are in folders 'examples' and 'experiments'. Note that these cannot be run as is. If you wish to run the examples in Evothings Viewer or build a stand-alone Cordova app, use the code in folder 'generated'.

To add an app to Evothings Workbench that is not included with the download, drag and drop the index.html file of the app you wish to add into the Workbench window.

CSS files and other files shared across apps are in folder 'resources'.

## Library files

Library files used by the example apps are found in repository [evothings-libraries](https://github.com/evothings/evothings-libraries).

## Build script

If you wish to build the files in the 'generated' folder yourself, use the Ruby script 'build.rb'. This script copies files from folders 'examples', 'experiments' and 'resources' to the target folder 'generated'. Library files from 'evothings-libraries' are also copied to 'generated'.

Note that the 'evothings-libraries' repo must be in a sibling folder to this repo for the build script to work. Like this:

    parent-folder
        evothings-libraries
        evothings-examples
            build.rb (run using command 'ruby build.rb')

<!-- To remove files copied by 'build.rb', run 'git clean -fdX'. -->

## Documentation

[Documentation for example apps](https://evothings.com/doc/examples/examples.html) is available at the [Evothings documentation web site](https://evothings.com/doc/).

## It is quick and fun to get started with Evothings Studio

Download Evothings Studio at: [http://evothings.com](http://evothings.com)

It is fast and fun to get started!
