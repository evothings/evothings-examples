# Build script for Evothings Example apps.
#
# How to run:
# ruby build.rb
#

require 'fileutils'

include FileUtils::Verbose

def buildArduinoBLE
	destPath = 'examples/arduino-ble/app'
	copyUIFiles(destPath)
	copyJQueryFiles(destPath)
end

def buildHelloWorld
	destPath = 'examples/hello-world'
	copyUIFiles(destPath)
end

def copyUIFiles(destPath)
	copyDir('resources/ui', destPath)
end

def copyJQueryFiles(destPath)
	copyDir('resources/libs/jquery', destPath + '/libs')
end

def copyDir(srcPath, destPath)
	mkpath(destPath)
	cp_r(srcPath, destPath)
end

def build
	buildArduinoBLE
	buildHelloWorld
end

build
