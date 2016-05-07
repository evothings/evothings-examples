# Examples for Evothings Studio
* For **versions older than 2.1.0-alpha6** all the example apps in folder [generated/examples](https://github.com/evothings/evothings-examples/tree/master/generated/examples) are included in the [Evothings Studio download](http://evothings.com/download).
* For **version 2.1.0-alpha6 and forward** all example apps are hosted online at [Evothings.com](https://www.evothings.com/2.1/examples) and are downloaded on demand.

From within Evothings Studio there is no real difference in user experience, but it means we can now push out new examples (and fixes) live without a new release of Evothings Studio.

## Branches
This also means we use a branch per **major.minor** version of Evothings Studio, so all examples valid for Evothings Studio 2.1.x is found in the 2.1 branch. Master is the ongoing work which periodically is merged into the version specific branches.

## Folder structure
Apps in folder [experiments](https://github.com/evothings/evothings-examples/tree/master/experiments) are under development and are not guaranteed to work. They are also not listed in the Evothings Workbench.

Apps in folder [examples](https://github.com/evothings/evothings-examples/tree/master/examples) are maintained and have been verified to work. They are listed in the examples tab inside Evothings Workbench.
CSS files and other files shared across apps are in the folder 'resources'. The examples cannot be run as is, they are built with proper libraries etc into the folder 'generated'. That folder is also what is hosted online.

## Library files
Library files used by the example apps are found in the repository [evothings-libraries](https://github.com/evothings/evothings-libraries).

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
[Download Evothings Studio](http://evothings.com/download) and be up and running with mobile IoT apps in minutes!
