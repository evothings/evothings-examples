  // Uninstall library in application.
  // see main-window-func.js, removeLibraryFromApp

  // 1. Remove all references in index.html looking like:
  // <script src="libs/<lib>/<lib>.js"></script>
  // <link href="libs/<lib>/<lib>.css">
  var indexPath = APP_SETTINGS.getIndexFileFullPath(path)
  var html = FILEUTIL.readFileSync(indexPath)
  var scriptPath = `libs/${lib}/material.js`
  var cssPath = `libs/${lib}/material.css`
  var googleFonts = `libs/${lib}/icons/material-icons.css`

  var cher = CHEERIO.load(html, { xmlMode: false })
  var element = cher('script').filter(function(i, el) {
    return cher(this).attr('src') === scriptPath
  })
  if (element.length > 0) {
    element.remove()
  }
  var element = cher('link').filter(function(i, el) {
    return cher(this).attr('href') === cssPath
  })
  if (element.length > 0) {
    element.remove()
  }
  var element = cher('link').filter(function(i, el) {
    return cher(this).attr('href') === googleFonts
  })
  if (element.length > 0) {
    element.remove()
  }

  FILEUTIL.writeFileSync(indexPath, cher.html())
  LOGGER.log("Removed " + lib + " from " + path)

  // 2. Remove directory libs/libname
  var libPath = PATH.join(APP_SETTINGS.getLibDirFullPath(path), lib)
  FSEXTRA.removeSync(libPath)
